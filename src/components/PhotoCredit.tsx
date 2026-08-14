import type { CommonsPhoto } from "@/lib/api";

/**
 * 写真のクレジット表示。
 *
 * Commons の写真の多くは CC BY-SA で、表示に撮影者とライセンスの明示が要る
 * （AttributionRequired=true）。子どもの邪魔にならないよう小さく、ただし必ず出す。
 *
 * **ここはリンクにしない。** 写真の上は誤タップしやすく、1タップで外部サイトへ
 * 出られてしまう。ファイル解説ページと詳しいライセンス条文へのリンクは、
 * 詳細モーダルの「出典」（保護者確認つき）にまとめてある。
 */
export default function PhotoCredit({
  photo,
  className,
}: {
  photo: CommonsPhoto;
  className?: string;
}) {
  if (!photo.imageUrl) return null;

  const parts = [photo.artist, photo.license].filter(Boolean);
  // クレジット不要（CC0/パブリックドメイン）でも出典は示しておく
  const label = parts.length > 0 ? parts.join(" / ") : "Wikimedia Commons";

  return (
    <span
      className={`pointer-events-none text-[11px] leading-tight text-white/90 ${className ?? ""}`}
      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
    >
      📷 {label}
    </span>
  );
}
