import type { Line, Network, NetworkId } from "./types";
import { wikipedia } from "./citations";

/**
 * 路線・列車種別マスタ。
 *
 * **停車駅は「日中の代表的なパターン」**で、時間帯・曜日によって実際は変わる。
 * ここだけは出典で裏を取れていない（ODPT / GTFS で置き換えるのが本筋）。
 * 一方、description に書いた事実は sources で裏を取る。
 */

export const networks: Network[] = [
  {
    id: "shinkansen",
    name: "新幹線《しんかんせん》",
    formalName: "東海道《とうかいどう》新幹線《しんかんせん》",
    color: "#0b57d0",
    emoji: "🚄",
  },
  {
    id: "jrwest",
    name: "JR西日本《にしにほん》",
    formalName: "JR西日本《にしにほん》",
    color: "#1e9e5a",
    emoji: "🚃",
  },
  {
    id: "ohmi",
    name: "近江鉄道《おうみてつどう》",
    formalName: "近江鉄道《おうみてつどう》",
    color: "#e2661a",
    emoji: "🚞",
  },
];

export const networkMap: Record<NetworkId, Network> = Object.fromEntries(
  networks.map((n) => [n.id, n]),
) as Record<NetworkId, Network>;

// ---------- 駅の並び ----------

const BIWAKO = [
  "maibara", "hikone", "minami-hikone", "kawase", "inae", "notogawa", "azuchi",
  "omi-hachiman", "shinohara", "yasu", "moriyama", "ritto", "kusatsu",
  "minami-kusatsu", "seta", "ishiyama", "zeze", "otsu", "yamashina", "kyoto",
];

const JR_KYOTO = [
  "kyoto", "nishioji", "katsuragawa", "mukomachi", "nagaokakyo", "yamazaki",
  "shimamoto", "takatsuki", "settsu-tonda", "jr-sojiji", "ibaraki", "senrioka",
  "kishibe", "suita", "higashi-yodogawa", "shin-osaka", "osaka",
];

const JR_KOBE = [
  "osaka", "tsukamoto", "amagasaki", "tachibana", "koshienguchi", "nishinomiya",
  "sakura-shukugawa", "ashiya", "konan-yamate", "settsu-motoyama", "sumiyoshi",
  "rokkomichi", "maya", "nada", "sannomiya", "motomachi", "kobe", "hyogo",
  "shin-nagata", "takatori", "suma-kaihinkoen", "suma", "shioya", "tarumi",
  "maiko", "asagiri", "akashi", "nishi-akashi", "okubo", "uozumi", "tsuchiyama",
  "higashi-kakogawa", "kakogawa", "hoden", "sone", "himeji-bessho", "gochaku",
  "higashi-himeji", "himeji",
];

const SHINKANSEN = [
  "tokyo", "shinagawa", "shin-yokohama", "odawara", "atami", "mishima",
  "shin-fuji", "shizuoka", "kakegawa", "hamamatsu", "toyohashi", "mikawa-anjo",
  "nagoya", "gifu-hashima", "maibara", "kyoto", "shin-osaka",
];

const OHMI_MAIN = [
  "maibara", "fujitec-mae", "toriimoto", "hikone", "hikone-serikawa",
  "hikoneguchi", "takamiya", "amago", "toyosato", "echigawa", "gokasho",
  "kawabe-no-mori", "yokaichi", "haseno", "daigaku-mae", "kyocera-mae",
  "sakuragawa", "asahi-otsuka", "asahino", "hino", "minakuchi-matsuo",
  "minakuchi", "minakuchi-ishibashi", "minakuchi-jonan", "kibukawa",
];

const OHMI_TAGA = ["takamiya", "screen", "taga-taisha-mae"];

const OHMI_YOKAICHI = [
  "omi-hachiman", "musa", "hirata", "ichinobe", "tarobogu-mae", "shin-yokaichi",
  "yokaichi",
];

// ---------- 路線 ----------

