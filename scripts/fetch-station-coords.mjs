/**
 * 駅の緯度経度を Wikipedia(ja) から取り込む。
 *
 *   node scripts/fetch-station-coords.mjs           … 差分を表示するだけ
 *   node scripts/fetch-station-coords.mjs --write   … stations.ts を書き換える
 *
 * もともとの座標は開発時に手で打った概算値で、数百メートル単位でずれている。
 * Wikipedia の記事に載っている座標は各駅の実測位置なので、それで置き換える。
 *
 * 同名駅の取り違え（大津駅など全国に複数ある）を防ぐため、
 * 取得した座標が元の概算値から離れすぎている場合は採用せず警告する。
 * 座標そのものが概算なので、しきい値は「別の駅を指している」と言える距離にする。
 *
 * TLS検査環境では NODE_OPTIONS=--use-system-ca を付けて実行すること。
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STATIONS_TS = join(ROOT, "src", "data", "stations.ts");
const WRITE = process.argv.includes("--write");

const USER_AGENT =
  "train-explorer/0.1 (https://github.com/jumperyky/train-explorer) node";
const API = "https://ja.wikipedia.org/w/api.php";
/** これ以上離れていたら別の駅を掴んだとみなす (km) */
const MAX_DRIFT_KM = 5;
/** 1回のリクエストで問い合わせる駅数（APIの上限は50） */
const BATCH = 20;

const out = mkdtempSync(join(tmpdir(), "train-explorer-coords-"));

function compile() {
  execFileSync(
    process.execPath,
    [
      join(ROOT, "node_modules", "typescript", "bin", "tsc"),
      join("src", "data", "stations.ts"),
      join("src", "lib", "ruby.ts"),
      "--outDir", out,
      "--module", "esnext",
      "--target", "es2022",
      "--moduleResolution", "bundler",
      "--skipLibCheck",
    ],
    { cwd: ROOT, stdio: "inherit" },
  );
}

/** 小数6桁（約10cm）に丸める。生の値は 136.66336111111113 のような桁あふれになる */
const round = (n) => Number(n.toFixed(6));

/** 2点間の距離 (km) */
function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchCoords(titles) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "coordinates",
    colimit: "max",
    titles: titles.join("|"),
  });
  const res = await fetch(`${API}?${params}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Wikipedia API ${res.status}`);
  const data = await res.json();

  // 記事名がリダイレクトされていても元の問い合わせ名で引けるようにする
  const alias = new Map();
  for (const r of data.query?.redirects ?? []) alias.set(r.to, r.from);
  for (const n of data.query?.normalized ?? []) alias.set(n.to, n.from);

  const found = new Map();
  for (const page of data.query?.pages ?? []) {
    const coord = page.coordinates?.[0];
    if (!coord) continue;
    const key = alias.get(page.title) ?? page.title;
    found.set(key, { lat: round(coord.lat), lng: round(coord.lon), article: page.title });
  }
  return found;
}

/**
 * Wikidata から座標を取る。
 * 記事が隣の駅へリダイレクトしてしまう駅（京阪石山駅 → 石山駅 など）は、
 * Wikipedia 経由だと隣の駅の座標になってピンが重なる。
 */
async function fromWikidata(qid) {
  const url =
    "https://www.wikidata.org/w/api.php?" +
    new URLSearchParams({
      action: "wbgetclaims",
      format: "json",
      property: "P625",
      entity: qid,
    });
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const v = data.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
  if (!v) return null;
  return { lat: round(v.latitude), lng: round(v.longitude), article: qid };
}

/**
 * 記事名で引けなかった駅の救済。
 * 「草津駅」のように全国に同名がある駅は曖昧さ回避ページになっていて座標が無い。
 * 概算座標のまわりを geosearch して、駅名を含む記事を拾う。
 * 元の座標が近くにある前提なので、同名の別の駅を掴む心配がない。
 */
