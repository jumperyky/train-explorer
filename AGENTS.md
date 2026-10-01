<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## このプロジェクトの決まりごと

5歳児向けの鉄道アプリ。詳しい背景と手順は [README.md](./README.md)。ここには守ることだけを書く。

### 変更したら
- `npm run check` を通す（typecheck → check:data → check:ruby → lint）。
- ビルドより先に走らせると `PageProps` が無いという型エラーになる。`.next` を消した直後は `npm run build` を先に。

### ふりがな
- 画面の文字はすべて `漢字《よみ》` 記法で持ち、`<RubyText>` で描画する。
  つまずいた点は [docs/furigana-ruby-guide.md](./docs/furigana-ruby-guide.md)。
- 送り仮名・助詞はルビの外に置く。親文字の始まりが曖昧なときは `｜` を付ける。

### 外部リンク
- **素の `<a href="http...">` を書かない。** 必ず `src/components/ExternalLink.tsx` を通す。
- リンク先は `src/lib/safeLink.ts` のホワイトリストにあるホストだけ。子どもの端末で動くため。
- 写真のクレジットはリンクにしない（誤タップ防止）。

### データ（`src/data/`）
- `secrets` / `description` は `sources` で裏が取れたことだけ書く。書けないなら書かない。
- `maxSpeed` は確認できた値だけ。不明なら省略する（UI が欄を消す）。
- 駅の `lat` / `lng` は手で打たない。`node scripts/fetch-station-coords.mjs --write` に取らせる。
- 写真は Commons のファイルを直接指定する。記事の代表画像は予告なく差し替わる。
- Commons の写真はクレジット表示が必須。クレジットが読めない大きさの場所では内蔵イラストを使う。

### 構成
- フロントは Next.js、バックエンドは `api/index.py`（FastAPI、Vercel の Python Function）。
  フロントの `/api/py/*` が `next.config.ts` の rewrites でそこへ流れる。
- バックエンドが無くても動くこと（写真は内蔵 SVG にフォールバック）を崩さない。
- `main` に push すると Vercel が自動でデプロイする。リポジトリは公開。秘密情報は `.env.local` と Vercel の環境変数だけ。
