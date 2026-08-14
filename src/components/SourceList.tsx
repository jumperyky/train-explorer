import type { Citation, RubyString } from "@/data/types";
import RubyText from "./RubyText";

/**
 * 出典の一覧。
 * 説明文は人が書くしかない（子ども向けの解説を配信するデータベースは存在しない）ので、
 * せめて「どこで裏を取ったか」を大人が辿れるようにしておく。
 * 子どもの読む領域ではないので、意図的に小さく地味に出す。
 */
export default function SourceList({
  sources,
  note,
}: {
  sources: Citation[];
  /** 出典で裏が取れていない部分があるときの但し書き */
  note?: RubyString;
}) {
  if (sources.length === 0) return null;

  // 同じ記事を複数箇所から参照することがあるので重複を消す
  const unique = [...new Map(sources.map((s) => [s.url, s])).values()];

  return (
    <details className="ruby-line mt-6 text-sm text-foreground/50">
      <summary className="cursor-pointer select-none">出典</summary>
      {note && (
        <p className="mt-2">
          <RubyText text={note} />
        </p>
      )}
      <ul className="mt-2 flex flex-col gap-1">
        {unique.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