export const lines: Line[] = [
  {
    id: "tokaido-shinkansen",
    network: "shinkansen",
    name: "東海道《とうかいどう》新幹線《しんかんせん》",
    kana: "とうかいどうしんかんせん",
    color: "#0b57d0",
    stationIds: SHINKANSEN,
    types: [
      {
        id: "nozomi",
        name: "のぞみ",
        kana: "のぞみ",
        color: "#e5342a",
        description:
          "いちばん 速《はや》い 新幹線《しんかんせん》。東京《とうきょう》から 新大阪《しんおおさか》まで 約《やく》2時間《じかん》30分《ぷん》！",
        stops: ["tokyo", "shinagawa", "shin-yokohama", "nagoya", "kyoto", "shin-osaka"],
        sources: [wikipedia("のぞみ (列車)")],
      },
      {
        id: "hikari",
        name: "ひかり",
        kana: "ひかり",
        color: "#f5a623",
        description:
          "のぞみの つぎに 速《はや》い 新幹線《しんかんせん》。静岡《しずおか》や 浜松《はままつ》にも 止《と》まるよ。",
        stops: [
          "tokyo", "shinagawa", "shin-yokohama", "shizuoka", "hamamatsu",
          "nagoya", "kyoto", "shin-osaka",
        ],
        sources: [wikipedia("ひかり (列車)")],
      },
      {
        id: "kodama",
        name: "こだま",
        kana: "こだま",
        color: "#3aa76d",
        description:
          "全部《ぜんぶ》の 駅《えき》に 止《と》まる 新幹線《しんかんせん》。ゆっくり 旅《たび》が できるよ。",
        stops: SHINKANSEN,
        sources: [wikipedia("こだま (列車)")],
      },
    ],
    sources: [wikipedia("東海道新幹線")],
  },
  {
    id: "biwako",
    network: "jrwest",
    name: "琵琶湖線《びわこせん》",
    kana: "びわこせん",
    color: "#1e9e5a",
    stationIds: BIWAKO,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#4b7bec",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: BIWAKO,
      },
      {
        id: "kaisoku",
        name: "快速《かいそく》",
        kana: "かいそく",
        color: "#2f9e44",
        description: "琵琶湖線《びわこせん》の 中《なか》では 全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: BIWAKO,
      },
      {
        id: "shinkaisoku",
        name: "新快速《しんかいそく》",
        kana: "しんかいそく",
        color: "#e5342a",
        description: "とっても 速《はや》い！ 130キロで 走《はし》る 人気者《にんきもの》だよ。",
        sources: [wikipedia("新快速")],
        stops: [
          "maibara", "hikone", "notogawa", "omi-hachiman", "yasu", "moriyama",
          "kusatsu", "minami-kusatsu", "ishiyama", "otsu", "yamashina", "kyoto",
        ],
      },
    ],
    sources: [wikipedia("琵琶湖線")],
  },
  {
    id: "jr-kyoto",
    network: "jrwest",
    name: "JR京都線《きょうとせん》",
    kana: "じぇいあーるきょうとせん",
    color: "#1e9e5a",
    stationIds: JR_KYOTO,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#4b7bec",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: JR_KYOTO,
      },
      {
        id: "kaisoku",
        name: "快速《かいそく》",
        kana: "かいそく",
        color: "#2f9e44",
        description:
          "高槻《たかつき》までは 全部《ぜんぶ》の 駅《えき》に 止《と》まって、その 先《さき》は いくつか とばすよ。",
        stops: [
          "kyoto", "nishioji", "katsuragawa", "mukomachi", "nagaokakyo",
          "yamazaki", "shimamoto", "takatsuki", "ibaraki", "shin-osaka", "osaka",
        ],
      },
      {
        id: "shinkaisoku",
        name: "新快速《しんかいそく》",
        kana: "しんかいそく",
        color: "#e5342a",
        description: "京都《きょうと》から 大阪《おおさか》まで たったの 3駅《えき》！ ビュンと 走《はし》るよ。",
        stops: ["kyoto", "takatsuki", "shin-osaka", "osaka"],
        sources: [wikipedia("新快速")],
      },
    ],
    sources: [wikipedia("JR京都線")],
  },
  {
    id: "jr-kobe",
    network: "jrwest",
    name: "JR神戸線《こうべせん》",
    kana: "じぇいあーるこうべせん",
    color: "#1e9e5a",
    stationIds: JR_KOBE,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#4b7bec",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: JR_KOBE,
      },
      {
        id: "kaisoku",
        name: "快速《かいそく》",
        kana: "かいそく",
        color: "#2f9e44",
        description: "大阪《おおさか》の 近《ちか》くで いくつかの 駅《えき》を とばして 走《はし》るよ。",
        stops: JR_KOBE.filter(
          (id) =>
            ![
              "tsukamoto", "tachibana", "koshienguchi", "nishinomiya",
              "sakura-shukugawa", "konan-yamate", "settsu-motoyama", "maya",
              "nada",
            ].includes(id),
        ),
      },
      {
        id: "shinkaisoku",
        name: "新快速《しんかいそく》",
        kana: "しんかいそく",
        color: "#e5342a",
        description: "大阪《おおさか》から 姫路《ひめじ》まで 約《やく》1時間《じかん》。とっても 速《はや》いね！",
        stops: [
          "osaka", "amagasaki", "ashiya", "sannomiya", "motomachi", "kobe",
          "akashi", "nishi-akashi", "kakogawa", "himeji",
        ],
        sources: [wikipedia("新快速")],
      },
    ],
    sources: [wikipedia("JR神戸線")],
  },
  {
    id: "ohmi-main",
    network: "ohmi",
    name: "近江鉄道《おうみてつどう》本線《ほんせん》",
    kana: "おうみてつどうほんせん",
    color: "#e2661a",
    stationIds: OHMI_MAIN,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#e2661a",
        description: "米原《まいばら》から 貴生川《きぶかわ》まで、全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: OHMI_MAIN,
      },
    ],
    sources: [wikipedia("近江鉄道本線")],
  },
  {
    id: "ohmi-taga",
    network: "ohmi",
    name: "多賀線《たがせん》",
    kana: "たがせん",
    color: "#c0392b",
    stationIds: OHMI_TAGA,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#c0392b",
        description:
          "高宮《たかみや》から 多賀大社前《たがたいしゃまえ》まで、3つの 駅《えき》の 短《みじか》い 路線《ろせん》。",
        stops: OHMI_TAGA,
      },
    ],
    sources: [wikipedia("近江鉄道多賀線")],
  },
  {
    id: "ohmi-yokaichi",
    network: "ohmi",
    name: "八日市線《ようかいちせん》",
    kana: "ようかいちせん",
    color: "#8e44ad",
    stationIds: OHMI_YOKAICHI,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#8e44ad",
        description:
          "「｜万葉あかね線《まんようあかねせん》」とも よばれる 路線《ろせん》。近江八幡《おうみはちまん》から 八日市《ようかいち》まで。",
        stops: OHMI_YOKAICHI,
      },
    ],
    sources: [wikipedia("近江鉄道八日市線")],
  },
];

export const lineMap: Record<string, Line> = Object.fromEntries(
  lines.map((l) => [l.id, l]),
);

export function getLine(id: string): Line | undefined {
  return lineMap[id];
}

export function linesOfNetwork(network: NetworkId): Line[] {
  return lines.filter((l) => l.network === network);
}

/** ある駅を通る路線を返す */
export function linesAtStation(stationId: string): Line[] {
  return lines.filter((l) => l.stationIds.includes(stationId));
}
