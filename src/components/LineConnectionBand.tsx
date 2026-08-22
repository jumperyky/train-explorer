import Link from "next/link";
import RubyText from "@/components/RubyText";
import type { Line, LineConnection } from "@/data/types";

/**
 * 「線路の続き」の帯。
 *
 * 路線ページは1路線ぶんの駅しか出さないので、そのままだと東海道新幹線は
 * 新大阪で、東北新幹線は新青森で行き止まりに見える。実際には線路も列車も
 * その先へ続いているので、端（と分岐する駅）に帯を出して、
 * 次の路線のページへそのまま歩いていけるようにする。
 *
 * where は「路線図のどこに置くか」:
 *   "up"     … 先頭の駅の上（手前から続いてきた線路）
 *   "down"   … 最後の駅の下（この先へ続いていく線路）
 *   "branch" … とちゅうの駅（そこで分かれていく線路）
 */
export default function LineConnectionBand({
  connection,
  target,
  fromColor,
  where,
  dimmed = false,
}: {
  connection: LineConnection;
  target: Line;
  fromColor: string;
  where: "up" | "down" | "branch";
  dimmed?: boolean;
}) {
  const label =
    where === "up"
      ? "▲ この 手前《てまえ》は"
      : where === "down"
        ? "▼ この 先《さき》は"
        : "🔀 ここで 分《わ》かれて";

  // 線路がつながっている（直通）のか、降りて乗りかえるのかは、
  // 子どもにとって「そのまま座っていられるか」の違いなので必ず書き分ける
  const badge = connection.through ? "直通《ちょくつう》" : "のりかえ";

  return (
    <div
      className={[
        "flex items-stretch gap-3",
        dimmed ? "pointer-events-none opacity-40" : "",
      ].join(" ")}
    >
      {/* 駅一覧と同じ幅のレール */}
      <div className="relative flex w-10 shrink-0 justify-center">
        {where === "branch" ? (
          <>
            {/* とちゅうの分岐。幹線はそのまま下へ続くので色を変えず、
                横に伸びる線で「分かれていく」ことだけを見せる */}
            <span
              className="absolute inset-y-0 w-2 rounded-full"
              style={{ background: `${fromColor}55` }}
            />
            <span
              className="absolute left-1/2 top-1/2 h-2 -translate-y-1/2 rounded-full"
              /* 親の gap-3 のぶんまで伸ばして、分かれた線をカードに届かせる */
              style={{ background: target.color, width: "calc(50% + 0.75rem)" }}
            />
          </>
        ) : (
          /* 路線の端。手前の路線の色から次の路線の色へ変わっていく */
          <span
            className="absolute inset-y-0 w-2 rounded-full"
            style={{
              background: `linear-gradient(${
                where === "up" ? "to top" : "to bottom"
              }, ${fromColor}55, ${target.color})`,
            }}
          />
        )}
      </div>

      <Link
        href={`/lines/${target.id}`}
        tabIndex={dimmed ? -1 : undefined}
        className="my-1 flex-1 rounded-2xl px-4 py-3 text-white shadow transition active:scale-[0.99]"
        style={{ background: target.color }}
      >
        <span className="ruby-line block text-base text-white/85">
          <RubyText text={label} />
        </span>

        <span className="ruby-line mt-0.5 flex items-center gap-2 text-2xl leading-tight">
          <RubyText text={target.name} />
          <span className="ruby-line shrink-0 rounded-full bg-white/25 px-2 py-0.5 text-sm">
            <RubyText text={badge} />
          </span>
          <span className="ml-auto shrink-0 text-xl">▶</span>
        </span>

        {connection.note && (
          <span className="ruby-line mt-1 block text-base text-white/90">
            <RubyText text={connection.note} />
          </span>
        )}
      </Link>
    </div>
  );
}
