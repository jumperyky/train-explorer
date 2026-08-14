import { lines } from "@/data/lines";
import { stations } from "@/data/stations";
import { trains } from "@/data/trains";
import { toPlainText, toReading } from "./ruby";

/** label は「かんじ《よみ》」記法のまま持ち、表示側で RubyText に渡す */
export type SearchHit =
  | { kind: "train"; id: string; label: string; href: string }
  | { kind: "line"; id: string; label: string; href: string }
  | { kind: "station"; id: string; label: string; href: string };

/** カタカナ→ひらがな、記号・空白の除去。音声認識の結果を照合しやすくする */
export function normalize(input: string): string {
  return input
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s！!。、．,．・「」]/g, "")
    .toLowerCase();
}

interface Candidate {
  hit: SearchHit;
  keys: string[];
}

function buildCandidates(): Candidate[] {
  const out: Candidate[] = [];

  for (const t of trains) {
    out.push({
      hit: {
        kind: "train",
        id: t.id,
        label: t.name,
        href: `/zukan?train=${t.id}`,
      },
      keys: [toPlainText(t.name), toReading(t.name), t.kana, ...t.aliases].map(normalize),
    });
  }

  for (const l of lines) {
    out.push({
      hit: {
        kind: "line",
        id: l.id,
        label: l.name,
        href: `/lines/${l.id}`,
      },
      keys: [toPlainText(l.name), toReading(l.name), l.kana].map(normalize),
    });
    for (const ty of l.types) {
      out.push({
        hit: {
          kind: "line",
          id: l.id,
          label: `${l.name} の ${ty.name}`,
          href: `/lines/${l.id}?type=${ty.id}`,
        },
        keys: [ty.kana, toPlainText(ty.name)].map(normalize),
      });
    }
  }

  for (const s of stations) {
    out.push({
      hit: {
        kind: "station",
        id: s.id,
        label: `${s.name}駅《えき》`,
        href: `/map?station=${s.id}`,
      },
      keys: [toPlainText(s.name), s.kana, `${s.kana}えき`, s.romaji].map(normalize),
    });
  }

  return out;
}

const CANDIDATES = buildCandidates();

/**
 * 音声/テキストの検索語にいちばん近いものを返す。
 * 完全一致 > 前方一致 > 部分一致 の順に強く採点する。
 */
export function search(query: string, limit = 6): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];

  const scored: { hit: SearchHit; score: number }[] = [];
  for (const c of CANDIDATES) {
    let best = 0;
    for (const key of c.keys) {
      if (!key) continue;
      if (key === q) best = Math.max(best, 100);
      else if (key.startsWith(q)) best = Math.max(best, 70 + q.length / key.length * 10);
      else if (key.includes(q)) best = Math.max(best, 45 + q.length / key.length * 10);
      else if (q.includes(key) && key.length >= 2) best = Math.max(best, 30);
    }
    if (best > 0) scored.push({ hit: c.hit, score: best });
  }

  scored.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const out: SearchHit[] = [];
  for (const { hit } of scored) {
    const key = `${hit.kind}:${hit.href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hit);
    if (out.length >= limit) break;
  }
  return out;
}