async function geosearch(station, plainName) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    list: "geosearch",
    gscoord: `${station.lat}|${station.lng}`,
    gsradius: "5000",
    gslimit: "50",
  });
  const res = await fetch(`${API}?${params}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const hits = data.query?.geosearch ?? [];

  const wanted = `${plainName}駅`;

  // 同名の別会社の駅を掴まないようにする。
  // 「吹田駅」「芦屋駅」は数百m先に阪急・阪神の同名駅があり、
  // 距離順に拾うとそちらが先に来てしまう。
  const OTHER_OPERATORS =
    /(阪急|阪神|近鉄|京阪|南海|名鉄|京急|東急|西武|東武|小田急|相鉄|山陽|神戸電鉄|地下鉄|市営|新交通)/;
  const isOther = (title) =>
    OTHER_OPERATORS.test(title) && !/JR/.test(title);

  const candidates = hits.filter(
    (h) => (h.title === wanted || h.title.startsWith(`${wanted} (`)) && !isOther(h.title),
  );
  // 完全一致 →「◯◯駅 (JR西日本)」→「◯◯駅 (滋賀県)」の順に好む
  const chosen =
    candidates.find((h) => h.title === wanted) ??
    candidates.find((h) => h.title.includes("JR")) ??
    candidates[0];
  if (!chosen) return null;
  return { lat: round(chosen.lat), lng: round(chosen.lon), article: chosen.title };
}

try {
  compile();
  const { stations } = await import(
    pathToFileURL(join(out, "data", "stations.js")).href
  );
  const { toPlainText } = await import(
    pathToFileURL(join(out, "lib", "ruby.js")).href
  );

  /** 記事名は「駅名+ 駅」。例外は Station.wikipediaTitle で上書きできる */
  const titleOf = (s) => s.wikipediaTitle ?? `${toPlainText(s.name)}駅`;

  const results = [];

  // wikidataId が指定されている駅は、そちらを優先する
  const byWikidata = stations.filter((s) => s.wikidataId);
  const wikipediaOnly = stations.filter((s) => !s.wikidataId);
  for (const s of byWikidata) {
    const hit = await fromWikidata(s.wikidataId);
    results.push({ station: s, title: s.wikidataId, hit });
    await new Promise((r) => setTimeout(r, 300));
  }
  if (byWikidata.length) {
    console.log(`Wikidata から ${byWikidata.length}駅を取得しました`);
  }

  for (let i = 0; i < wikipediaOnly.length; i += BATCH) {
    const chunk = wikipediaOnly.slice(i, i + BATCH);
    const found = await fetchCoords(chunk.map(titleOf));
    for (const s of chunk) {
      const hit = found.get(titleOf(s));
      results.push({ station: s, title: titleOf(s), hit });
    }
    process.stdout.write(
      `\r取得中 ${Math.min(i + BATCH, wikipediaOnly.length)}/${wikipediaOnly.length}`,
    );
    await new Promise((r) => setTimeout(r, 400));
  }
  process.stdout.write("\n");

  // 記事名で引けなかったぶんを geosearch で拾いなおす
  const unresolved = results.filter((r) => !r.hit);
  if (unresolved.length > 0) {
    console.log(`記事名で引けなかった ${unresolved.length}駅を、位置から検索します…`);
    for (const r of unresolved) {
      // 座標がまだ 0 の駅は探す起点が無いので、位置検索は使えない。
      // wikipediaTitle を手で書いて記事を直接指すこと
      if (r.station.lat === 0 && r.station.lng === 0) continue;
      r.hit = await geosearch(r.station, toPlainText(r.station.name));
      if (r.hit) r.resolvedBy = "geosearch";
      await new Promise((t) => setTimeout(t, 350));
    }
  }
  console.log();

  const updates = [];
  const missing = [];
  const drifted = [];
  const renamed = [];

  for (const { station, title, hit, resolvedBy } of results) {
    if (!hit) {
      missing.push(`${station.id} (${title})`);
      continue;
    }
    if (resolvedBy === "geosearch") {
      renamed.push({ station, article: hit.article });
    }
    // lat/lng が 0 の駅は「まだ座標を入れていない新規駅」。
    // 比べる相手が無いので距離チェックはかけず、そのまま採用する
    const isNew = station.lat === 0 && station.lng === 0;
    if (isNew) {
      updates.push({ station, hit, km: 0 });
      continue;
    }

    const km = distanceKm(station, hit);
    if (km > MAX_DRIFT_KM) {
      drifted.push(`${station.id} (${title}): ${km.toFixed(1)}km — 別の駅の可能性`);
      continue;
    }
    if (km > 0.0005) updates.push({ station, hit, km });
  }

  updates.sort((a, b) => b.km - a.km);
  console.log(`更新できる駅: ${updates.length} / ${stations.length}`);
  console.log("ずれの大きい順（上位15件）:");
  for (const u of updates.slice(0, 15)) {
    console.log(
      `  ${u.station.id.padEnd(20)} ${(u.km * 1000).toFixed(0).padStart(5)}m ` +
        `${u.station.lat.toFixed(4)},${u.station.lng.toFixed(4)} → ${u.hit.lat.toFixed(4)},${u.hit.lng.toFixed(4)}`,
    );
  }
  const avg = updates.reduce((a, u) => a + u.km, 0) / (updates.length || 1);
  console.log(`\n平均のずれ: ${(avg * 1000).toFixed(0)}m`);

  if (missing.length) {
    console.log(`\n座標が取れなかった駅 (${missing.length}):`);
    for (const m of missing) console.log(`  ${m}`);
  }
  if (drifted.length) {
    console.log(`\n離れすぎて採用しなかった駅 (${drifted.length}):`);
    for (const d of drifted) console.log(`  ${d}`);
  }
  if (renamed.length) {
    console.log(
      `\n位置から特定した駅 (${renamed.length}) — stations.ts に wikipediaTitle を書き込みます:`,
    );
    for (const r of renamed) console.log(`  ${r.station.id} → ${r.article}`);
  }

  if (!WRITE) {
    console.log("\n--write を付けると stations.ts を書き換えます。");
  } else {
    let src = readFileSync(STATIONS_TS, "utf8");
    let applied = 0;
    for (const { station, hit } of updates) {
      // 1駅1行の形式なので、その駅の行の lat/lng だけを置き換える
      const line = new RegExp(
        `(\\{\\s*id:\\s*"${station.id}",[^\\n]*?)lat:\\s*[-\\d.]+,\\s*lng:\\s*[-\\d.]+`,
      );
      if (!line.test(src)) {
        console.warn(`  書き換えられませんでした: ${station.id}`);
        continue;
      }
      src = src.replace(line, `$1lat: ${hit.lat}, lng: ${hit.lng}`);
      applied++;
    }

    // 曖昧さ回避で特定した記事名は残しておく。次回そのまま引けるようにするため
    for (const { station, article } of renamed) {
      const marker = new RegExp(`(\\{\\s*id:\\s*"${station.id}",\\s*name:\\s*"[^"]*",)`);
      if (marker.test(src) && !src.includes(`wikipediaTitle: "${article}"`)) {
        src = src.replace(marker, `$1 wikipediaTitle: ${JSON.stringify(article)},`);
      }
    }

    writeFileSync(STATIONS_TS, src);
    console.log(`\nstations.ts を更新しました（座標 ${applied}駅 / 記事名 ${renamed.length}駅）。`);
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}
