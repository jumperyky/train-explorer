/**
 * ルビ記法の移行スクリプト（一度きりの作業用）。
 *   旧: 漢字|よみ      … 読みの終わりが確定せず、送り仮名まで飲み込んでいた
 *   新: 漢字《よみ》    … 青空文庫式。読みの範囲が明確
 *
 *   node scripts/migrate-ruby-notation.mjs <file...>
 *
 * 変換できるのは「読みのうしろに何も続かない」単純なケースだけ。
 * 文章（送り仮名や助詞が続くもの）は手で直すこと。
 */
import { readFileSync, writeFileSync } from "node:fs";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node scripts/migrate-ruby-notation.mjs <file...>");
  process.exit(1);
}

for (const file of files) {
  const before = readFileSync(file, "utf8");
  const after = before.replace(/\|([ぁ-ゖァ-ヺー]+)/g, "《$1》");
  if (before === after) {
    console.log(`unchanged: ${file}`);
    continue;
  }
  writeFileSync(file, after);
  const count = (before.match(/\|[ぁ-ゖァ-ヺー]+/g) ?? []).length;
  console.log(`converted: ${file} (${count} tokens)`);
}
