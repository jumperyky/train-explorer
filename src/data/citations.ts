import type { Citation } from "./types";

/**
 * 出典を書くためのヘルパー。
 * 車両・路線・種別すべてで使う。Wikipedia 以外（鉄道会社の公式ページなど）を
 * 足すときは、そのままオブジェクトリテラルで書けばよい。
 */
export const wikipedia = (title: string): Citation => ({
  title: `Wikipedia「${title}」`,
  url: `https://ja.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
});
