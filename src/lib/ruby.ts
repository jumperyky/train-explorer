/**
 * ルビ記法のパーサ（青空文庫式）。
 *
 *   "電車《でんしゃ》の秘密《ひみつ》"
 *     → [ruby 電車/でんしゃ]の[ruby 秘密/ひみつ]
 *   "223系《けい》"
 *     → "223" + [ruby 系/けい]     ← 親文字は《》の直前の漢字の連なり
 *   "｜万葉あかね線《まんようあかねせん》"
 *     → ｜ で親文字の始まりを明示できる（かな交じりに振りたいとき）
 *
 * 《》で読みの終わりが確定するので、"電車《でんしゃ》の" のように
 * 送り仮名や助詞が直後に続いてもルビが飲み込まない。
 * バックエンド (/api/py/ruby) の pykakasi も同じ記法を返す。
 */

export type RubySegment =
  | { kind: "text"; text: string }
  | { kind: "ruby"; base: string; reading: string };

/** ｜で始まる親文字、または《》直前の漢字（々・〆・ヶ を含む）の連なり */
const RUBY_PATTERN = /(?:｜([^｜《》]+)|([一-鿿々〆ヶ]+))《([^《》]+)》/g;

export function parseRuby(input: string): RubySegment[] {
  const segments: RubySegment[] = [];
  let cursor = 0;

  RUBY_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = RUBY_PATTERN.exec(input)) !== null) {
    const [whole, explicitBase, kanjiBase, reading] = match;
    const start = match.index;
    if (start > cursor) {
      segments.push({ kind: "text", text: input.slice(cursor, start) });
    }
    segments.push({ kind: "ruby", base: explicitBase ?? kanjiBase, reading });
    cursor = start + whole.length;
  }

  if (cursor < input.length) {
    segments.push({ kind: "text", text: input.slice(cursor) });
  }
  return segments;
}

/** ルビ記法を取りのぞいた、見た目どおりの文字列 */
export function toPlainText(input: string): string {
  return parseRuby(input)
    .map((s) => (s.kind === "text" ? s.text : s.base))
    .join("");
}

/** すべてひらがなに開いた文字列（音声検索の照合用） */
export function toReading(input: string): string {
  return parseRuby(input)
    .map((s) => (s.kind === "text" ? s.text : s.reading))
    .join("");
}
