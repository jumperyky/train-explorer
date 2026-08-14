/**
 * アプリ全体で使うデータ型。
 * 「かんじ|よみ」形式の文字列（RubyString）でふりがなを表現する。
 * 例: "新快速|しんかいそく" / "近江|おうみ鉄道|てつどう" のように
 *     漢字の直後に |よみ を書くと <ruby> に変換される（lib/ruby.ts）。
 */
export type RubyString = string;

export type NetworkId = "shinkansen" | "jrwest" | "ohmi";

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
  /** 最高速度 km/h */
  maxSpeed: number;
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
  /** Wikipedia(ja) の記事タイトル。画像取得プロキシのキーに使う */
  wikipediaTitle: string;
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
  lat: number;
  lng: number;
  /** 地図に出現するズームレベルのしきい値（これ以上のズームで表示） */
  minZoom: number;
  /** 乗りかえできる路線ID */
  transfers?: string[];
}

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
}
