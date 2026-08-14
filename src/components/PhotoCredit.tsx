import type { CommonsPhoto } from "@/lib/api";

/**
 * 写真のクレジット表示。
 *
 * Commons の写真の多くは CC BY-SA で、表示に撮影者とライセンスの明示が要る
 * （AttributionRequired=true）。子どもの邪魔にならないよう小さく、
 * ただし必ず出す。CC0 など不要な場合は出典リンクだけにする。
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

  const content = (
    <>
      📷 {label}
      {photo.licenseUrl && photo.license && (
        <>
          {" "}
          <a
            href={photo.licenseUrl}
            target="_blank"
            rel="noreferrer license"
            className="underline"
            onClick={(e) => e.stopPropagation()}
          >
            ライセンス
          </a>
        </>
      )}
    </>
  );

  return (
    <p
      className={`text-[11px] leading-tight text-white/90 ${className ?? ""}`}
      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
    >
      {photo.descriptionUrl ? (
        <a
          href={photo.descriptionUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </p>
  );
}
