/**
 * ルビ記法の点検スクリプト。
 *   node scripts/check-ruby.mjs
 *
 * src 配下の 漢字《よみ》 をすべて集めて、
 * 「読みが送り仮名や助詞まで飲み込んでいそうなもの」を警告する。
 * 判定は目安なので、出力を目で見て直すこと。
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const TOKEN = /(?:｜([^｜《》]+)|([一-鿿々〆ヶ]+))《([^《》]+)》/g;

/** 漢字1文字あたりの読みは、長くてもこのくらい（訓読みの長いものを考慮） */
const MAX_KANA_PER_KANJI = 3;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.tsx?$/.test(p)) yield p;
  }
}

const seen = new Map();
for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(TOKEN)) {
    const [token, explicitBase, kanjiBase, reading] = m;
    const base = explicitBase ?? kanjiBase;
    if (!seen.has(token)) seen.set(token, { base, reading, files: new Set() });
    seen.get(token).files.add(file.slice(SRC.length + 1));
  }
}

const suspects = [];
for (const [token, { base, reading }] of seen) {
  if (reading.length > base.length * MAX_KANA_PER_KANJI) suspects.push(token);
}

console.log(`tokens: ${seen.size}`);
if (suspects.length === 0) {
  console.log("疑わしいルビはありません。");
} else {
  console.log(`\n読みが長すぎるかもしれないルビ (${suspects.length}件):`);
  for (const s of suspects.sort()) {
    console.log("  " + s + "   <- " + [...seen.get(s).files].join(", "));
  }
}
