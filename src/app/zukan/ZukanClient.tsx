"use client";

import { useState } from "react";
import { networks } from "@/data/lines";
import { trains, trainMap } from "@/data/trains";
import type { NetworkId } from "@/data/types";
import RubyText from "@/components/RubyText";
import TrainPhoto from "@/components/TrainPhoto";
import TrainDetailModal from "@/components/TrainDetailModal";

type Filter = "all" | NetworkId;

export default function ZukanClient({
  initialTrainId,
}: {
  initialTrainId?: string | null;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  // 車掌さんマイクからの ?train=xxx で最初からそのモーダルを開く
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTrainId && trainMap[initialTrainId] ? initialTrainId : null,
  );

  const shown = filter === "all" ? trains : trains.filter((t) => t.network === filter);
  const selected = selectedId ? trainMap[selectedId] : null;

  return (
    <>
      <div className="sticky top-[5.5rem] z-20 -mx-5 mb-4 overflow-x-auto bg-background/90 px-5 py-3 backdrop-blur">
        <div className="flex gap-2">
          <FilterChip active={filter === "all"} color="#14304d" onClick={() => setFilter("all")}>
            <RubyText text="全部《ぜんぶ》" />
          </FilterChip>
          {networks.map((n) => (
            <FilterChip
              key={n.id}
              active={filter === n.id}
              color={n.color}
              onClick={() => setFilter(n.id)}
            >
              {n.emoji} <RubyText text={n.name} />
            </FilterChip>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shown.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => setSelectedId(t.id)}
              className="w-full overflow-hidden rounded-3xl bg-card text-left shadow-[0_6px_0_rgba(0,0,0,0.1)] transition active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.1)]"
            >
              <TrainPhoto train={t} className="h-40 w-full object-cover" />
              <div className="px-4 py-3">
                <p className="ruby-line text-2xl leading-tight">
                  <RubyText text={t.name} />
                </p>
                <p className="ruby-line mt-1 text-lg text-[#e5342a]">
                  <RubyText text="最高《さいこう》" /> {t.maxSpeed} km/h
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <TrainDetailModal train={selected} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}

function FilterChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ruby-line shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-xl shadow transition active:scale-95"
      style={{
        background: active ? color : "#ffffff",
        color: active ? "#ffffff" : color,
        border: `3px solid ${color}`,
      }}
    >
      {children}
    </button>
  );
}
