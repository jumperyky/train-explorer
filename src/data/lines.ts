import type { Line, Network, NetworkId, Station } from "./types";
import { stationMap, stations } from "./stations";
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
  {
    id: "keihan",
    name: "京阪電車《けいはんでんしゃ》",
    formalName: "京阪電気鉄道《けいはんでんきてつどう》",
    color: "#0e7a3c",
    emoji: "🚋",
  },
  {
    id: "kyoto-subway",
    name: "京都市営地下鉄《きょうとしえいちかてつ》",
    formalName: "京都市営地下鉄《きょうとしえいちかてつ》",
    color: "#7a2fa0",
    emoji: "🚇",
  },
  {
    id: "shigaraki",
    name: "信楽高原鐵道《しがらきこうげんてつどう》",
    formalName: "信楽高原鐵道《しがらきこうげんてつどう》",
    color: "#e5007f",
    emoji: "🚝",
  },
  {
    id: "hankyu",
    name: "阪急電車《はんきゅうでんしゃ》",
    formalName: "阪急電鉄《はんきゅうでんてつ》",
    color: "#7a1f2b",
    emoji: "🚟",
  },
  {
    id: "kintetsu",
    name: "近鉄《きんてつ》",
    formalName: "近畿日本鉄道《きんきにっぽんてつどう》",
    color: "#c8501e",
    emoji: "🚈",
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

// 京阪本線・鴨東線（淀屋橋〜出町柳）。記事の駅一覧が鴨東線まで通しなので1路線にする
const KEIHAN_MAIN = [
  "yodoyabashi", "kitahama", "temmabashi", "kyobashi", "noe", "sekime",
  "morishoji", "sembayashi", "takii", "doi", "moriguchishi", "nishisanso",
  "kadoma-shi", "furukawabashi", "owada", "kayashima", "neyagawashi", "korien",
  "kozenji", "hirakata-koen", "hirakatashi", "goten-yama", "makino", "kuzuha",
  "hashimoto", "iwashimizu-hachimangu", "yodo", "chushojima", "fushimi-momoyama",
  "tambabashi", "sumizome", "fujinomori", "ryukokudai-mae-fukakusa",
  "fushimi-inari", "toba-kaido", "tofukuji", "shichijo", "kiyomizu-gojo",
  "gion-shijo", "sanjo", "jingu-marutamachi", "demachiyanagi",
];

const KEIHAN_ISHIYAMAZAKA = [
  "ishiyamadera", "karahashimae", "keihan-ishiyama", "awazu", "kawaragahama",
  "nakanosho", "zezehommachi", "nishiki", "keihan-zeze", "ishiba", "shimanoseki",
  "biwako-hamaotsu", "miidera", "otsu-shiyakusho-mae", "keihan-otsukyo",
  "omijingumae", "minami-shiga", "shigasato", "ano", "matsunobamba",
  "sakamoto-hieizanguchi",
];

const KEIHAN_KEISHIN = [
  "misasagi", "keihan-yamashina", "shinomiya", "oiwake", "otani",
  "kamisakaemachi", "biwako-hamaotsu",
];

const KARASUMA = [
  "kokusaikaikan", "matsugasaki", "kitayama", "kitaoji", "kuramaguchi",
  "imadegawa", "marutamachi", "karasuma-oike", "shijo", "gojo", "kyoto", "kujo",
  "jujo", "kuinabashi", "takeda",
];

const TOZAI = [
  "rokujizo", "ishida", "daigo", "ono", "nagitsuji", "higashino", "yamashina",
  "misasagi", "keage", "higashiyama", "sanjo-keihan", "kyoto-shiyakusho-mae",
  "karasuma-oike", "nijojo-mae", "nijo", "nishioji-oike", "uzumasa-tenjingawa",
];

const SHIGARAKI = [
  "kibukawa", "shigarakigushi", "kumoi", "chokushi", "gyokukeijimae",
  "shigaraki",
];

const HANKYU_KOBE = [
  "osakaumeda", "nakatsu", "juso", "kanzakigawa", "sonoda", "tsukaguchi",
  "mukonoso", "nishinomiya-kitaguchi", "shukugawa", "ashiyagawa", "okamoto",
  "mikage", "rokko", "oji-koen", "kasuganomichi", "kobesannomiya",
];

const HANKYU_TAKARAZUKA = [
  "osakaumeda", "nakatsu", "juso", "mikuni", "shonai", "hattori-tenjin",
  "hankyu-sone", "okamachi", "toyonaka", "hotarugaike", "ishibashi-handai-mae",
  "ikeda", "kawanishi-noseguchi", "hibarigaoka-hanayashiki", "yamamoto",
  "nakayama-kannon", "mefu-jinja", "kiyoshikojin", "takarazuka",
];

const HANKYU_KYOTO = [
  "osakaumeda", "juso", "minamikata", "sozenji", "awaji", "kami-shinjo",
  "aikawa", "shojaku", "settsu-shi", "minami-ibaraki", "ibaraki-shi", "sojiji",
  "tonda", "takatsuki-shi", "kammaki", "minase", "oyamazaki",
  "nishiyama-tennozan", "nagaoka-tenjin", "nishi-muko", "higashi-muko",
  "rakusaiguchi", "katsura", "nishi-kyogoku", "saiin", "omiya", "karasuma",
  "kyoto-kawaramachi",
];

const KINTETSU_KYOTO = [
  "kyoto", "toji", "kintetsu-jujo", "kamitobaguchi", "takeda", "fushimi",
  "kintetsu-tambabashi", "momoyamagoryo-mae", "mukaijima", "ogura", "iseda",
  "kintetsu-okubo", "kutsukawa", "terada", "tonosho", "shin-tanabe", "kodo",
  "miyamaki", "kintetsu-miyazu", "komada", "shin-hosono", "kizugawadai",
  "yamadagawa", "takanohara", "heijo", "yamato-saidaiji",
];

const KOSEI = [
  "yamashina", "otsukyo", "karasaki", "hieizan-sakamoto", "ogoto-onsen",
  "katata", "jrw-ono", "wani", "horai", "shiga", "hira", "omi-maiko",
  "kita-komatsu", "omi-takashima", "adogawa", "shin-asahi", "omi-imazu",
  "omi-nakasho", "jrw-makino", "nagahara", "omi-shiotsu",
];

const HOKURIKU = [
  "maibara", "sakata", "tamura", "nagahama", "torahime", "kawake",
  "jrw-takatsuki", "kinomoto", "yogo", "omi-shiotsu", "shin-hikida", "tsuruga",
];

const KINTETSU_NARA = [
  "osaka-namba", "nippombashi", "osaka-uehommachi", "tsuruhashi", "imazato",
  "fuse", "kawachi-eiwa", "kawachi-kosaka", "yaenosato", "wakae-iwata",
  "kawachi-hanazono", "higashi-hanazono", "hyotan-yama", "hiraoka", "nukata",
  "ishikiri", "ikoma", "higashi-ikoma", "tomio", "gakuen-mae", "ayameike",
  "yamato-saidaiji", "shin-omiya", "kintetsu-nara",
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
      {
        id: "rakuraku-biwako",
        name: "らくラクびわこ",
        kana: "らくらくびわこ",
        color: "#7a2fa0",
        description:
          "朝《あさ》と 夕方《ゆうがた》だけ 走《はし》る 通勤《つうきん》の 特急《とっきゅう》。座《すわ》って 行《い》けるよ。",
        stops: [
          "maibara", "hikone", "omi-hachiman", "yasu", "moriyama", "kusatsu",
          "minami-kusatsu", "ishiyama", "otsu", "yamashina", "kyoto",
        ],
        sources: [wikipedia("らくラクびわこ")],
      },
      {
        id: "haruka",
        name: "はるか",
        kana: "はるか",
        color: "#1f8a70",
        description:
          "関西空港《かんさいくうこう》へ 行《い》く 特急《とっきゅう》。飛行機《ひこうき》に 乗《の》る 人《ひと》を はこぶよ。",
        stops: ["yasu", "kusatsu", "kyoto"],
        sources: [wikipedia("はるか (列車)")],
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
      {
        id: "thunderbird",
        name: "サンダーバード",
        kana: "さんだーばーど",
        color: "#1f4fb6",
        description:
          "大阪《おおさか》から 敦賀《つるが》へ 向《む》かう 特急《とっきゅう》。ここから 湖西線《こせいせん》へ 入《はい》るよ。",
        stops: ["kyoto", "takatsuki", "shin-osaka", "osaka"],
        sources: [wikipedia("サンダーバード (列車)")],
      },
      {
        id: "haruka",
        name: "はるか",
        kana: "はるか",
        color: "#1f8a70",
        description:
          "京都《きょうと》から 関西空港《かんさいくうこう》へ 向《む》かう 特急《とっきゅう》。",
        stops: ["kyoto", "shin-osaka", "osaka"],
        sources: [wikipedia("はるか (列車)")],
      },
      {
        id: "rakuraku-biwako",
        name: "らくラクびわこ",
        kana: "らくらくびわこ",
        color: "#7a2fa0",
        description:
          "米原《まいばら》と 大阪《おおさか》を むすぶ 通勤《つうきん》の 特急《とっきゅう》。高槻《たかつき》は 通過《つうか》するよ。",
        stops: ["kyoto", "shin-osaka", "osaka"],
        sources: [wikipedia("らくラクびわこ")],
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

  // ===== 京阪電車 =====
  {
    id: "keihan-main",
    network: "keihan",
    name: "京阪本線《けいはんほんせん》・鴨東線《おうとうせん》",
    kana: "けいはんほんせん おうとうせん",
    color: "#0e7a3c",
    stationIds: KEIHAN_MAIN,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#5b6b7a",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: KEIHAN_MAIN,
      },
      {
        id: "kyuko",
        name: "急行《きゅうこう》",
        kana: "きゅうこう",
        color: "#f08a5d",
        description:
          "普通《ふつう》より 速《はや》く、特急《とっきゅう》より こまめに 止《と》まる 列車《れっしゃ》。",
        stops: [
          "yodoyabashi", "kitahama", "temmabashi", "kyobashi", "moriguchishi",
          "neyagawashi", "korien", "hirakata-koen", "hirakatashi", "kuzuha",
          "iwashimizu-hachimangu", "yodo", "chushojima", "tambabashi",
          "fushimi-inari", "shichijo", "kiyomizu-gojo", "gion-shijo", "sanjo",
          "jingu-marutamachi", "demachiyanagi",
        ],
        sources: [wikipedia("京阪本線")],
      },
      {
        id: "tokkyu",
        name: "特急《とっきゅう》",
        kana: "とっきゅう",
        color: "#e5342a",
        description:
          "いちばん 速《はや》い 列車《れっしゃ》。2階建《かいだ》ての 車両《しゃりょう》が つながっていることも あるよ。",
        stops: [
          "yodoyabashi", "kitahama", "temmabashi", "kyobashi", "hirakatashi",
          "kuzuha", "chushojima", "tambabashi", "shichijo", "gion-shijo",
          "sanjo", "demachiyanagi",
        ],
        sources: [wikipedia("京阪特急")],
      },
    ],
    sources: [wikipedia("京阪本線"), wikipedia("京阪鴨東線")],
  },
  {
    id: "keihan-ishiyamazaka",
    network: "keihan",
    name: "石山坂本線《いしやまさかもとせん》",
    kana: "いしやまさかもとせん",
    color: "#0091d2",
    stationIds: KEIHAN_ISHIYAMAZAKA,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#0091d2",
        description:
          "石山寺《いしやまでら》から 坂本比叡山口《さかもとひえいざんぐち》まで、琵琶湖《びわこ》の そばを 走《はし》るよ。",
        stops: KEIHAN_ISHIYAMAZAKA,
      },
    ],
    sources: [wikipedia("京阪石山坂本線")],
  },
  {
    id: "keihan-keishin",
    network: "keihan",
    name: "京津線《けいしんせん》",
    kana: "けいしんせん",
    color: "#f39800",
    stationIds: KEIHAN_KEISHIN,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#f39800",
        description:
          "地下鉄《ちかてつ》東西線《とうざいせん》に 乗《の》り入《い》れる、めずらしい 電車《でんしゃ》の 路線《ろせん》。",
        stops: KEIHAN_KEISHIN,
      },
    ],
    sources: [wikipedia("京阪京津線")],
  },

  // ===== 京都市営地下鉄 =====
  {
    id: "karasuma",
    network: "kyoto-subway",
    name: "烏丸線《からすません》",
    kana: "からすません",
    color: "#009944",
    stationIds: KARASUMA,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#009944",
        description:
          "国際会館《こくさいかいかん》から 竹田《たけだ》まで、京都《きょうと》の 街《まち》を たてに つらぬく 地下鉄《ちかてつ》。",
        stops: KARASUMA,
      },
    ],
    sources: [wikipedia("京都市営地下鉄烏丸線")],
  },
  {
    id: "tozai",
    network: "kyoto-subway",
    name: "東西線《とうざいせん》",
    kana: "とうざいせん",
    color: "#e8383d",
    stationIds: TOZAI,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#e8383d",
        description:
          "六地蔵《ろくじぞう》から 太秦天神川《うずまさてんじんがわ》まで、京都《きょうと》を よこに つらぬく 地下鉄《ちかてつ》。",
        stops: TOZAI,
      },
    ],
    sources: [wikipedia("京都市営地下鉄東西線")],
  },

  // ===== 信楽高原鐵道 =====
  {
    id: "shigaraki",
    network: "shigaraki",
    name: "信楽線《しがらきせん》",
    kana: "しがらきせん",
    color: "#e5007f",
    stationIds: SHIGARAKI,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#e5007f",
        description:
          "貴生川《きぶかわ》から 信楽《しがらき》まで、6つの 駅《えき》を むすぶ 単線《たんせん》の 路線《ろせん》。",
        stops: SHIGARAKI,
      },
    ],
    sources: [wikipedia("信楽高原鐵道信楽線")],
  },

  // ===== 阪急電車 =====
  {
    id: "hankyu-kobe",
    network: "hankyu",
    name: "神戸本線《こうべほんせん》",
    kana: "こうべほんせん",
    color: "#7a1f2b",
    stationIds: HANKYU_KOBE,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#5b6b7a",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: HANKYU_KOBE,
      },
      {
        id: "kyuko",
        name: "急行《きゅうこう》",
        kana: "きゅうこう",
        color: "#f08a5d",
        description: "特急《とっきゅう》より こまめに 止《と》まる 列車《れっしゃ》。",
        stops: [
          "osakaumeda", "juso", "tsukaguchi", "nishinomiya-kitaguchi",
          "shukugawa", "ashiyagawa", "okamoto", "mikage", "rokko", "oji-koen",
          "kasuganomichi", "kobesannomiya",
        ],
        sources: [wikipedia("阪急神戸本線")],
      },
      {
        id: "tokkyu",
        name: "特急《とっきゅう》",
        kana: "とっきゅう",
        color: "#e5342a",
        description:
          "大阪梅田《おおさかうめだ》から 神戸三宮《こうべさんのみや》まで、たったの 6駅《えき》！",
        stops: [
          "osakaumeda", "juso", "nishinomiya-kitaguchi", "shukugawa", "okamoto",
          "kobesannomiya",
        ],
        sources: [wikipedia("阪急神戸本線")],
      },
    ],
    sources: [wikipedia("阪急神戸本線")],
  },
  {
    id: "hankyu-takarazuka",
    network: "hankyu",
    name: "宝塚本線《たからづかほんせん》",
    kana: "たからづかほんせん",
    color: "#a03c4a",
    stationIds: HANKYU_TAKARAZUKA,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#5b6b7a",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: HANKYU_TAKARAZUKA,
      },
      {
        id: "kyuko",
        name: "急行《きゅうこう》",
        kana: "きゅうこう",
        color: "#f08a5d",
        description:
          "宝塚《たからづか》まで 行《い》く、こまめに 止《と》まる 速《はや》い 列車《れっしゃ》。",
        stops: [
          "osakaumeda", "juso", "toyonaka", "hotarugaike", "ishibashi-handai-mae",
          "ikeda", "kawanishi-noseguchi", "hibarigaoka-hanayashiki", "yamamoto",
          "nakayama-kannon", "mefu-jinja", "kiyoshikojin", "takarazuka",
        ],
        sources: [wikipedia("阪急宝塚本線")],
      },
      {
        id: "tokkyu",
        name: "特急《とっきゅう》",
        kana: "とっきゅう",
        color: "#e5342a",
        description:
          "川西能勢口《かわにしのせぐち》までを 5駅《えき》で むすぶ、いちばん 速《はや》い 列車《れっしゃ》。",
        stops: [
          "osakaumeda", "juso", "ishibashi-handai-mae", "ikeda",
          "kawanishi-noseguchi",
        ],
        sources: [wikipedia("阪急宝塚本線")],
      },
    ],
    sources: [wikipedia("阪急宝塚本線")],
  },
  {
    id: "hankyu-kyoto",
    network: "hankyu",
    name: "京都本線《きょうとほんせん》",
    kana: "きょうとほんせん",
    color: "#5d2b3a",
    stationIds: HANKYU_KYOTO,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#5b6b7a",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: HANKYU_KYOTO,
      },
      {
        id: "kyuko",
        name: "急行《きゅうこう》",
        kana: "きゅうこう",
        color: "#f08a5d",
        description: "特急《とっきゅう》より こまめに 止《と》まる 列車《れっしゃ》。",
        stops: [
          "osakaumeda", "juso", "minamikata", "awaji", "kami-shinjo",
          "minami-ibaraki", "ibaraki-shi", "takatsuki-shi", "nagaoka-tenjin",
          "katsura", "nishi-kyogoku", "saiin", "omiya", "karasuma",
          "kyoto-kawaramachi",
        ],
        sources: [wikipedia("阪急京都本線")],
      },
      {
        id: "tokkyu",
        name: "特急《とっきゅう》",
        kana: "とっきゅう",
        color: "#e5342a",
        description:
          "大阪梅田《おおさかうめだ》から 京都河原町《きょうとかわらまち》を 9駅《えき》で むすぶよ。",
        stops: [
          "osakaumeda", "juso", "awaji", "ibaraki-shi", "takatsuki-shi",
          "nagaoka-tenjin", "katsura", "karasuma", "kyoto-kawaramachi",
        ],
        sources: [wikipedia("阪急京都本線")],
      },
    ],
    sources: [wikipedia("阪急京都本線")],
  },

  // ===== 近鉄 =====
  {
    id: "kintetsu-kyoto",
    network: "kintetsu",
    name: "近鉄京都線《きんてつきょうとせん》",
    kana: "きんてつきょうとせん",
    color: "#c8501e",
    stationIds: KINTETSU_KYOTO,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#5b6b7a",
        description:
          "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。竹田《たけだ》からは 地下鉄《ちかてつ》の 電車《でんしゃ》も 走《はし》るんだ。",
        stops: KINTETSU_KYOTO,
      },
      {
        id: "tokkyu",
        name: "特急《とっきゅう》",
        kana: "とっきゅう",
        color: "#e5342a",
        description:
          "京都《きょうと》から 奈良《なら》や 伊勢《いせ》へ 向《む》かう、座席《ざせき》を 予約《よやく》する 特急《とっきゅう》。",
        stops: ["kyoto", "kintetsu-tambabashi", "yamato-saidaiji"],
        sources: [wikipedia("近鉄京都線")],
      },
    ],
    sources: [wikipedia("近鉄京都線")],
  },
  {
    id: "kintetsu-nara",
    network: "kintetsu",
    name: "近鉄奈良線《きんてつならせん》",
    kana: "きんてつならせん",
    color: "#e07a2f",
    stationIds: KINTETSU_NARA,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#5b6b7a",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: KINTETSU_NARA,
      },
      {
        id: "kaisoku-kyuko",
        name: "快速急行《かいそくきゅうこう》",
        kana: "かいそくきゅうこう",
        color: "#f08a5d",
        description:
          "大阪難波《おおさかなんば》から 近鉄奈良《きんてつなら》まで、10駅《えき》で 走《はし》りぬけるよ。",
        stops: [
          "osaka-namba", "nippombashi", "osaka-uehommachi", "tsuruhashi",
          "higashi-hanazono", "ikoma", "gakuen-mae", "yamato-saidaiji",
          "shin-omiya", "kintetsu-nara",
        ],
        sources: [wikipedia("近鉄奈良線")],
      },
      {
        id: "tokkyu",
        name: "特急《とっきゅう》",
        kana: "とっきゅう",
        color: "#e5342a",
        description:
          "座席《ざせき》を 予約《よやく》して のる 特急《とっきゅう》。止《と》まる 駅《えき》は 6つだけ。",
        stops: [
          "osaka-namba", "osaka-uehommachi", "tsuruhashi", "ikoma", "gakuen-mae",
          "kintetsu-nara",
        ],
        sources: [wikipedia("近鉄奈良線")],
      },
    ],
    sources: [wikipedia("近鉄奈良線")],
  },

  // ===== JR西日本（琵琶湖の西側と北側） =====
  {
    id: "kosei",
    network: "jrwest",
    name: "湖西線《こせいせん》",
    kana: "こせいせん",
    color: "#1e9e5a",
    stationIds: KOSEI,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#4b7bec",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: KOSEI,
      },
      {
        id: "shinkaisoku",
        name: "新快速《しんかいそく》",
        kana: "しんかいそく",
        color: "#e5342a",
        description:
          "琵琶湖《びわこ》の 西側《にしがわ》を、湖《みずうみ》を 見《み》ながら 走《はし》るよ。",
        stops: [
          "yamashina", "otsukyo", "hieizan-sakamoto", "katata", "omi-maiko",
          "omi-takashima", "adogawa", "shin-asahi", "omi-imazu",
        ],
        sources: [wikipedia("湖西線")],
      },
      {
        id: "thunderbird",
        name: "サンダーバード",
        kana: "さんだーばーど",
        color: "#1f4fb6",
        description:
          "大阪《おおさか》から 敦賀《つるが》へ 向《む》かう 特急《とっきゅう》。在来線《ざいらいせん》では 日本《にほん》で いちばん 速《はや》い 特急《とっきゅう》なんだ。",
        stops: ["katata", "omi-imazu"],
        sources: [wikipedia("サンダーバード (列車)")],
      },
    ],
    sources: [wikipedia("湖西線")],
  },
  {
    id: "hokuriku",
    network: "jrwest",
    name: "北陸本線《ほくりくほんせん》",
    kana: "ほくりくほんせん",
    color: "#2f7d5a",
    stationIds: HOKURIKU,
    types: [
      {
        id: "futsu",
        name: "普通《ふつう》",
        kana: "ふつう",
        color: "#4b7bec",
        description: "全部《ぜんぶ》の 駅《えき》に 止《と》まるよ。",
        stops: HOKURIKU,
      },
      {
        id: "shinkaisoku",
        name: "新快速《しんかいそく》",
        kana: "しんかいそく",
        color: "#e5342a",
        description:
          "米原《まいばら》から 長浜《ながはま》をこえて、敦賀《つるが》まで 走《はし》る 新快速《しんかいそく》も あるよ。",
        stops: HOKURIKU,
      },
      {
        id: "thunderbird",
        name: "サンダーバード",
        kana: "さんだーばーど",
        color: "#1f4fb6",
        description:
          "湖西線《こせいせん》を 走《はし》ってきて、敦賀《つるが》に 着《つ》くよ。ここで 北陸新幹線《ほくりくしんかんせん》に 乗《の》りかえるんだ。",
        stops: ["tsuruga"],
        sources: [wikipedia("サンダーバード (列車)")],
      },
    ],
    sources: [wikipedia("北陸本線")],
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

/** 2点間の距離（メートル） */
function distanceMeters(a: Station, b: Station): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * すぐそばにある別の駅。
 *
 * 「石山」と「京阪石山」のように、名前が違うので別の駅として持っているが
 * 歩いて乗りかえられる組がある。地図では数十メートルしか離れておらず
 * ピンが重なって片方を選べないので、駅どうしを行き来できるようにする。
 *
 * 同じ路線の隣の駅（400m程度しか離れていない区間がある）は、乗りかえでは
 * ないので除く。
 */
export function nearbyStations(stationId: string, maxMeters = 350): Station[] {
  const here = stationMap[stationId];
  if (!here) return [];
  const myLines = new Set(linesAtStation(stationId).map((l) => l.id));

  return stations
    .filter((s) => s.id !== stationId)
    .filter((s) => !linesAtStation(s.id).some((l) => myLines.has(l.id)))
    .map((s) => ({ station: s, m: distanceMeters(here, s) }))
    .filter((x) => x.m <= maxMeters)
    .sort((a, b) => a.m - b.m)
    .map((x) => x.station);
}
