/**
 * アプリ全体で使うデータ型。
 * 「かんじ|よみ」形式の文字列（RubyString）でふりがなを表現する。
 * 例: "新快速|しんかいそく" / "近江|おうみ鉄道|てつどう" のように
 *     漢字の直後に |よみ を書くと <ruby> に変換される（lib/ruby.ts）。
 */
export type RubyString = string;

export type NetworkId =
  | "shinkansen"
  | "jrwest"
  | "ohmi"
  | "keihan"
  | "kyoto-subway"
  | "shigaraki"
  | "hankyu"
  | "kintetsu";

/**
 * 記述の出典。データを増やすときは必ず1つ以上つける。
 * 「誰かが書いた説明文」と「裏の取れた事実」を区別できなくなるのを防ぐため。
 */
export interface Citation {
  /** 出典の名前（例: "Wikipedia 近江鉄道900形電車"） */
  title: string;
  url: string;
}

/**
 * Wikimedia Commons の写真。
 *
 * 記事の「代表画像」は予告なく差し替わるので、ファイルを直接指定する。
 * （900形は代表画像が旧「淡海号」塗装のままで、現在の姿と食い違っていた）
 */
export interface Photo {
  /** Commons のファイル名。"File:" 接頭辞つき */
  commonsFile: string;
  /** 何が写っているかの補足（塗装違いなど）。省略可 */
  note?: RubyString;
}

export interface Network {
  id: NetworkId;
  /** カテゴリー名（ルビ付き） */
  name: RubyString;
  /** 正式名称（ルビ付き） */
  formalName: RubyString;
  /** テーマカラー（Tailwindではなく生のCSSカラー） */
  color: string;
  emoji: string;
}

export interface Train {
  id: string;
  network: NetworkId;
  /** 正式名称（ルビ付き）例: "N700S" / "223系|けい" */
  name: RubyString;
  /**
   * 全文ひらがなの読み。画面には出さない（数字は読めるので不要という方針）。
   * 音声検索の照合と、画像の代替テキスト（読み上げ）に使う。
   */
  kana: string;
  /**
   * 最高速度 km/h。**裏の取れた値だけ入れる。**
   * 未確認なら省略する（UIは速度の欄を出さない）。
   * 適当な数値を置くと、子どもがそれを事実として覚えてしまうため。
   */
  maxSpeed?: number;
  /** デビュー年 */
  debutYear: number;
  /** 車体のイメージカラー（イラスト用） */
  bodyColor: string;
  /** 帯の色（イラスト用） */
  stripeColor: string;
  /** 「でんしゃのひみつ」 */
  secrets: RubyString[];
  /** 走っている路線ID */
  lineIds: string[];
  /** Wikipedia(ja) の記事タイトル。photo 未指定のときの画像取得キーも兼ねる */
  wikipediaTitle: string;
  /** 表示する写真。未指定なら wikipediaTitle の代表画像にフォールバックする */
  photo?: Photo;
  /** secrets や諸元の裏付け */
  sources: Citation[];
  /** 音声検索でヒットさせたい読み（ひらがな） */
  aliases: string[];
}

export interface Station {
  id: string;
  /** 駅名（ルビ付き） 例: "米原|まいばら" */
  name: RubyString;
  /** 駅名のひらがな */
  kana: string;
  /** ローマ字（駅名標用） */
  romaji: string;
  /** 緯度。scripts/fetch-station-coords.mjs が Wikipedia(ja) から取り込む */
  lat: number;
  lng: number;
  /** 記事名が「駅名+駅」でない場合だけ指定する（座標の取得キー） */
  wikipediaTitle?: string;
  /**
   * Wikidata の項目ID（Q…）。指定すると座標はここから取る。
   *
   * 「京阪石山駅」のように、記事が隣接するJR駅の記事へリダイレクトしている駅は、
   * Wikipedia から取るとJR駅の座標になり、地図上でピンが完全に重なってしまう。
   * Wikidata には駅ごとに項目があるので、そちらを使う。
   */
  wikidataId?: string;
  /** 地図に出現するズームレベルのしきい値（これ以上のズームで表示） */
  minZoom: number;
}
/*
 * 乗りかえ路線は駅に持たせない。lines の stationIds から計算する（linesAtStation）。
 * 手で持つと、路線を足したときに更新し忘れて実態とずれる。
 */

export interface TrainType {
  id: string;
  /** 種別名（ルビ付き） 例: "新快速|しんかいそく" */
  name: RubyString;
  kana: string;
  /** 種別の色 */
  color: string;
  /** 停まる駅のID一覧 */
  stops: string[];
  /** 子ども向けの説明 */
  description: RubyString;
  /** description の裏付け。路線側の sources に足して表示される */
  sources?: Citation[];
}

/**
 * 路線の「この先」につながる別の路線。
 *
 * 同じ駅を通る路線どうしの乗りかえは linesAtStation が駅の行に出す。
 * こちらは「線路の続き」を表す。東海道新幹線の新大阪から先は山陽新幹線、
 * のように、路線図の端で切れてしまう先をたどれるようにするためのもの。
 */
export interface LineConnection {
  /** つながる先の路線ID */
  lineId: string;
  /**
   * つなぎ目の駅ID。**この路線の stationIds に含まれていること。**
   * 相手の路線にも含まれていれば線路がつながっている扱い、
   * 含まれていなければ乗り継ぎ（through: false でなければならない）。
   */
  stationId: string;
  /** 直通運転しているか。false なら「のりかえ」と表示する */
  through: boolean;
  /** 子ども向けの一言 */
  note?: RubyString;
}

export interface Line {
  id: string;
  network: NetworkId;
  /** 路線名（ルビ付き） */
  name: RubyString;
  kana: string;
  color: string;
  /** 路線の駅（順番どおり） */
  stationIds: string[];
  /** 列車種別 */
  types: TrainType[];
  /** 線路の続き（路線図の端から次の路線へ行けるようにする） */
  connections?: LineConnection[];
  /** 路線と種別の説明の裏付け */
  sources: Citation[];
}
