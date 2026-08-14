import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getLine, networkMap } from "@/data/lines";
import { getStation } from "@/data/stations";
import { toPlainText } from "@/lib/ruby";
import LineClient from "./LineClient";

export async function generateMetadata({ params }: PageProps<"/lines/[lineId]">) {
  const { lineId } = await params;
  const line = getLine(lineId);
  return { title: line ? `${toPlainText(line.name)} | でんしゃ・えき たんけんたい` : "ろせん" };
}

export default async function LinePage({
  params,
  searchParams,
}: PageProps<"/lines/[lineId]">) {
  const { lineId } = await params;
  const line = getLine(lineId);
  if (!line) notFound();

  // ?type=xxx（車掌さんマイクからのジャンプ）はサーバー側で解決して渡す
  const sp = await searchParams;
  const typeId = typeof sp.type === "string" ? sp.type : null;

  const stations = line.stationIds.map(getStation);
  const network = networkMap[line.network];

  return (
    <>
      <AppHeader
        title={line.name}
        emoji={network.emoji}
        color={line.color}
        backHref="/lines"
      />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-10">
        <LineClient line={line} stations={stations} initialTypeId={typeId} />
      </main>
    </>
  );
}
