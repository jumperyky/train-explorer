# ふりがな（ルビ）実装の引き継ぎメモ

子ども向けアプリ「でんしゃ・えき たんけんたい」でふりがなを実装したときに踏んだ落とし穴と、
その回避方法をまとめたもの。**このファイルは単体で完結しているので、他のプロジェクトに
そのままコピーしてよい。**

---

## 結論（急ぐ人はここだけ）

1. 記法は**必ず終端を持つ形**にする → `漢字《よみ》`（青空文庫式）
2. ルビは**漢字だけ**に振る。送り仮名・助詞はルビの外に出す
3. 親文字にかなが混じるときは `｜` で**始まりを明示**する
4. **検査スクリプトを最初に書く**。ルビの崩れは目視では見つからない

---

## 1. 区切りのない記法は必ず壊れる

最初にこう決めた。

```
漢字|よみ
```

これは動かない。**読みがどこで終わるか決まっていない**ので、後ろのかなを飲み込む。

```
"電車|でんしゃの 秘密|ひみつ"
→ ルビが「でんしゃの」になる（正しくは「でんしゃ」）

"活躍|かつやくしているよ"
→ ルビが「かつやくしているよ」になる
```

たちが悪いのは、**直後が「」や句読点なら偶然正しく見える**こと。

```
"「大和路快速|やまとじかいそく」でも"   ← これは正しく出る
```

そのため一部だけ見て「動いている」と誤判定する。実際このプロジェクトでは
数十件が壊れた状態で数コミット進んでしまった。

### 対策

`《》` で読みを閉じる。これだけで構造的に起こらなくなる。

```
"電車《でんしゃ》の秘密《ひみつ》"
"活躍《かつやく》しているよ"
```

---

## 2. 送り仮名を巻き込まない

親文字は**漢字だけ**。送り仮名はルビの外。

| ❌ 間違い | ✅ 正しい | 表示 |
| --- | --- | --- |
| `止《とまる》` | `止《と》まる` | 止(と)まる |
| `走《はしっている》` | `走《はし》っている` | 走(はし)っている |
| `大《おおきくて》` | `大《おお》きくて` | 大(おお)きくて |
| `乗《のりかえ》` | `乗《の》りかえ` | 乗(の)りかえ |
| `詳《くわしく》` | `詳《くわ》しく` | 詳(くわ)しく |

複合語も同じ。

```
乗《の》り入《い》れる     ← 乗り入れる
2階建《かいだ》て          ← 2階建て（「2」はルビ対象外）
```

---

## 3. 親文字にかなが混じるとき

親文字は「`《` の直前にある漢字の連なり」と定義するのが素直。だが
**かな交じりの固有名詞**はそれだと足りない。

```
"三ノ宮《さんのみや》"
→ 親文字が「宮」だけになり、宮(さんのみや)ノ三 のような崩れ方をする
```

`｜`（全角パイプ）で親文字の開始位置を明示する。

```
"｜三ノ宮《さんのみや》"
"｜京セラ前《きょうせらまえ》"
"｜くいな橋《くいなばし》"
"｜おごと温泉《おごとおんせん》"
"｜木ノ本《きのもと》"
"｜高の原《たかのはら》"
```

**判定ルール**: 親文字が全部漢字なら `｜` は不要、かなやカナが混じるなら必須。

---

## 4. カタカナ・ひらがなだけの名前にはルビを振らない

```
"マキノ"        ← ルビ不要（駅名）
"スクリーン"    ← ルビ不要
"ドクターイエロー" ← ルビ不要
```

自動生成するときは「漢字が1文字も含まれないならルビを付けない」で分岐する。

---

## 5. パーサ実装

正規表現ひとつで足りる。

```ts
/** ｜で始まる親文字、または《》直前の漢字（々・〆・ヶ を含む）の連なり */
const RUBY_PATTERN = /(?:｜([^｜《》]+)|([一-鿿々〆ヶ]+))《([^《》]+)》/g;

export type RubySegment =
  | { kind: "text"; text: string }
  | { kind: "ruby"; base: string; reading: string };

export function parseRuby(input: string): RubySegment[] {
  const segments: RubySegment[] = [];
  let cursor = 0;
  RUBY_PATTERN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RUBY_PATTERN.exec(input)) !== null) {
    const [whole, explicitBase, kanjiBase, reading] = m;
    if (m.index > cursor) {
      segments.push({ kind: "text", text: input.slice(cursor, m.index) });
    }
    segments.push({ kind: "ruby", base: explicitBase ?? kanjiBase, reading });
    cursor = m.index + whole.length;
  }
  if (cursor < input.length) {
    segments.push({ kind: "text", text: input.slice(cursor) });
  }
  return segments;
}

/** ルビ記法を除いた見た目どおりの文字列（aria-label、検索、タイトル用） */
export const toPlainText = (s: string) =>
  parseRuby(s).map((x) => (x.kind === "text" ? x.text : x.base)).join("");

/** 全部かなに開いた文字列（音声検索の照合用） */
export const toReading = (s: string) =>
  parseRuby(s).map((x) => (x.kind === "text" ? x.text : x.reading)).join("");
```

描画側。

```tsx
export default function RubyText({ text }: { text: string }) {
  return (
    <span aria-label={toPlainText(text)}>
      {parseRuby(text).map((seg, i) =>
        seg.kind === "text" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <ruby key={i}>
            {seg.base}
            <rp>(</rp>
            <rt>{seg.reading}</rt>
            <rp>)</rp>
          </ruby>
        ),
      )}
    </span>
  );
}
```

`<rp>` は ruby 非対応環境で括弧を出すための保険。読み上げ対策として
`aria-label` にルビ抜きの文字列を入れておく（入れないと「でんしゃでんしゃ」のように
二重に読まれる環境がある）。

