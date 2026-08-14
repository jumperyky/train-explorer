/**
 * 路線記事の「駅一覧」から、stations.ts に貼れる駅データを作る。
 *
 *   node scripts/fetch-line-stations.mjs "信楽高原鐵道信楽線" --prefix=shigaraki --minzoom=12
 *
 * 駅を何十件も手打ちすると必ず取り違えが混ざるので、Wikipedia から取り込む。
 *  - 駅の並び : 路線記事の駅一覧テーブルの1列目（接続路線の欄と混ざらないよう行頭から拾う）
 *  - 読み     : 各駅記事の冒頭「○○駅（○○えき）」
 *  - ローマ字 : 英語版の記事名「Shigaraki Station」。無ければ読みから生成
 *  - 緯度経度 : ここでは 0 を置く。fetch-station-coords.mjs が埋める
 *
 * 既存の駅と同名のものは「reuse」として報告する（同じ駅を二重に持たないため）。
 *
 * TLS検査環境では NODE_OPTIONS=--use-system-ca を付けて実行すること。
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://ja.wikipedia.org/w/api.php";
const USER_AGENT =
  "train-explorer/0.1 (https://github.com/jumperyky/train-explorer) node";

const args = process.argv.slice(2);
const pageTitle = args.find((a) => !a.startsWith("--"));
const opt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const idPrefix = opt("prefix", "");
const minZoom = Number(opt("minzoom", "11"));

if (!pageTitle) {
  console.error('usage: node scripts/fetch-line-stations.mjs "京阪本線" --prefix=keihan --minzoom=11');
  process.exit(1);
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${params.action} ${res.status}`);
  return res.json();
}

/** 駅一覧セクションの番号を探す */
async function findStationSection(page) {
  const data = await api({ action: "parse", prop: "sections", redirects: "1", page });
  const sec = data.parse.sections.find((s) => /駅一覧|駅名一覧/.test(s.line));
  if (!sec) throw new Error(`「駅一覧」セクションが見つかりません: ${page}`);
  return sec.index;
}

/**
 * 駅一覧テーブルから駅を順番に拾う。
 *
 * 表の形は路線ごとにかなり違う（駅番号が ! セル、rowspan の路線名セル、
 * セルに style 属性が付く、など）ので「何列目か」では追わない。
 * 代わりに「セルの先頭がいきなり駅へのリンクである行」だけを駅とみなす。
 * 接続路線の欄は先頭が事業者名や路線名のリンクなので自然に外れる。
 *
 *   |[[貴生川駅]]                                  → 貴生川
 *   |style="text-align:left;"|[[淀屋橋駅]]          → 淀屋橋
 *   |style="text-align:left;"|[[北浜駅 (大阪府)|北浜駅]] → 北浜（記事は「北浜駅 (大阪府)」）
 *   |style="text-align:left;"|[[大阪市高速電気軌道]]：… → 駅ではないので無視
 */
function parseStationTable(fullWikitext) {
  // 駅一覧セクションには「廃駅」「廃止区間」の表が続くことがある。
  // 現役の駅は最初の表に入っているので、最初の {| … |} だけを見る。
  const start = fullWikitext.indexOf("{|");
  const end = fullWikitext.indexOf("\n|}", start);
  const wikitext =
    start >= 0 && end > start ? fullWikitext.slice(start, end) : fullWikitext;

  const found = [];
  const seen = new Set();
  // 行頭の | ＋（属性セルがあれば読み飛ばし）＋ 先頭のリンク
  const CELL_LINK = /^\|(?:[^|[\]]*\|)?\s*\[\[([^\]|]+?)(?:\|([^\]]*?))?\]\]/;

  for (const rawLine of wikitext.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("|-") || line.startsWith("|}")) continue;

    const m = line.match(CELL_LINK);
    if (!m) continue;

    const article = m[1].trim();
    // 表示名があればそちらが正式な駅名。記事名は「松ヶ崎駅 (京都府)」のように
    // 曖昧さ回避が付いて「駅」で終わらないことがあるので、判定は表示名で行う
    const display = (m[2] ?? article).trim();
    if (!display.endsWith("駅")) continue;
    if (seen.has(article)) continue;

    seen.add(article);
    found.push({ article, display });
  }
  return found;
}

