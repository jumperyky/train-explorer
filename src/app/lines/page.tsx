import AppHeader from "@/components/AppHeader";
import BigLinkCard from "@/components/BigLinkCard";
import RubyText from "@/components/RubyText";
import { networks, linesOfNetwork } from "@/data/lines";

export const metadata = { title: "ろせんと えき | でんしゃ・えき たんけんたい" };

export default function LinesPage() {
  return (
    <>
      <AppHeader title="路線《ろせん》と 駅《えき》" emoji="🛤️" color="#1e9e5a" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-10 pt-5">
        {networks.map((n) => (
          <section key={n.id} className="mb-7">
            <h2
              className="ruby-line mb-3 flex items-center gap-2 text-2xl"
              style={{ color: n.color }}
            >
              <span className="text-3xl">{n.emoji}</span>
              <RubyText text={n.name} />
            </h2>
            <div className="flex flex-col gap-3">
              {linesOfNetwork(n.id).map((line) => (
                <BigLinkCard
                  key={line.id}
                  href={`/lines/${line.id}`}
                  emoji="🚉"
                  title={line.name}
                  subtitle={`${line.stationIds.length}駅《えき》 ／ ${line.types
                    .map((t) => t.name)
                    .join("・")}`}
                  color={line.color}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
