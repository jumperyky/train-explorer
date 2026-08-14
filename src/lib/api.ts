/**
 * Python(FastAPI) バックエンドの薄いクライアント。
 *
 * バックエンドが起動していない／Vercelに未デプロイでも
 * アプリが壊れないように、失敗はすべて null で返す（内蔵イラストにフォールバック）。
 * ベースURLは NEXT_PUBLIC_API_BASE_URL で差し替えられる（未設定なら同一オリジンの /api/py）。
 */
// ?? ではなく || を使う。Vercel は .env.example から変数を「空文字」で
// 作ることがあり、?? だと空文字がそのまま採用されてURLが壊れるため。
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/py";

export interface WikiImage {
  title: string;
  imageUrl: string | null;
  pageUrl: string | null;
  extract: string | null;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** 車両名・駅名から Wikipedia の代表画像を取得する */
export function fetchImage(title: string, signal?: AbortSignal) {
  return getJson<WikiImage>(`/image?title=${encodeURIComponent(title)}`, signal);
}

/** 動的テキストにルビ記法（かんじ|よみ）を振ってもらう */
export async function fetchRuby(text: string, signal?: AbortSignal) {
  const data = await getJson<{ text: string; ruby: string }>(
    `/ruby?text=${encodeURIComponent(text)}`,
    signal,
  );
  return data?.ruby ?? null;
}
