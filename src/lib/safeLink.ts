/**
 * 外部リンクのホワイトリスト（要件 機能E）。
 *
 * 子どもの端末で動くアプリなので、外部サイトへ出る導線は
 * 「ここに挙げたホストだけ」に限定する。データに書かれたURLをそのまま
 * リンクにすると、出典を足すときに知らないドメインが混ざりうる。
 *
 * ここに無いURLはリンクにならず、ただの文字として表示される。
 */
const ALLOWED_HOSTS = [
  "ja.wikipedia.org",
  "commons.wikimedia.org",
  "creativecommons.org",
] as const;

export function isAllowedLink(url: string | null | undefined): boolean {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  // http: は中間者に書き換えられるので許可しない
  if (parsed.protocol !== "https:") return false;
  return (ALLOWED_HOSTS as readonly string[]).includes(parsed.hostname);
}

/** Commons のファイル名から、その解説ページのURLを組み立てる */
export function commonsFileUrl(commonsFile: string): string {
  const name = commonsFile.startsWith("File:") ? commonsFile : `File:${commonsFile}`;
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`;
}

export const ALLOWED_LINK_HOSTS: readonly string[] = ALLOWED_HOSTS;
