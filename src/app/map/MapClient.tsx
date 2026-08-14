"use client";

import dynamic from "next/dynamic";

// Leaflet は window に依存するのでサーバーでは描画しない
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xl">
      🗺️ ちずを よみこんでいるよ…
    </div>
  ),
});

export default function MapClient({ focusStationId }: { focusStationId?: string | null }) {
  return <MapView focusStationId={focusStationId} />;
}
