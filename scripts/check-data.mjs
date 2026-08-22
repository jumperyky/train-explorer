/**
 * データの整合性チェック。
 *   npm run check:data
 *
 * 車両・路線・駅が増えるほど、IDの打ち間違いや「その路線に無い駅を停車駅に
 * 入れる」といった取り違えが起きやすくなる。TypeScript の型では防げない種類の
 * ミスなので、実際のデータを読み込んで機械的に検査する。
 *
 * データファイルは互いを型でしか参照していないので、tsc で JS に落として
 * そのまま import できる（正規表現でTSを読むより確実）。
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = mkdtempSync(join(tmpdir(), "train-explorer-data-"));

try {
  // npx ではなく tsc の実体を今の node で動かす
  // （Windows では .cmd の spawn が EINVAL になる）
  execFileSync(
    process.execPath,
    [
      join(ROOT, "node_modules", "typescript", "bin", "tsc"),
      join("src", "data", "stations.ts"),
      join("src", "data", "lines.ts"),
      join("src", "data", "trains.ts"),
      "--outDir", out,
      // CommonJS で出す。ESM だと tsc が "./citations" を拡張子なしで書き出し、
      // Node の ESM 解決が通らない
      "--module", "commonjs",
      "--moduleResolution", "node",
      "--target", "es2022",
      "--skipLibCheck",
    ],
    { cwd: ROOT, stdio: "inherit" },
  );

  const require = createRequire(import.meta.url);
  const load = (name) => require(join(out, `${name}.js`));

  const { stations } = load("stations");
  const { lines, networks } = load("lines");
  const { trains } = load("trains");

  const errors = [];
  const warnings = [];

  const stationIds = new Set(stations.map((s) => s.id));
  const lineIds = new Set(lines.map((l) => l.id));
  const networkIds = new Set(networks.map((n) => n.id));

  const dup = (ids) => ids.filter((id, i) => ids.indexOf(id) !== i);

  // 出典URLはホワイトリスト内でなければならない（要件 機能E）。
  // 外れたURLは UI 上ただの文字になり、リンクとして機能しないので、
  // 「出典を書いたのに辿れない」状態を作らないためここで止める。
  const ALLOWED_HOSTS = ["ja.wikipedia.org", "commons.wikimedia.org", "creativecommons.org"];
  const checkSources = (label, sources) => {
    for (const s of sources ?? []) {
      let host = null;
      try {
        const u = new URL(s.url);
        host = u.protocol === "https:" ? u.hostname : null;
      } catch {
        host = null;
      }
      if (!host || !ALLOWED_HOSTS.includes(host)) {
        errors.push(
          `${label}: 許可されていない出典URL ${s.url}` +
            `（許可: ${ALLOWED_HOSTS.join(", ")}。src/lib/safeLink.ts と揃える）`,
        );
      }
    }
  };

  for (const [label, ids] of [
    ["駅", stations.map((s) => s.id)],
    ["路線", lines.map((l) => l.id)],
    ["車両", trains.map((t) => t.id)],
  ]) {
    const d = dup(ids);
    if (d.length) errors.push(`${label}IDが重複: ${[...new Set(d)].join(", ")}`);
  }

  for (const line of lines) {
    if (!networkIds.has(line.network)) {
      errors.push(`路線 ${line.id}: 存在しないネットワーク ${line.network}`);
    }
    for (const id of line.stationIds) {
      if (!stationIds.has(id)) errors.push(`路線 ${line.id}: 存在しない駅ID ${id}`);
    }
    if (line.types.length === 0) errors.push(`路線 ${line.id}: 種別が1つもない`);
    if (!line.sources || line.sources.length === 0) {
      errors.push(`路線 ${line.id}: 出典 (sources) が空`);
    }
    checkSources(`路線 ${line.id}`, line.sources);
    for (const type of line.types) {
      checkSources(`路線 ${line.id} の種別 ${type.id}`, type.sources);
    }

    const belongs = new Set(line.stationIds);
    for (const type of line.types) {
      for (const id of type.stops) {
        if (!belongs.has(id)) {
          errors.push(
            `路線 ${line.id} の種別 ${type.id}: この路線に無い駅を停車駅にしている (${id})`,
          );
        }
      }
      if (type.stops.length === 0) {
        errors.push(`路線 ${line.id} の種別 ${type.id}: 停車駅が空`);
      }
      // 停車駅の並びが路線の駅順とずれていないか
      const order = line.stationIds.filter((id) => type.stops.includes(id));
      if (order.join(",") !== [...type.stops].join(",")) {
        warnings.push(
          `路線 ${line.id} の種別 ${type.id}: 停車駅の並びが路線の駅順と違います`,
        );
      }
    }

    // 線路の続き（connections）。つなぎ目の駅を間違えると、路線ページの
    // どこにも帯が出ない（黙って消える）ので、ここで気づけるようにする。
    for (const c of line.connections ?? []) {
      const target = lines.find((l) => l.id === c.lineId);
      if (!target) {
        errors.push(`路線 ${line.id}: 存在しない接続先の路線ID ${c.lineId}`);
        continue;
      }
      if (target.id === line.id) {
        errors.push(`路線 ${line.id}: 自分自身につながっています`);
      }
      if (!belongs.has(c.stationId)) {
        errors.push(
          `路線 ${line.id}: 接続 (${c.lineId}) のつなぎ目 ${c.stationId} が この路線の駅ではありません`,
        );
        continue;
      }
      // 相手の路線に無い駅でつながっているなら、線路は続いていない
      if (c.through && !target.stationIds.includes(c.stationId)) {
        errors.push(
          `路線 ${line.id}: 接続 (${c.lineId}) は ${c.stationId} を共有していないのに through: true です`,
        );
      }
      // 片方向だけの接続は、行ったきり戻れないページになる
      if (!(target.connections ?? []).some((b) => b.lineId === line.id)) {
        warnings.push(
          `路線 ${line.id}: ${c.lineId} へつながっていますが、${c.lineId} 側に ${line.id} への接続がありません`,
        );
      }
    }
  }

  const usedStations = new Set(lines.flatMap((l) => l.stationIds));
  for (const s of stations) {
    if (!usedStations.has(s.id)) warnings.push(`どの路線にも属さない駅: ${s.id}`);
  }

  for (const t of trains) {
    if (!networkIds.has(t.network)) {
      errors.push(`車両 ${t.id}: 存在しないネットワーク ${t.network}`);
    }
    for (const id of t.lineIds) {
      if (!lineIds.has(id)) errors.push(`車両 ${t.id}: 存在しない路線ID ${id}`);
    }
    if (!t.sources || t.sources.length === 0) {
      errors.push(`車両 ${t.id}: 出典 (sources) が空`);
    }
    checkSources(`車両 ${t.id}`, t.sources);
    // 「でんしゃのひみつ」は子どもが読む中身そのもの。薄いと図鑑として物足りない
    if (t.secrets.length < 3) {
      warnings.push(`車両 ${t.id}: でんしゃのひみつが ${t.secrets.length}件 しかありません`);
    }
    if (!t.photo) {
      warnings.push(`車両 ${t.id}: photo 未指定 — 記事の代表画像に依存します`);
    }
  }

  console.log(
    `駅 ${stations.length} / 路線 ${lines.length} / 車両 ${trains.length} を検査しました`,
  );
  for (const w of warnings) console.log(`  [warn]  ${w}`);
  for (const e of errors) console.error(`  [ERROR] ${e}`);

  if (errors.length > 0) process.exit(1);
  console.log("問題は見つかりませんでした。");
} finally {
  rmSync(out, { recursive: true, force: true });
}
