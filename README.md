# でんしゃ・えき たんけんたい 🚄🚃🚞

電車を詳しく知りたい5歳児向けの、本格鉄道アプリ（MVP）。
実在する路線・車両の情報をベースに、すべての漢字にふりがなを振って表示します。

対象は3ネットワーク:

| ネットワーク | 路線 | 種別 |
| --- | --- | --- |
| 東海道新幹線 | 東京〜新大阪 | のぞみ／ひかり／こだま |
| JR西日本 在来線 | 琵琶湖線・JR京都線・JR神戸線 | 普通／快速／新快速 |
| 近江鉄道 | 本線・多賀線・八日市線 | 普通 |

## 機能

| | 機能 | 実装状況 |
| --- | --- | --- |
| A | でんしゃずかん（一覧＋詳細モーダル「でんしゃのひみつ」） | ✅ |
| B | 路線・駅名ガイド（種別ごとの停車駅、駅名標、通過アニメーション） | ✅ |
| C | わくわく鉄道マップ（ズームで駅が増える実地図） | ✅ |
| D | 車掌さんマイク（音声検索でずかん／路線／マップへジャンプ） | ✅ |
| E | 外部詳細ページへのセーフリンク | ホワイトリスト＋保護者確認 |
| F | PWA（manifest / Service Worker / ホーム画面追加） | ✅ |

## 構成

```
src/
  app/                 Next.js App Router のページ
    page.tsx           ホーム（＋車掌さんマイク）
    zukan/             機能A ずかん
    lines/             機能B 路線一覧・路線詳細
    map/               機能C 地図
    offline/           オフライン時のフォールバック
  components/          RubyText / StationSign / ConductorMic / TrainArt など
  data/                モックデータ（stations / lines / trains）
  lib/                 ルビ記法パーサ・検索・APIクライアント
api/index.py           FastAPI（Vercel の Python Serverless Function）
public/                manifest.webmanifest / sw.js / アイコン
scripts/               PWAアイコン生成スクリプト
docs/requirements.md   元の要件定義
```

### ふりがなの持ち方

アプリ内のテキストは**すべて漢字＋ルビ**で統一しています。
記法は青空文庫式の `漢字《よみ》`（親文字は `《》` の直前の漢字の連なり）。

```ts
name: "東海道《とうかいどう》新幹線《しんかんせん》"   // 東海道(とうかいどう)新幹線(しんかんせん)
name: "223系《けい》"                                 // ルビは 系 だけに付く
"電車《でんしゃ》が 走《はし》っている"                 // 送り仮名・助詞はルビの外
name: "｜三ノ宮《さんのみや》"                         // ｜ で親文字の始まりを明示できる
```

`《》` で読みの範囲が閉じるのが要点です。区切りのない `漢字|よみ` 形式だと
「電車|でんしゃの」のようにルビが助詞まで飲み込んでしまうため、この記法にしています。

`<RubyText text={...} />` が `<ruby>` に変換して描画します（[src/lib/ruby.ts](src/lib/ruby.ts)）。
ODPT などの動的テキストは、バックエンドの `/api/py/ruby`（pykakasi）が同じ記法を返します。

記法の点検はスクリプトで行えます（読みが送り仮名を飲み込んでいないかの目安チェック）。

```bash
node scripts/check-ruby.mjs
```

### 外部リンクの扱い（機能E）

子どもの端末で動くので、**アプリの外へ出る導線は二重に絞っています**。

1. **ホワイトリスト** — [src/lib/safeLink.ts](src/lib/safeLink.ts) に挙げたホスト
   （`ja.wikipedia.org` / `commons.wikimedia.org` / `creativecommons.org`）以外は、
   そもそもリンクにならず、ただの文字として表示されます
2. **保護者確認** — 開く前にかけ算（ふりがな無し）を挟みます。通過は5分間有効

