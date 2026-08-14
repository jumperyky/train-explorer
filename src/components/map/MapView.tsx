"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { lines, networkMap } from "@/data/lines";
import { stationMap, stations } from "@/data/stations";
import type { NetworkId, Station } from "@/data/types";
import { trainsOnLine } from "@/data/trains";
import RubyText from "@/components/RubyText";
import StationSign from "@/components/StationSign";
import TrainArt from "@/components/TrainArt";

/**
 * 機能C: わくわく鉄道マップ。
 * ズームレベルに応じて出てくる駅が増える（新幹線の主要駅 → JRの駅 → 近江鉄道の駅）。
 */

const INITIAL_CENTER: [number, number] = [35.05, 136.05];
const INITIAL_ZOOM = 8;

/** 駅がどのネットワークに属するか（複数なら 新幹線 > JR西 > 近江 の順で代表を決める） */
const stationNetwork: Record<string, NetworkId> = (() => {
  const rank: NetworkId[] = ["shinkansen", "jrwest", "ohmi"];
  const map: Record<string, NetworkId> = {};
  for (const line of lines) {
    for (const id of line.stationIds) {
      const cur = map[id];
      if (!cur || rank.indexOf(line.network) < rank.indexOf(cur)) {
        map[id] = line.network;
      }
    }
  }
  return map;
})();

/** 駅の代表路線（駅名標の 前／次 を出すために使う） */
function primaryLineOf(stationId: string) {
  return lines.find((l) => l.stationIds.includes(stationId));
}

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  });
  return null;
}

function MapRefBinder({ mapRef }: { mapRef: React.RefObject<LeafletMap | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

export default function MapView({ focusStationId }: { focusStationId?: string | null }) {
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const mapRef = useRef<LeafletMap | null>(null);

  const visible = useMemo(
    () => stations.filter((s) => zoom >= s.minZoom),
    [zoom],
  );

  // 音声検索などから ?station=xxx が来たらそこへ飛ぶ
  useEffect(() => {
    if (!focusStationId) return;
    const s = stationMap[focusStationId];
    const map = mapRef.current;
    if (!s || !map) return;
    map.flyTo([s.lat, s.lng], Math.max(s.minZoom, 12), { duration: 1.2 });
  }, [focusStationId]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={5}
        maxZoom={15}
        className="h-full w-full"
        scrollWheelZoom
      >
        <MapRefBinder mapRef={mapRef} />
        <ZoomWatcher onZoom={setZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 路線のライン */}
        {lines.map((line) => (
          <Polyline
            key={line.id}
            positions={line.stationIds.map((id) => {
              const s = stationMap[id];
              return [s.lat, s.lng] as [number, number];
            })}
            pathOptions={{
              color: line.color,
              weight: line.network === "shinkansen" ? 6 : 4,
              opacity: 0.75,
            }}
          />
        ))}

        {/* 駅のピン */}
        {visible.map((s) => {
          const net = stationNetwork[s.id] ?? "jrwest";
          const color = networkMap[net].color;
          const isMajor = s.minZoom <= 8;
          return (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={isMajor ? 11 : 8}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillColor: color,
                fillOpacity: 1,
              }}
            >
              <Popup minWidth={260} maxWidth={300}>
                <StationPopup station={s} />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* ズームのヒント */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1000] w-[92%] max-w-md -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-3 text-center shadow-lg">
        <p className="ruby-line text-lg leading-tight">
          {zoom < 9 && (
            <RubyText text="🔍 ゆびで ひろげると JRの 駅《えき》が 出《で》てくるよ" />
          )}
          {zoom >= 9 && zoom < 12 && (
            <RubyText text="🔍 もっと ひろげると 近江鉄道《おうみてつどう》の 駅《えき》が 出《で》てくるよ" />
          )}
          {zoom >= 12 && (
            <RubyText text="🚞 小《ちい》さな 駅《えき》も 全部《ぜんぶ》 見《み》えているよ！" />
          )}
        </p>
        <p className="ruby-line mt-1 text-sm text-foreground/50">
          <RubyText text="今《いま》" /> {visible.length} <RubyText text="駅《えき》" /> ／
          ズーム {zoom}
        </p>
      </div>
    </div>
  );
}

function StationPopup({ station }: { station: Station }) {
  const line = primaryLineOf(station.id);
  const order = line?.stationIds ?? [];
  const i = order.indexOf(station.id);
  const prev = i > 0 ? stationMap[order[i - 1]] : null;
  const next = i >= 0 && i < order.length - 1 ? stationMap[order[i + 1]] : null;
  const trains = line ? trainsOnLine(line.id).slice(0, 3) : [];

  return (
    <div className="w-full">
      <StationSign
        station={station}
        prev={prev}
        next={next}
        color={line?.color ?? "#1e9e5a"}
      />
      {line && (
        <p className="ruby-line mt-2 text-center text-lg">
          <RubyText text={line.name} />
        </p>
      )}
      {trains.length > 0 && (
        <ul className="mt-2 flex gap-2">
          {trains.map((t) => (
            <li key={t.id} className="flex-1 overflow-hidden rounded-xl bg-white shadow">
              {/* ポップアップは小さすぎて写真のクレジットが読めないため、イラストを使う */}
              <TrainArt train={t} className="h-14 w-full object-cover" />
              <p className="ruby-line px-1 py-1 text-center text-xs">
                <RubyText text={t.name} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
