"use client";

import { useMemo, useState } from "react";
import type { Line, Station } from "@/data/types";
import RubyText from "@/components/RubyText";
import StationSign from "@/components/StationSign";
import { trainsOnLine } from "@/data/trains";
import TrainPhoto from "@/components/TrainPhoto";

/**
 * 機能B: 路線ごとの駅一覧＋種別による停車駅の切り替え。
 * 種別を切り替えると、止まらない駅はグレーアウトし、
 * 「通過していく列車」のアニメーションが一度だけ走る。
 */
export default function LineClient({
  line,
  stations,
  initialTypeId,
}: {
  line: Line;
  stations: Station[];
  initialTypeId?: string | null;
}) {
  // 車掌さんマイクからの ?type=xxx で最初からその種別を選んでおく
  const [typeId, setTypeId] = useState(
    initialTypeId && line.types.some((x) => x.id === initialTypeId)
      ? initialTypeId
      : line.types[0].id,
  );
  const [signStationId, setSignStationId] = useState<string | null>(null);
  const [passKey, setPassKey] = useState(0);

  const type = line.types.find((t) => t.id === typeId) ?? line.types[0];
  const stopSet = useMemo(() => new Set(type.stops), [type.stops]);

  const stoppingStations = stations.filter((s) => stopSet.has(s.id));
  const signIndex = stoppingStations.findIndex((s) => s.id === signStationId);
  const signStation = signIndex >= 0 ? stoppingStations[signIndex] : null;

  const trains = trainsOnLine(line.id);

  return (
    <>
      {/* 種別の切り替え */}
      <div className="sticky top-[5.5rem] z-20 -mx-5 mb-4 bg-background/90 px-5 py-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto">
          {line.types.map((t) => {
            const active = t.id === type.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTypeId(t.id);
                  setPassKey((k) => k + 1);
                }}
                className="ruby-line shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-xl shadow transition active:scale-95"
                style={{
                  background: active ? t.color : "#ffffff",
                  color: active ? "#ffffff" : t.color,
                  border: `3px solid ${t.color}`,
                }}
              >
                <RubyText text={t.name} />
              </button>
            );
          })}
        </div>

        <p className="ruby-line mt-2 rounded-2xl bg-card px-4 py-2 text-lg shadow-sm">
          <RubyText text={type.description} />
          <span className="ml-1 text-foreground/60">
            （<RubyText text="止《と》まる 駅《えき》" /> {type.stops.length}／
            {line.stationIds.length}）
          </span>
        </p>
      </div>

      {/* 通過アニメーション */}
      <div className="pointer-events-none relative -mt-2 mb-1 h-8 overflow-hidden">
        <span
          key={passKey}
          className="animate-pass-through absolute top-0 text-3xl"
          style={{ color: type.color }}
        >
          🚆💨
        </span>
      </div>

      {/* 駅一覧 */}
      <ol className="relative flex flex-col">
        {stations.map((s) => {
          const stops = stopSet.has(s.id);
          return (
            <li key={s.id} className="relative flex items-stretch gap-3">
              {/* 路線の縦線 */}
              <div className="relative flex w-10 shrink-0 justify-center">
                <span
                  className="absolute inset-y-0 w-2 rounded-full"
                  style={{ background: `${line.color}55` }}
                />
                <span
                  className="relative z-10 mt-6 h-6 w-6 shrink-0 rounded-full border-4"
                  style={{
                    background: stops ? type.color : "#ffffff",
                    borderColor: stops ? "#ffffff" : "#c3ccd6",
                    boxShadow: stops ? `0 0 0 3px ${type.color}55` : "none",
                  }}
                />
              </div>

              <button
                type="button"
                disabled={!stops}
                onClick={() => setSignStationId(s.id)}
                className={[
                  "my-1 flex-1 rounded-2xl px-4 py-3 text-left transition",
                  stops
                    ? "bg-card shadow active:scale-[0.99]"
                    : "bg-transparent opacity-40",
                ].join(" ")}
              >
                <span className="ruby-line block text-2xl leading-tight">
                  <RubyText text={s.name} />
                  {!stops && (
                    <span className="ml-2 rounded-full bg-[#c3ccd6] px-2 py-0.5 align-middle text-sm text-white">
                      <RubyText text="通過《つうか》" />
                    </span>
                  )}
                </span>
                <span className="block text-base text-foreground/50">{s.romaji}</span>
                {s.transfers && s.transfers.length > 0 && (
                  <span className="ruby-line mt-1 block text-base text-[#e2661a]">
                    <RubyText text="乗《の》りかえ できるよ" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* この路線を走る電車 */}
      {trains.length > 0 && (
        <section className="mt-8">
          <h2 className="ruby-line mb-3 text-2xl">
            🚆 <RubyText text="この 路線《ろせん》を 走《はし》る 電車《でんしゃ》" />
          </h2>
          <ul className="flex gap-3 overflow-x-auto pb-2">
            {trains.map((t) => (
              <li
                key={t.id}
                className="w-44 shrink-0 overflow-hidden rounded-2xl bg-card shadow"
              >
                <TrainPhoto train={t} className="h-24 w-full object-cover" />
                <p className="ruby-line px-3 py-2 text-lg leading-tight">
                  <RubyText text={t.name} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 駅名標モーダル */}
      {signStation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
          role="dialog"
          aria-modal="true"
          onClick={() => setSignStationId(null)}
        >
          <div
            className="animate-pop-in w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <StationSign
              station={signStation}
              prev={stoppingStations[signIndex - 1] ?? null}
              next={stoppingStations[signIndex + 1] ?? null}
              color={type.color}
            />
            <button
              type="button"
              onClick={() => setSignStationId(null)}
              className="ruby-line mt-4 w-full rounded-2xl bg-white/90 px-4 py-4 text-2xl shadow active:scale-[0.99]"
            >
              <RubyText text="閉《と》じる" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