/** 「信楽駅（しがらきえき）は、…」から読みを取る */
function readingFromExtract(extract, articleTitle) {
  if (!extract) return null;
  const m = extract.match(/^[^（(]*[（(]([ぁ-ゖー・\s]+?)えき[）)]/);
  if (m) return m[1].replace(/[\s・]/g, "");
  // 「○○駅（○○えき、…）」のように読点が続く形
  const m2 = extract.match(/[（(]([ぁ-ゖー・\s]+?)えき[、,]/);
  if (m2) return m2[1].replace(/[\s・]/g, "");
  console.warn(`  [warn] 読みを取れませんでした: ${articleTitle}`);
  return null;
}

const ROMAJI = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo", しゃ: "sha", しゅ: "shu", しょ: "sho",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho", にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo", みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo", ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "ja", じゅ: "ju", じょ: "jo", びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", を: "o", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
};

/** ā ī ū ē ō → a i u e o */
function stripMacrons(s) {
  return s.normalize("NFD").replace(/[̄̃]/g, "").normalize("NFC");
}

/** 読み（ひらがな）からヘボン式ローマ字。英語版記事が無いときの予備 */
function romajiFromKana(kana) {
  let out = "";
  for (let i = 0; i < kana.length; i++) {
    const pair = kana.slice(i, i + 2);
    if (ROMAJI[pair]) {
      out += ROMAJI[pair];
      i++;
      continue;
    }
    const ch = kana[i];
    if (ch === "っ") {
      const next = kana.slice(i + 1, i + 3);
      const r = ROMAJI[next] ?? ROMAJI[kana[i + 1]] ?? "";
      out += r[0] ?? "";
      continue;
    }
    if (ch === "ー") continue;
    out += ROMAJI[ch] ?? "";
  }
  // 長音はJRの駅名表記に合わせて詰める（おおつ → Otsu、きょうと → Kyoto）
  out = out.replace(/ou/g, "o").replace(/oo/g, "o").replace(/uu/g, "u");
  // ん の直後が b/m/p なら m（ヘボン式）
  out = out.replace(/n([bmp])/g, "m$1");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** 既存の駅（同じ駅を二重に持たないため） */
function loadExistingStations() {
  const out = mkdtempSync(join(tmpdir(), "train-explorer-stations-"));
  try {
    execFileSync(
      process.execPath,
      [
        join(ROOT, "node_modules", "typescript", "bin", "tsc"),
        join("src", "data", "stations.ts"),
        "--outDir", out,
        "--module", "commonjs",
        "--moduleResolution", "node",
        "--target", "es2022",
        "--skipLibCheck",
      ],
      { cwd: ROOT, stdio: "pipe" },
    );
    const require = createRequire(import.meta.url);
    return require(join(out, "stations.js")).stations;
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- 本体

const sectionIndex = await findStationSection(pageTitle);
const parsed = await api({
  action: "parse",
  prop: "wikitext",
  section: String(sectionIndex),
  page: pageTitle,
});
const found = parseStationTable(parsed.parse.wikitext);
const stationArticles = found.map((f) => f.article);
const displayOf = new Map(found.map((f) => [f.article, f.display]));
console.log(`${pageTitle}: ${stationArticles.length}駅を検出`);

// 読み・英語版記事名をまとめて取得（titles は50件まで）
const readings = new Map();
const englishNames = new Map();
const redirected = [];
for (let i = 0; i < stationArticles.length; i += 20) {
  const chunk = stationArticles.slice(i, i + 20);
  const data = await api({
    action: "query",
    redirects: "1",
    prop: "extracts|langlinks",
    explaintext: "1",
    exintro: "1",
    exlimit: "20",
    lllang: "en",
    lllimit: "max",
    titles: chunk.join("|"),
  });
  const alias = new Map();
  for (const r of data.query?.redirects ?? []) {
    alias.set(r.to, r.from);
    // 「京阪山科駅」→「山科駅」のように別名の記事へ飛ぶと、そこに載っている
    // 読みは目的の駅のものではない。手で直す必要があるので必ず知らせる
    redirected.push({ from: r.from, to: r.to });
  }
  for (const n of data.query?.normalized ?? []) alias.set(n.to, n.from);
  for (const page of data.query?.pages ?? []) {
    const key = alias.get(page.title) ?? page.title;
    readings.set(key, readingFromExtract(page.extract, page.title));
    const en = page.langlinks?.[0]?.title;
    // 英語版は Shigarakigūshi のようにマクロン付き。既存データ（Otsu, Kyoto）に
    // 合わせて長音記号は落とす
    // "Oiwake Station (Shiga)" のように曖昧さ回避が後ろに付くことがある
    if (en) {
      const name = en.replace(/\s+Station\b.*$/i, "").trim();
      englishNames.set(key, stripMacrons(name));
    }
  }
  await new Promise((r) => setTimeout(r, 400));
}

const existing = loadExistingStations();
const existingByName = new Map(
  existing.map((s) => [s.name.replace(/[｜]|《[^》]*》/g, ""), s.id]),
);

const rows = [];
const reused = [];
const mismatched = [];
const orderedIds = [];
const usedIds = new Set(existing.map((s) => s.id));

for (const article of stationArticles) {
  const plainName = (displayOf.get(article) ?? article).replace(/駅$/, "");
  const kana = readings.get(article);
  const existingId = existingByName.get(plainName);

  if (existingId) {
    reused.push({ id: existingId, name: plainName });
    orderedIds.push(existingId);
    continue;
  }

  // 「京阪山科駅」が [[山科駅|京阪山科駅]] のように別の駅の記事へ張られていると、
  // 読みもローマ字もその別の駅のものになる。気づけるように知らせる
  const articlePlain = article.replace(/\s*\(.*\)$/, "").replace(/駅$/, "");
  if (articlePlain !== plainName) {
    mismatched.push({ station: plainName, article });
  }

  const romaji =
    englishNames.get(article) ??
    (kana ? romajiFromKana(kana) : plainName);

  // ID は英語版記事名から。重複したら連番を足す
  let id =
    romaji.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    `${idPrefix}-station`;
  if (idPrefix && usedIds.has(id)) id = `${idPrefix}-${id}`;
  let n = 2;
  while (usedIds.has(id)) id = `${id}-${n++}`;

  usedIds.add(id);
  orderedIds.push(id);

  // 全部が漢字なら既存データと同じ書き方に、かなが混じるなら ｜ で親文字を明示する
  const hasKanji = /[一-鿿々〆ヶ]/.test(plainName);
  const allKanji = /^[一-鿿々〆ヶ]+$/.test(plainName);
  const name = !hasKanji || !kana
    ? plainName
    : allKanji
      ? `${plainName}《${kana}》`
      : `｜${plainName}《${kana}》`;

  rows.push(
    `  { id: ${JSON.stringify(id)}, name: ${JSON.stringify(name)}, ` +
      `kana: ${JSON.stringify(kana ?? "")}, romaji: ${JSON.stringify(romaji)}, ` +
      `lat: 0, lng: 0, minZoom: ${minZoom} },`,
  );
}

const outFile = join(ROOT, "tmp-stations.txt");
const idList = orderedIds.map((id) => `"${id}",`).join(" ");
const body = [
  `// ===== ${pageTitle} =====`,
  ...rows,
  "",
  "// stationIds（この順番でそのまま貼れる）",
  `const STATIONS = [${idList}];`,
  "",
  reused.length
    ? `// 既存の駅を再利用:\n${reused.map((r) => `//   ${r.name} -> ${r.id}`).join("\n")}`
    : "// 既存の駅との重複なし",
  "",
].join("\n");

writeFileSync(outFile, body, "utf8");
console.log(`新規 ${rows.length}駅 / 既存を再利用 ${reused.length}駅`);
for (const r of reused) console.log(`  再利用: ${r.name} -> ${r.id}`);
for (const r of redirected) {
  console.warn(
    `  [要確認] ${r.from} は ${r.to} へのリダイレクト。読みとローマ字が別の駅のものになっています`,
  );
}
for (const m of mismatched) {
  console.warn(
    `  [要確認] ${m.station} の情報を「${m.article}」から取りました。読みとローマ字を確認してください`,
  );
}
console.log(`\n${outFile} に書き出しました。`);
