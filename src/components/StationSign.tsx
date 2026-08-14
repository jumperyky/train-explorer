import type { Station } from "@/data/types";
import RubyText from "./RubyText";

/**
 * 駅名標。JR西日本のホームにある看板をイメージしたデザイン。
 * 「まえのえき」「つぎのえき」を左右に置いて、いまどこにいるかを分かりやすくする。
 */
export default function StationSign({
  station,
  prev,
  next,
  color = "#1e9e5a",
}: {
  station: Station;
  prev?: Station | null;
  next?: Station | null;
  color?: string;
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
        <div className="flex-1 px-3 py-3 text-center">
          <p className="ruby-line text-sm text-[#14304d]/50">
            ◀ <RubyText text="前《まえ》" />
          </p>
          <p className="ruby-line text-xl text-[#14304d]">
            {prev ? <RubyText text={prev.name} /> : "─"}
          </p>
        </div>
        <div className="w-1 self-stretch" style={{ background: `${color}55` }} />
        <div className="flex-1 px-3 py-3 text-center">
          <p className="ruby-line text-sm text-[#14304d]/50">
            <RubyText text="次《つぎ》" /> ▶
          </p>
          <p className="ruby-line text-xl text-[#14304d]">
            {next ? <RubyText text={next.name} /> : "─"}
          </p>
        </div>
      </div>
    </div>
  );
}
