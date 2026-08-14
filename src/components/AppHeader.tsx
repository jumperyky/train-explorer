import Link from "next/link";
import RubyText from "./RubyText";

/**
 * 画面上部の帯。PWAでURLバーが消えるので、
 * 「もどる」は必ずこのヘッダーの大きなボタンで行えるようにする。
 */
export default function AppHeader({
  title,
  emoji,
  color = "#0b57d0",
  backHref = "/",
}: {
  title: string;
  emoji?: string;
  color?: string;
  backHref?: string;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-3 py-3 text-white shadow-lg"
      style={{ background: color, paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <Link
        href={backHref}
        aria-label="もどる"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-3xl active:scale-95"
      >
        ◀
      </Link>
      <h1 className="ruby-line flex min-w-0 flex-1 items-center gap-2 text-2xl leading-tight">
        {emoji && <span className="text-3xl">{emoji}</span>}
        <RubyText text={title} />
      </h1>
    </header>
  );
}
