import Link from "next/link";
import RubyText from "@/components/RubyText";

export const metadata = { title: "オフライン | でんしゃ・えき たんけんたい" };

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-7xl">🚉</p>
      <h1 className="ruby-line text-3xl leading-tight">
        <RubyText text="今《いま》は インターネットに" />
        <br />
        つながっていないみたい
      </h1>
      <p className="ruby-line text-xl text-foreground/70">
        <RubyText text="つながったら もう一度《いちど》 ためしてね。" />
      </p>
      <Link
        href="/"
        className="rounded-2xl bg-[#0b57d0] px-8 py-4 text-2xl text-white shadow active:scale-95"
      >
        ホームへ
      </Link>
    </main>
  );
}