---

## 6. CSS

ブラウザ既定のルビは**子どもには小さすぎ、行間が足りず上下が重なる**。

```css
/* ルビを大きめに。既定は 50% だがブラウザ差があるので明示する */
ruby > rt {
  font-size: 0.5em;
  font-weight: 700;
  ruby-position: over;
  ruby-align: center;
}

/* ルビが乗る行は行間を広げる。これを忘れると上の行と衝突する */
.ruby-line {
  line-height: 2;
}
```

`.ruby-line` はルビを含む要素に必ず付ける。付け忘れると、
**ルビが上の行の文字にかぶる**という見つけにくい崩れ方をする。

---

## 7. 自動生成（pykakasi / MeCab）は送り仮名込みで返る

サーバ側でルビを振る場合、形態素解析器は「走って」を
`orig=走って / hira=はしって` の形で返す。そのまま使うと §2 の間違いになる。

末尾のひらがなを切り出してからルビにする。

```python
import re

_TRAILING_KANA = re.compile(r"[ぁ-ゖ]+$")

def split_okurigana(word: str) -> tuple[str, str]:
    """「走って」→ ("走", "って")"""
    m = _TRAILING_KANA.search(word)
    return (word[: m.start()], m.group(0)) if m else (word, "")

# 使う側
base, okuri = split_okurigana(orig)
reading = hira[: len(hira) - len(okuri)] if okuri else hira
out.append(f"{base}《{reading}》{okuri}")
```

結果:

```
窓が大きくて景色がよく見える
→ 窓《まど》が大《おお》きくて景色《けしき》がよく見《み》える
```

---

## 8. ルビが使えない場所がある

HTML でない出力先にはルビを渡せない。ここは**ひらがなで書く**か、
`toPlainText()` を通す。

| 場所 | 対応 |
| --- | --- |
| `<title>` / `document.title` | ひらがな、または漢字のみ |
| PWA manifest の `name` / `short_name` | ひらがな（ホーム画面のラベル） |
| `<input placeholder>` | ひらがな |
| `<img alt>` | かな読みを入れる |
| `aria-label` | `toPlainText()` |
| OGP / メタ description | `toPlainText()` |

---

## 9. 検査スクリプトを最初に書く

ルビの崩れは**画面を見ても気づきにくい**（小さい文字なので）。機械で見る。

```js
// scripts/check-ruby.mjs
const TOKEN = /(?:｜([^｜《》]+)|([一-鿿々〆ヶ]+))《([^《》]+)》/g;

/**
 * 漢字1文字あたりの読みの上限。
 * 1文字は訓読みが長いことがある（弟=おとうと、志=こころざし）ので緩める。
 * 2文字以上は熟語なので、1文字あたり3かなを超えたら送り仮名を巻き込んだ疑い。
 */
const maxKana = (base) => (base.length === 1 ? 5 : base.length * 3);

// src 配下を走査して maxKana を超えるものを警告する
```

このプロジェクトでは、この検査が
`弟《おとうと》` を誤検知したことで**しきい値の設計ミスに気づけた**し、
`前《きょうせらまえ》`（京セラ前の親文字が「前」だけになっていた）と
`宮《さんのみや》`（三ノ宮）の2件を実際に見つけた。

---

## 10. 目視・テキスト抽出での確認は当てにならない

`innerText` や `textContent` でルビ付きテキストを取ると、ルビが**本文の直後に
連結されて**見える。

```
実際の表示:  電車      ← 上に「でんしゃ」
innerText:  電車でんしゃ
```

これを見て「ルビが横に流れている」と誤解しやすい。確認は DOM か座標で行う。

```js
// ルビが親文字の上に乗っているかを実測する
const r = document.querySelector('ruby');
const rt = r.querySelector('rt').getBoundingClientRect();
const range = document.createRange();
range.selectNodeContents(r.firstChild);
const base = range.getBoundingClientRect();
console.log(rt.top < base.top, getComputedStyle(r.querySelector('rt')).rubyPosition);
// → true "over" なら正しく上に乗っている
```

親文字と読みの対応を一覧で確認するならこちら。

```js
[...document.querySelectorAll('ruby')].map(r => {
  const base = [...r.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
  return base + '(' + r.querySelector('rt').textContent + ')';
});
// → ["電車(でんしゃ)", "秘密(ひみつ)", ...]
// ここで "電車(でんしゃの)" のようになっていたら §1 の症状
```

---

## 11. データを書くときのチェックリスト

- [ ] ルビは漢字だけに振ったか（送り仮名・助詞が入っていないか）
- [ ] かな交じりの親文字に `｜` を付けたか
- [ ] カタカナのみの語にルビを付けていないか
- [ ] ルビを含む要素に `.ruby-line`（行間確保）を付けたか
- [ ] `<title>` / manifest / placeholder にルビ記法が漏れていないか
- [ ] 検査スクリプトを通したか

---

## 付録: 記法の選択について

`《》` を選んだのは日本語の組版で実績がある（青空文庫）ため。他の候補と比較すると:

| 記法 | 評価 |
| --- | --- |
| `漢字\|よみ` | ✗ 終端がなく後続のかなを飲み込む |
| `{漢字\|よみ}` | △ 動くが記述が冗長、閉じ忘れに弱い |
| `漢字《よみ》` | ○ 終端が明確、日本語話者に馴染みがある |
| HTML の `<ruby>` を直接データに書く | ✗ データが表示層に依存し、検索や読み上げで使い回せない |

データは**記法で持ち、描画時に `<ruby>` へ変換する**のがよい。
そうすると同じ文字列から `toPlainText()`（検索・aria）と
`toReading()`（音声認識の照合）を導出できる。
