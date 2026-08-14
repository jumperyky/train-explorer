import AppHeader from "@/components/AppHeader";
import MapClient from "./MapClient";

export const metadata = { title: "てつどうマップ | でんしゃ・えき たんけんたい" };

export default async function MapPage({ searchParams }: PageProps<"/map">) {
  // ?station=xxx（車掌さんマイクからのジャンプ）
  const sp = await searchParams;
  const station = typeof sp.station === "string" ? sp.station : null;

  return (
    <>
      <AppHeader title="わくわく 鉄道《てつどう》マップ" emoji="🗺️" color="#e2661a" />
      {/* Leaflet は親の高さが確定していないと描画できないので dvh で固定する */}
      <main className="relative w-full" style={{ height: "calc(100dvh - 5rem)" }}>
        <MapClient focusStationId={station} />
      </main>
    </>
  );
}
