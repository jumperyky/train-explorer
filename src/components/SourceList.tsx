import type { Citation } from "@/data/types";

/**
 * 出典の一覧。
 * 説明文は人が書くしかない（子ども向けの解説を配信するデータベースは存在しない）ので、
 * せめて「どこで裏を取ったか」を大人が辿れるようにしておく。
 * 子どもの読む領域ではないので、意図的に小さく地味に出す。
 */
export default function SourceList({ sources }: { sources: Citation[] }) {
  if (sources.length === 0) return null;

  return (
    <details className="mt-6 text-sm text-foreground/50">
      <summary className="cursor-pointer select-none">出典</summary>
      <ul className="mt-2 flex flex-col gap-1">
        {sources.map((s) => (
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
