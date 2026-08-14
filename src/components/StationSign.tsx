import type { Station } from "@/data/types";
import RubyText from "./RubyText";

/**
 * 駅名標。JR西日本のホームにある看板をイメージしたデザイン。
 * 「まえのえき」「つぎのえき」を左右に置いて、いまどこにいるかを分かりやすくする。
 *
 * onSelect を渡すと前後の駅がボタンになり、たどって移動できる。
 */
export default function StationSign({
  station,
  prev,
  next,
  color = "#1e9e5a",
  onSelect,
}: {
  station: Station;
  prev?: Station | null;
  next?: Station | null;
  color?: string;
  onSelect?: (stationId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
      <div className="h-3 w-full" style={{ background: color }} />
      <div className="px-4 pb-3 pt-4 text-center">
        <p className="ruby-line text-4xl leading-tight text-[#14304d]">
          <RubyText text={station.name} />
        </p>
        <p className="mt-1 text-xl tracking-wide text-[#14304d]/60">
          {station.romaji}
        </p>
      </div>

      <div className="flex items-stretch border-t-4" style={{ borderColor: color }}>
        <Neighbor
          station={prev}
          label="前《まえ》"
          arrow="◀"
          arrowFirst
          onSelect={onSelect}
        />
        <div className="w-1 self-stretch" style={{ background: `${color}55` }} />
        <Neighbor station={next} label="次《つぎ》" arrow="▶" onSelect={onSelect} />
      </div>
    </div>
  );
}

function Neighbor({
  station,
  label,
  arrow,
  arrowFirst = false,
  onSelect,
}: {
  station?: Station | null;
  label: string;
  arrow: string;
  arrowFirst?: boolean;
  onSelect?: (stationId: string) => void;
}) {
  const inner = (
    <>
      <span className="ruby-line block text-sm text-[#14304d]/50">
        {arrowFirst && `${arrow} `}
        <RubyText text={label} />
        {!arrowFirst && ` ${arrow}`}
      </span>
      <span className="ruby-line block text-xl text-[#14304d]">
        {station ? <RubyText text={station.name} /> : "─"}
      </span>
    </>
  );

  // 終点側や onSelect が無いときは、ただの表示にする
  if (!station || !onSelect) {
    return <div className="flex-1 px-3 py-3 text-center">{inner}</div>;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(station.id);
      }}
      className="flex-1 px-3 py-3 text-center transition active:scale-95 active:bg-black/5"
    >
      {inner}
    </button>
  );
}
