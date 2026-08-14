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
import { fileURLToPath, pathToFileURL } from "node:url";

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
      "--module", "esnext",
      "--target", "es2022",
      "--moduleResolution", "bundler",
      "--skipLibCheck",
    ],
    { cwd: ROOT, stdio: "inherit" },
  );

  const load = async (name) =>
    import(pathToFileURL(join(out, `${name}.js`)).href);

  const { stations } = await load("stations");
  const { lines, networks } = await load("lines");
  const { trains } = await load("trains");

  const errors = [];
  const warnings = [];

  const stationIds = new Set(stations.map((s) => s.id));
  const lineIds = new Set(lines.map((l) => l.id));
  const networkIds = new Set(networks.map((n) => n.id));

  const dup = (ids) => ids.filter((id, i) => ids.indexOf(id) !== i);

  for (const [label, ids] of [
    ["駅", stations.map((s) => s.id)],
    ["路線", lines.map((l) => l.id)],
    ["車両", trains.map((t) => t.id)],
  ]) {
    const d = dup(ids);
    if (d.length) errors.push(`${label}IDが重複: ${[...new Set(d)].join(", ")}`);
  }

  for (const s of stations) {
    for (const id of s.transfers ?? []) {
      if (!lineIds.has(id)) errors.push(`駅 ${s.id}: 存在しない路線ID ${id}`);
    }
  }

  for (const line of lines) {
    if (!networkIds.has(line.network)) {
      errors.push(`路線 ${line.id}: 存在しないネットワーク ${line.network}`);
    }
    for (const id of line.stationIds) {
      if (!stationIds.has(id)) errors.push(`路線 ${line.id}: 存在しない駅ID ${id}`);
    }
    if (line.types.length === 0) errors.push(`路線 ${line.id}: 種別が1つもない`);

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
    if (t.secrets.length === 0) warnings.push(`車両 ${t.id}: secrets が空`);
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