そのため、**素の `<a href="http...">` をコードに書かないでください。**
外部へのリンクは必ず [ExternalLink](src/components/ExternalLink.tsx) を通します。
`npm run check` は、出典URLがホワイトリスト外だとエラーにします。

写真の上のクレジットは、誤タップ防止のため**リンクにしていません**
（`pointer-events: none`）。ファイル解説ページとライセンス条文へは、
詳細モーダルの「出典」から辿れます。

地図の OpenStreetMap 表記も、既定のリンク付きクレジットを文字だけに置き換えて
います。タイルは [ODbL](https://www.openstreetmap.org/copyright) の下で
OpenStreetMap contributors に帰属します。

### データを増やすときの決まりごと

車両・路線・駅は `src/data/` に足すだけで増やせますが、次を守ってください。

| 項目 | ルール |
| --- | --- |
| `secrets` / `description` | **必ず `sources` で裏を取る。** 書けないなら書かない |
| `maxSpeed` | 確認できた値だけ入れる。**不明なら省略**（UIが自動で欄を消す） |
| `photo` | Commons のファイルを直接指定する |
| `bodyColor` / `stripeColor` | 内蔵イラスト用。写真と同じ塗装に合わせる |
| 駅の `lat` / `lng` | **手で打たない。** 下のスクリプトで取り込む |

駅を追加したら、座標はスクリプトに取らせてください。Wikipedia(ja) の各駅記事の
座標を取り込み、同名駅の取り違えを防ぐため元の値から離れすぎていたら採用しません。

```bash
node scripts/fetch-station-coords.mjs           # 差分の確認だけ
node scripts/fetch-station-coords.mjs --write   # 反映
```

新しい駅は `lat` / `lng` に地図から読んだ概算値を入れておけば、スクリプトが
正確な値へ置き換えます（概算値は同名駅の判別にも使われます）。「草津駅」のように
記事名が曖昧さ回避になっている駅は、位置から記事を特定して `wikipediaTitle` を
書き込みます。

**写真は記事の代表画像に頼らないでください。** 代表画像は予告なく差し替わり、
塗装の違う写真になることがあります（900形で実際に起き、旧「淡海号」塗装の写真に
「まっかな体」という説明がついていました）。

**説明文を書けるデータベースは存在しません。** 子ども向けの解説を配信している
サービスは無いので、必ず人が書くことになります。だからこそ出典を残します。

追加したら検査を通してください。

```bash
npm run check
```

`typecheck` → `check:data`（ID参照・停車駅の整合性）→ `check:ruby`（ルビ記法）→
`lint` をまとめて実行します。`check:data` は「その路線に無い駅を停車駅にしている」
「存在しない路線IDを車両が参照している」「出典が空」などを検出します。

## 開発

### 1. フロントエンド

```bash
npm install
npm run dev
```

http://localhost:3000 が開きます。**バックエンドが起動していなくても動きます**
（写真は内蔵SVGイラストにフォールバック）。

### 2. バックエンド（任意）

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
npm run dev:api
```

http://127.0.0.1:8000/api/py/docs に Swagger UI が出ます。
`next.config.ts` の rewrites により、フロントの `/api/py/*` が自動でここへ流れます。

`npm run dev:api` は `.venv` の Python を優先して使います（PATH のグローバルPythonだと
requirements.txt を入れていない環境で動いてしまうため）。ポートを変えたいときは
`API_PORT=8001 npm run dev:api`。

起動時に `WinError 10013` / `Address already in use` が出るときは、
すでに 8000番で別のプロセスが動いています。掴んでいるプロセスはこれで分かります。

```bash
netstat -ano | findstr :8000
```

| エンドポイント | 内容 |
| --- | --- |
| `GET /api/py/health` | 疎通確認 |
| `GET /api/py/ruby?text=` | pykakasi で `漢字《よみ》` 記法に変換 |
| `GET /api/py/photo?file=` | Commons のファイルを指定して写真＋**クレジット**を取得 |
| `GET /api/py/image?title=` | 記事の代表画像（`photo` 未指定のときのフォールバック） |
| `GET /api/py/odpt/{resource}` | ODPT APIのラッパー（トークン未設定なら 503） |

### このPC特有の注意

TLS検査ソフトが入っているため、Node / Python からの外部HTTPSが証明書エラーになることがあります。

- Node: `$env:NODE_OPTIONS = "--use-system-ca"` を付けて起動
- Python: `api/index.py` が `truststore` でOSの証明書ストアを使うようにしてあるので対応済み
- pip: 失敗する場合は `--trusted-host pypi.org --trusted-host files.pythonhosted.org`

## 環境変数

`.env.example` をコピーして `.env.local` を作成（キーは絶対にコミットしない）。

| 変数 | 用途 | 未設定時 |
| --- | --- | --- |
| `ODPT_ACCESS_TOKEN` | 公共交通オープンデータセンター | モックデータのまま動作 |
| `WIKI_USER_AGENT` | Wikimedia の UAポリシー対応（連絡先必須） | このリポジトリのURL入りUA（設定不要） |
| `IMAGE_WIDTH` | 取得する写真の横幅 | 800 |
| `CACHE_TTL_SECONDS` | バックエンドのキャッシュ秒数 | 3600 |
| `API_ORIGIN` | バックエンドを別サービスに置く場合のオリジン | Vercelの同居Functionを使用 |

## デプロイ（Vercel）

フロント（Next.js）とバックエンド（FastAPI）を**同じVercelプロジェクトに同居**させる構成です。
別サービスを管理せずに済み、MVPとしては一番手軽です。

1. リポジトリを GitHub に push
2. Vercel で Import。Framework は Next.js が自動検出される
3. `api/index.py` は `vercel.json` の設定で Python Serverless Function としてビルドされ、
   ルートの `requirements.txt` から依存が入る
4. Project Settings → Environment Variables に `.env.example` の変数を設定
5. Deploy

`next.config.ts` の rewrites が `/api/py/*` を Function に向けるので、
フロントのコードは開発でも本番でも同じパスを叩けます。

> バックエンドを Render 等に分離したくなったら、`API_ORIGIN` を設定するだけで rewrites の
> 向き先が切り替わります（フロントの変更は不要）。

### タブレットへのインストール（PWA）

1. デプロイ後のURLをタブレットのブラウザで開く
2. Android Chrome: メニュー →「アプリをインストール」
   iPad Safari: 共有 →「ホーム画面に追加」
3. アイコンから起動すると URLバー・戻るボタンのないフルスクリーンで動きます
   （アプリ内の大きな「◀」で戻れます）

音声認識（車掌さんマイク）は **HTTPS または localhost でのみ** 動作します。

## MVPで割り切っていること

- **停車駅は「日中の代表パターン」の固定データ。ここだけ出典で裏が取れていない**
  （時間帯・曜日による違いも未対応）。ODPT / GTFS で置き換えるのが本筋
- 駅の緯度経度は Wikipedia(ja) の記事座標。東加古川駅のみ記事に座標がなく概算値
- 写真は Wikimedia Commons。多くが CC BY-SA で**表示にクレジットが必須**なため、
  撮影者とライセンスを画像上に必ず出す。クレジットが読めないほど小さい場所
  （マップのポップアップ）では写真ではなく内蔵イラストを使う
- 取得できない車両は内蔵SVGイラストにフォールバック（APIキー無しでも成立する）
- 地図タイルは OpenStreetMap の公式タイル。アクセスが増えるならタイル提供元の検討が必要
- 「もっとくわしく」はアプリ内モックのまま（要件 Phase1）

## アイコンの作り直し

```bash
npm run icons
```

[scripts/generate-icons.mjs](scripts/generate-icons.mjs) が `public/icons/` のPNGを再生成します。
