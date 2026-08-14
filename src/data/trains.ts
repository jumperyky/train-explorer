import type { Train } from "./types";

/**
 * 車両マスタ（MVPモックデータ）。
 * 画像は wikipediaTitle をキーに /api/py/image（画像取得プロキシ）から取りに行き、
 * 取得できないときは内蔵のイラスト（TrainArt）を表示する。
 */
export const trains: Train[] = [
  // ===== 東海道新幹線 =====
  {
    id: "n700s",
    network: "shinkansen",
    name: "N700S",
    kana: "えぬななひゃくえす",
    maxSpeed: 300,
    debutYear: 2020,
    bodyColor: "#ffffff",
    stripeColor: "#2b5fd9",
    secrets: [
      "「S」は「Supreme（最高《さいこう》）」という 意味《いみ》だよ。",
      "先頭《せんとう》の 形《かたち》は「デュアルスプリームウィング形《がた》」と いうんだ。",
      "電気《でんき》が 止《と》まっても、バッテリーで 少《すこ》し 走《はし》れる すごい 新幹線《しんかんせん》。",
    ],
    lineIds: ["tokaido-shinkansen"],
    wikipediaTitle: "新幹線N700S系電車",
    aliases: ["えぬななひゃくえす", "えぬせぶんはんどれっどえす", "のぞみ", "しんかんせん"],
  },
  {
    id: "n700a",
    network: "shinkansen",
    name: "N700系《けい》",
    kana: "えぬななひゃくけい",
    maxSpeed: 285,
    debutYear: 2007,
    bodyColor: "#ffffff",
    stripeColor: "#1f4fb6",
    secrets: [
      "カーブでも スピードを 落《お》とさない「車体傾斜《しゃたいけいしゃ》」の しくみを もつよ。",
      "「A」は「Advanced（すすんだ）」という 意味《いみ》。",
      "のぞみ・ひかり・こだま、全部《ぜんぶ》で 走《はし》っているよ。",
    ],
    lineIds: ["tokaido-shinkansen"],
    wikipediaTitle: "新幹線N700系電車",
    aliases: ["えぬななひゃくけい", "えぬななひゃく", "ひかり", "こだま"],
  },
  {
    id: "doctor-yellow",
    network: "shinkansen",
    name: "ドクターイエロー",
    kana: "どくたーいえろー",
    maxSpeed: 270,
    debutYear: 2001,
    bodyColor: "#ffd400",
    stripeColor: "#1f4fb6",
    secrets: [
      "黄色《きいろ》い 新幹線《しんかんせん》。見《み》ると 幸《しあわ》せに なるって いわれているよ。",
      "線路《せんろ》や 電線《でんせん》が こわれていないか 調《しら》べる お医者《いしゃ》さんの 電車《でんしゃ》。",
      "いつ 走《はし》るか 発表《はっぴょう》されないので、会《あ》えたら ラッキー！",
    ],
    lineIds: ["tokaido-shinkansen"],
    wikipediaTitle: "新幹線923形電車",
    aliases: ["どくたーいえろー", "きいろいしんかんせん", "どくたー"],
  },

  // ===== JR西日本 =====
  {
    id: "jrw-223",
    network: "jrwest",
    name: "223系《けい》",
    kana: "にひゃくにじゅうさんけい",
    maxSpeed: 130,
    debutYear: 1995,
    bodyColor: "#e9edf2",
    stripeColor: "#0b5ea8",
    secrets: [
      "新快速《しんかいそく》で 130キロ！ 在来線《ざいらいせん》では 日本《にほん》で いちばんクラスの 速《はや》さ。",
      "窓《まど》が 大《おお》きくて、外《そと》が よく 見《み》えるよ。",
      "2階建《かいだ》ての「Aシート」は ついていないけれど、すわり心地《ごこち》が いいんだ。",
    ],
    lineIds: ["biwako", "jr-kyoto", "jr-kobe"],
    wikipediaTitle: "JR西日本223系電車",
    aliases: ["にひゃくにじゅうさんけい", "しんかいそく", "にーにーさん"],
  },
  {
    id: "jrw-225",
    network: "jrwest",
    name: "225系《けい》",
    kana: "にひゃくにじゅうごけい",
    maxSpeed: 130,
    debutYear: 2010,
    bodyColor: "#f2f4f7",
    stripeColor: "#0b5ea8",
    secrets: [
      "223系《けい》の 新《あたら》しい 仲間《なかま》。顔《かお》が まるっこいのが 特徴《とくちょう》。",
      "ぶつかっても つよいように、先頭《せんとう》が がんじょうに つくられているよ。",
      "新快速《しんかいそく》・快速《かいそく》・普通《ふつう》、いろいろな 種別《しゅべつ》で 走《はし》るよ。",
    ],
    lineIds: ["biwako", "jr-kyoto", "jr-kobe"],
    wikipediaTitle: "JR西日本225系電車",
    aliases: ["にひゃくにじゅうごけい", "にーにーご"],
  },
  {
    id: "jrw-221",
    network: "jrwest",
    name: "221系《けい》",
    kana: "にひゃくにじゅういちけい",
    maxSpeed: 120,
    debutYear: 1989,
    bodyColor: "#f7f7f2",
    stripeColor: "#3aa76d",
    secrets: [
      "窓《まど》が とっても 大《おお》きくて、景色《けしき》が よく 見《み》える 電車《でんしゃ》。",
      "「大和路快速《やまとじかいそく》」でも 活躍《かつやく》しているよ。",
      "今《いま》は 主《おも》に 普通《ふつう》や 快速《かいそく》で 走《はし》っているよ。",
    ],
    lineIds: ["biwako", "jr-kyoto", "jr-kobe"],
    wikipediaTitle: "JR西日本221系電車",
    aliases: ["にひゃくにじゅういちけい", "にーにーいち"],
  },
  {
    id: "jrw-207",
    network: "jrwest",
    name: "207系《けい》",
    kana: "にひゃくななけい",
    maxSpeed: 120,
    debutYear: 1991,
    bodyColor: "#eef1f4",
    stripeColor: "#1f6fb2",
    secrets: [
      "青《あお》と オレンジの ラインが 目印《めじるし》。",
      "止《と》まったり 走《はし》ったり するのが 得意《とくい》で、普通電車《ふつうでんしゃ》で 活躍《かつやく》。",
      "「JR宝塚線《たからづかせん》」や「JR東西線《とうざいせん》」にも 乗《の》り入《い》れるよ。",
    ],
    lineIds: ["jr-kyoto", "jr-kobe"],
    wikipediaTitle: "JR西日本207系電車",
    aliases: ["にひゃくななけい", "にーまるなな"],
  },
  {
    id: "jrw-321",
    network: "jrwest",
    name: "321系《けい》",
    kana: "さんびゃくにじゅういちけい",
    maxSpeed: 120,
    debutYear: 2005,
    bodyColor: "#eef1f4",
    stripeColor: "#1f6fb2",
    secrets: [
      "207系《けい》の あとに つくられた 新《あたら》しい 普通電車《ふつうでんしゃ》。",
      "天井《てんじょう》に 駅名《えきめい》を おしえてくれる 画面《がめん》が ついているよ。",
      "モーターの 音《おと》が しずかで、ゆれが 少《すく》ないんだ。",
    ],
    lineIds: ["jr-kyoto", "jr-kobe"],
    wikipediaTitle: "JR西日本321系電車",
    aliases: ["さんびゃくにじゅういちけい", "さんにーいち"],
  },

  // ===== 近江鉄道 =====
  {
    id: "ohmi-100",
    network: "ohmi",
    name: "100形《がた》",
    kana: "ひゃくがた",
    maxSpeed: 85,
    debutYear: 2013,
    bodyColor: "#f4a300",
    stripeColor: "#2e7d32",
    secrets: [
      "「湘南色《しょうなんしょく》」の 緑《みどり》と オレンジの 電車《でんしゃ》が いるよ。",
      "もとは 東京《とうきょう》の 西武鉄道《せいぶてつどう》を 走《はし》っていた 電車《でんしゃ》なんだ。",
      "2両《りょう》 つないで 走《はし》ることが 多《おお》いよ。",
    ],
    lineIds: ["ohmi-main", "ohmi-taga", "ohmi-yokaichi"],
    wikipediaTitle: "近江鉄道100形電車 (2代)",
    aliases: ["ひゃくがた", "おうみてつどう"],
  },
  {
    id: "ohmi-900",
    network: "ohmi",
    name: "900形《がた》 あかね号《ごう》",
    kana: "きゅうひゃくがた あかねごう",
    maxSpeed: 85,
    debutYear: 2013,
    bodyColor: "#c8102e",
    stripeColor: "#ffd400",
    secrets: [
      "まっかな 体《からだ》が かっこいい「あかね号《ごう》」。",
      "「｜万葉あかね線《まんようあかねせん》」の 名前《なまえ》から つけられたよ。",
      "1編成《へんせい》しか いないので、会《あ》えたら 特別《とくべつ》！",
    ],
    lineIds: ["ohmi-main", "ohmi-yokaichi"],
    wikipediaTitle: "近江鉄道900形電車",
    aliases: ["あかねごう", "あかね", "きゅうひゃくがた"],
  },
  {
    id: "ohmi-800",
    network: "ohmi",
    name: "800系《けい》",
    kana: "はっぴゃくけい",
    maxSpeed: 85,
    debutYear: 1991,
    bodyColor: "#ffffff",
    stripeColor: "#e2661a",
    secrets: [
      "いろいろな ラッピング（絵《え》）が かかれていて、見《み》るたびに ちがうよ。",
      "こちらも もとは 西武鉄道《せいぶてつどう》の 電車《でんしゃ》。",
      "本線《ほんせん》・多賀線《たがせん》・八日市線《ようかいちせん》の どこでも 会《あ》えるよ。",
    ],
    lineIds: ["ohmi-main", "ohmi-taga", "ohmi-yokaichi"],
    wikipediaTitle: "近江鉄道800系電車",
    aliases: ["はっぴゃくけい", "はちひゃくけい"],
  },
];

export const trainMap: Record<string, Train> = Object.fromEntries(
  trains.map((t) => [t.id, t]),
);

/** ある路線を走る車両 */
export function trainsOnLine(lineId: string): Train[] {
  return trains.filter((t) => t.lineIds.includes(lineId));
}
