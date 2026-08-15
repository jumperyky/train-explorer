"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { CircleMarker as LeafletCircleMarker, Map as LeafletMap } from "leaflet";
import {
  lines,
  linesAtStation,
  nearbyStations,
  networkMap,
  networks,
} from "@/data/lines";
import { stationMap, stations } from "@/data/stations";
import type { Line, NetworkId, Station } from "@/data/types";
import { trainsOnLine } from "@/data/trains";
import RubyText from "@/components/RubyText";
import StationSign from "@/components/StationSign";
import TrainArt from "@/components/TrainArt";

/**
 * 機能C: わくわく鉄道マップ。
 * ズームレベルに応じて出てくる駅が増える（新幹線の主要駅 → JRの駅 → 近江鉄道の駅）。
 * ポップアップから前後の駅をたどったり、乗りかえ路線に切り替えたりできる。
 */

const INITIAL_CENTER: [number, number] = [35.05, 136.05];
const INITIAL_ZOOM = 8;

/**
 * 複数路線の駅で、どの路線を最初に見せるか。
 * networks の宣言順をそのまま使う。ここに書き足すのを忘れて
 * 新しい事業者が最優先になってしまう、という取りこぼしを防ぐため。
 */
const NETWORK_RANK: NetworkId[] = networks.map((n) => n.id);

/** 駅がどのネットワークに属するか（ピンの色に使う） */
const stationNetwork: Record<string, NetworkId> = (() => {
  const map: Record<string, NetworkId> = {};
  for (const line of lines) {
    for (const id of line.stationIds) {
      const cur = map[id];
      if (!cur || NETWORK_RANK.indexOf(line.network) < NETWORK_RANK.indexOf(cur)) {
        map[id] = line.network;
      }
    }
  }
  return map;
})();

function primaryLineOf(stationId: string): Line | undefined {
  const here = linesAtStation(stationId);
  return [...here].sort(
    (a, b) => NETWORK_RANK.indexOf(a.network) - NETWORK_RANK.indexOf(b.network),
  )[0];
}

/**
 * ピンが描画されるまで少し待ってからポップアップを開く。
 * 移動先の駅がズームで隠れている場合、React が再描画するまでマーカーが存在しない。
 */
function openPopupWhenReady(
  markers: Map<string, LeafletCircleMarker>,
  id: string,
  attempts = 40,
) {
  const marker = markers.get(id);
  if (marker) {
    marker.openPopup();
    return;
  }
  if (attempts > 0) setTimeout(() => openPopupWhenReady(markers, id, attempts - 1), 16);
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
  const [focusId, setFocusId] = useState<string | null>(focusStationId ?? null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef(new Map<string, LeafletCircleMarker>());

  /**
   * 表示する駅。ズームで絞りこむが、たどっている駅だけは必ず出す。
   * そうしないと、ズームが浅いときに移動先のピンが存在せずポップアップを開けない。
   */
  const visible = useMemo(() => {
    const list = stations.filter((s) => zoom >= s.minZoom);
    if (focusId && !list.some((s) => s.id === focusId)) {
      const s = stationMap[focusId];
      if (s) list.push(s);
    }
    return list;
  }, [zoom, focusId]);

  /** 駅へ移動してポップアップを開く */
  const goToStation = useCallback((id: string) => {
    const s = stationMap[id];
    const map = mapRef.current;
    if (!s || !map) return;
    setFocusId(id);
    map.flyTo([s.lat, s.lng], Math.max(map.getZoom(), s.minZoom), { duration: 0.8 });
    openPopupWhenReady(markerRefs.current, id);
  }, []);

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
        {/*
          既定のクレジットは <a> でOSMのサイトに出られてしまう。
          子どもが地図の隅を誤タップしただけで外に出るのは避けたいので、
          帰属表示は文字だけにする（表示義務は満たしたうえで導線を断つ）。
          ライセンスの詳細は README に記載。
        */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors (ODbL)"
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
              ref={(marker) => {
                if (marker) markerRefs.current.set(s.id, marker);
                else markerRefs.current.delete(s.id);
              }}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillColor: color,
                fillOpacity: 1,
              }}
            >
              <Popup minWidth={260} maxWidth={300} autoPan keepInView>
                <StationPopup station={s} onGoToStation={goToStation} />
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

function StationPopup({
  station,
  onGoToStation,
}: {
  station: Station;
  onGoToStation: (stationId: string) => void;
}) {
  const linesHere = useMemo(() => {
    const here = linesAtStation(station.id);
    return [...here].sort(
      (a, b) => NETWORK_RANK.indexOf(a.network) - NETWORK_RANK.indexOf(b.network),
    );
  }, [station.id]);

  const nearby = useMemo(() => nearbyStations(station.id), [station.id]);
  const [lineId, setLineId] = useState(() => primaryLineOf(station.id)?.id);
  const line = linesHere.find((l) => l.id === lineId) ?? linesHere[0];

  const order = line?.stationIds ?? [];
  const i = order.indexOf(station.id);
  const prev = i > 0 ? stationMap[order[i - 1]] : null;
  const next = i >= 0 && i < order.length - 1 ? stationMap[order[i + 1]] : null;
  // 先頭だけ切り出すと、あとから足した特急の車両が黙って消える。
  // 全部出して、入りきらなければ横スクロールさせる
  const trains = line ? trainsOnLine(line.id) : [];

  return (
    <div className="w-full">
      <StationSign
        station={station}
        prev={prev}
        next={next}
        color={line?.color ?? "#1e9e5a"}
        onSelect={onGoToStation}
      />

      {/* 乗りかえ。2つ以上の路線が通る駅では、どの路線で見るかを切り替えられる */}
      {linesHere.length > 1 ? (
        <div className="mt-2">
          <p className="ruby-line text-center text-sm text-[#e2661a]">
            <RubyText text="🔄 のりかえ できる 駅《えき》" />
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {linesHere.map((l) => {
              const active = l.id === line?.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLineId(l.id)}
                  className="ruby-line rounded-full px-2 py-1 text-sm transition active:scale-95"
                  style={{
                    background: active ? l.color : "#ffffff",
                    color: active ? "#ffffff" : l.color,
                    border: `2px solid ${l.color}`,
                  }}
                >
                  <RubyText text={l.name} />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        line && (
          <p className="ruby-line mt-2 text-center text-lg">
            <RubyText text={line.name} />
          </p>
        )
      )}

      {/* すぐそばにある別の駅。ピンが重なって選べないので、ここから行き来する */}
      {nearby.length > 0 && (
        <div className="mt-2">
          <p className="ruby-line text-center text-sm text-[#1f4fb6]">
            <RubyText text="🚶 あるいて のりかえ できる 駅《えき》" />
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {nearby.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onGoToStation(s.id)}
                className="ruby-line rounded-full border-2 border-[#1f4fb6] bg-white px-2 py-1 text-sm text-[#1f4fb6] transition active:scale-95"
              >
                <RubyText text={s.name} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* この路線を走る電車。タップで「ずかん」の詳細へ */}
      {trains.length > 0 && (
        <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {trains.map((t) => (
            <li key={t.id} className="w-20 shrink-0">
              <Link
                href={`/zukan?train=${t.id}`}
                className="block overflow-hidden rounded-xl bg-white shadow transition active:scale-95"
              >
                {/* ポップアップは小さすぎて写真のクレジットが読めないため、イラストを使う */}
                <TrainArt train={t} className="h-14 w-full object-cover" />
                <p className="ruby-line px-1 py-1 text-center text-xs">
                  <RubyText text={t.name} />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
