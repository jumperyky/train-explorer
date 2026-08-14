import BigLinkCard from "@/components/BigLinkCard";
import ConductorMic from "@/components/ConductorMic";
import RubyText from "@/components/RubyText";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 pb-10">
      <div
        className="ruby-line rounded-b-[2.5rem] bg-[#0b57d0] px-5 pb-7 pt-8 text-center text-white shadow-lg"
        style={{
          marginLeft: "-1.25rem",
          marginRight: "-1.25rem",
          paddingTop: "max(2rem, env(safe-area-inset-top))",
        }}
      >
        <p className="text-lg opacity-90">
          <RubyText text="本物《ほんもの》の 鉄道《てつどう》を 調《しら》べよう" />
        </p>
        <h1 className="mt-1 text-4xl leading-tight">
          <RubyText text="電車《でんしゃ》・駅《えき》" />
          <br />
          <span className="animate-wiggle inline-block">
            <RubyText text="探検隊《たんけんたい》" />
          </span>
        </h1>
        <p className="mt-3 text-3xl">🚄 🚃 🚞</p>
      </div>

      <nav className="flex flex-col gap-4">
        <BigLinkCard
          href="/zukan"
          emoji="📖"
          title="電車《でんしゃ》 図鑑《ずかん》"
          subtitle="新幹線《しんかんせん》・JR・近江鉄道《おうみてつどう》"
          color="#0b57d0"
        />
        <BigLinkCard
          href="/lines"
          emoji="🛤️"
          title="路線《ろせん》と 駅《えき》"
          subtitle="のぞみ／新快速《しんかいそく》、どこに 止《と》まる？"
          color="#1e9e5a"
        />
        <BigLinkCard
          href="/map"
          emoji="🗺️"
          title="わくわく 鉄道《てつどう》マップ"
          subtitle="地図《ちず》で 駅《えき》を さがそう"
          color="#e2661a"
        />
      </nav>

      <section className="rounded-3xl bg-card p-5 text-center shadow">
        <h2 className="ruby-line mb-3 text-2xl">
          <span className="mr-1">🚉</span>
          <RubyText text="車掌《しゃしょう》さん マイク" />
        </h2>
        <ConductorMic />
      </section>
    </main>
  );
}
