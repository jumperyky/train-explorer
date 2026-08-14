import Link from "next/link";
import RubyText from "./RubyText";

/**
 * ホームなどで使う特大のナビゲーションカード。
 * 5歳児がタブレットで押せるよう、最低でも高さ 7rem を確保し、
 * カード同士の間隔を広くとって誤タップを防ぐ。
 */
export default function BigLinkCard({
  href,
  emoji,
  title,
  subtitle,
  color,
}: {
  href: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-28 items-center gap-4 rounded-3xl bg-card p-5 shadow-[0_6px_0_rgba(0,0,0,0.12)] transition active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.12)]"
      style={{ borderBottom: `8px solid ${color}` }}
    >
      <span
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-5xl"
        style={{ background: `${color}22` }}
      >
        {emoji}
      </span>
      <span className="min-w-0">
        <span className="ruby-line block text-3xl leading-tight" style={{ color }}>
          <RubyText text={title} />
        </span>
        <span className="ruby-line mt-1 block text-lg text-foreground/70">
          <RubyText text={subtitle} />
        </span>
      </span>
    </Link>
  );
}
