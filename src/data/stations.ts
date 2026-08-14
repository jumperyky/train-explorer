import type { Station } from "./types";

/**
 * 駅マスタ。
 *
 * 緯度経度は Wikipedia(ja) の各駅記事に載っている座標。
 * 更新・追加は手打ちせず、スクリプトに取り込ませる:
 *
 *   node scripts/fetch-station-coords.mjs           差分の確認だけ
 *   node scripts/fetch-station-coords.mjs --write   反映
 *
 * wikipediaTitle は、記事名が「駅名+駅」でない駅だけに付く（同名駅の
 * 曖昧さ回避）。スクリプトが位置から特定して書き込むので手で書かなくてよい。
 *
 * minZoom = 地図でこのズームレベル以上になったらピンを表示する。
 */
const list: Station[] = [
  // ===== 東海道新幹線 =====
  { id: "tokyo", name: "東京《とうきょう》", kana: "とうきょう", romaji: "Tokyo", lat: 35.681111, lng: 139.766667, minZoom: 5 },
  { id: "shinagawa", name: "品川《しながわ》", kana: "しながわ", romaji: "Shinagawa", lat: 35.628222, lng: 139.738694, minZoom: 5 },
  { id: "shin-yokohama", name: "新横浜《しんよこはま》", kana: "しんよこはま", romaji: "Shin-Yokohama", lat: 35.506806, lng: 139.616944, minZoom: 5 },
  { id: "odawara", name: "小田原《おだわら》", kana: "おだわら", romaji: "Odawara", lat: 35.255833, lng: 139.155556, minZoom: 8 },
  { id: "atami", name: "熱海《あたみ》", kana: "あたみ", romaji: "Atami", lat: 35.103608, lng: 139.077444, minZoom: 8 },
  { id: "mishima", name: "三島《みしま》", kana: "みしま", romaji: "Mishima", lat: 35.126339, lng: 138.911164, minZoom: 8 },
  { id: "shin-fuji", name: "新富士《しんふじ》", wikipediaTitle: "新富士駅 (静岡県)", kana: "しんふじ", romaji: "Shin-Fuji", lat: 35.142, lng: 138.663361, minZoom: 8 },
  { id: "shizuoka", name: "静岡《しずおか》", kana: "しずおか", romaji: "Shizuoka", lat: 34.971611, lng: 138.388556, minZoom: 7 },
  { id: "kakegawa", name: "掛川《かけがわ》", kana: "かけがわ", romaji: "Kakegawa", lat: 34.769742, lng: 138.014839, minZoom: 8 },
  { id: "hamamatsu", name: "浜松《はままつ》", kana: "はままつ", romaji: "Hamamatsu", lat: 34.703425, lng: 137.734403, minZoom: 7 },
  { id: "toyohashi", name: "豊橋《とよはし》", kana: "とよはし", romaji: "Toyohashi", lat: 34.762811, lng: 137.381651, minZoom: 8 },
  { id: "mikawa-anjo", name: "三河安城《みかわあんじょう》", kana: "みかわあんじょう", romaji: "Mikawa-Anjo", lat: 34.96897, lng: 137.060662, minZoom: 8 },
  { id: "nagoya", name: "名古屋《なごや》", kana: "なごや", romaji: "Nagoya", lat: 35.170694, lng: 136.881637, minZoom: 5 },
  { id: "gifu-hashima", name: "岐阜羽島《ぎふはしま》", kana: "ぎふはしま", romaji: "Gifu-Hashima", lat: 35.315833, lng: 136.685556, minZoom: 8 },

  // ===== 米原（新幹線・琵琶湖線・近江鉄道の乗りかえ駅） =====
  { id: "maibara", name: "米原《まいばら》", kana: "まいばら", romaji: "Maibara", lat: 35.314722, lng: 136.29, minZoom: 7 },

  // ===== 琵琶湖線（米原〜京都） =====
  { id: "hikone", name: "彦根《ひこね》", kana: "ひこね", romaji: "Hikone", lat: 35.272206, lng: 136.263356, minZoom: 9 },
  { id: "minami-hikone", name: "南彦根《みなみひこね》", kana: "みなみひこね", romaji: "Minami-Hikone", lat: 35.246144, lng: 136.247947, minZoom: 11 },
  { id: "kawase", name: "河瀬《かわせ》", kana: "かわせ", romaji: "Kawase", lat: 35.225192, lng: 136.225039, minZoom: 11 },
  { id: "inae", name: "稲枝《いなえ》", kana: "いなえ", romaji: "Inae", lat: 35.203228, lng: 136.194417, minZoom: 11 },
  { id: "notogawa", name: "能登川《のとがわ》", kana: "のとがわ", romaji: "Notogawa", lat: 35.179911, lng: 136.165894, minZoom: 10 },
  { id: "azuchi", name: "安土《あづち》", kana: "あづち", romaji: "Azuchi", lat: 35.142644, lng: 136.133433, minZoom: 11 },
  { id: "omi-hachiman", name: "近江八幡《おうみはちまん》", kana: "おうみはちまん", romaji: "Omi-Hachiman", lat: 35.122878, lng: 136.102753, minZoom: 9 },
  { id: "shinohara", name: "篠原《しのはら》", wikipediaTitle: "篠原駅 (滋賀県)", kana: "しのはら", romaji: "Shinohara", lat: 35.09925, lng: 136.071294, minZoom: 11 },
  { id: "yasu", name: "野洲《やす》", kana: "やす", romaji: "Yasu", lat: 35.06855, lng: 136.022706, minZoom: 10 },
  { id: "moriyama", name: "守山《もりやま》", wikipediaTitle: "守山駅 (滋賀県)", kana: "もりやま", romaji: "Moriyama", lat: 35.050419, lng: 135.995678, minZoom: 10 },
  { id: "ritto", name: "栗東《りっとう》", kana: "りっとう", romaji: "Ritto", lat: 35.037378, lng: 135.979947, minZoom: 11 },
  { id: "kusatsu", name: "草津《くさつ》", wikipediaTitle: "草津駅 (滋賀県)", kana: "くさつ", romaji: "Kusatsu", lat: 35.0224, lng: 135.961636, minZoom: 9 },
  { id: "minami-kusatsu", name: "南草津《みなみくさつ》", kana: "みなみくさつ", romaji: "Minami-Kusatsu", lat: 35.00375, lng: 135.947281, minZoom: 10 },
  { id: "seta", name: "瀬田《せた》", wikipediaTitle: "瀬田駅 (滋賀県)", kana: "せた", romaji: "Seta", lat: 34.986964, lng: 135.925364, minZoom: 11 },
  { id: "ishiyama", name: "石山《いしやま》", kana: "いしやま", romaji: "Ishiyama", lat: 34.979939, lng: 135.900247, minZoom: 10 },
  { id: "zeze", name: "膳所《ぜぜ》", kana: "ぜぜ", romaji: "Zeze", lat: 34.999419, lng: 135.881042, minZoom: 11 },
  { id: "otsu", name: "大津《おおつ》", kana: "おおつ", romaji: "Otsu", lat: 35.002972, lng: 135.864897, minZoom: 9 },
  { id: "yamashina", name: "山科《やましな》", kana: "やましな", romaji: "Yamashina", lat: 34.992336, lng: 135.817083, minZoom: 10 },
  { id: "kyoto", name: "京都《きょうと》", kana: "きょうと", romaji: "Kyoto", lat: 34.985458, lng: 135.757756, minZoom: 5 },

  // ===== JR京都線（京都〜大阪） =====
  { id: "nishioji", name: "西大路《にしおおじ》", kana: "にしおおじ", romaji: "Nishioji", lat: 34.981028, lng: 135.732333, minZoom: 11 },
  { id: "katsuragawa", name: "桂川《かつらがわ》", wikipediaTitle: "桂川駅 (京都府)", kana: "かつらがわ", romaji: "Katsuragawa", lat: 34.964503, lng: 135.710378, minZoom: 11 },
  { id: "mukomachi", name: "向日町《むこうまち》", kana: "むこうまち", romaji: "Mukomachi", lat: 34.954936, lng: 135.7096, minZoom: 11 },
  { id: "nagaokakyo", name: "長岡京《ながおかきょう》", kana: "ながおかきょう", romaji: "Nagaokakyo", lat: 34.923517, lng: 135.700694, minZoom: 10 },
  { id: "yamazaki", name: "山崎《やまざき》", wikipediaTitle: "山崎駅 (京都府)", kana: "やまざき", romaji: "Yamazaki", lat: 34.892194, lng: 135.679889, minZoom: 11 },
  { id: "shimamoto", name: "島本《しまもと》", kana: "しまもと", romaji: "Shimamoto", lat: 34.880647, lng: 135.662778, minZoom: 11 },
  { id: "takatsuki", name: "高槻《たかつき》", kana: "たかつき", romaji: "Takatsuki", lat: 34.851714, lng: 135.617681, minZoom: 9 },
  { id: "settsu-tonda", name: "摂津富田《せっつとんだ》", kana: "せっつとんだ", romaji: "Settsu-Tonda", lat: 34.837672, lng: 135.59335, minZoom: 11 },
  { id: "jr-sojiji", name: "JR総持寺《そうじじ》", kana: "じぇいあーるそうじじ", romaji: "JR-Sojiji", lat: 34.828611, lng: 135.577778, minZoom: 11 },
  { id: "ibaraki", name: "茨木《いばらき》", kana: "いばらき", romaji: "Ibaraki", lat: 34.815353, lng: 135.562244, minZoom: 10 },
  { id: "senrioka", name: "千里丘《せんりおか》", kana: "せんりおか", romaji: "Senrioka", lat: 34.791289, lng: 135.551344, minZoom: 11 },
  { id: "kishibe", name: "岸辺《きしべ》", kana: "きしべ", romaji: "Kishibe", lat: 34.776814, lng: 135.541622, minZoom: 11 },
  { id: "suita", name: "吹田《すいた》", wikipediaTitle: "吹田駅 (JR西日本)", kana: "すいた", romaji: "Suita", lat: 34.763175, lng: 135.523669, minZoom: 11 },
  { id: "higashi-yodogawa", name: "東淀川《ひがしよどがわ》", kana: "ひがしよどがわ", romaji: "Higashi-Yodogawa", lat: 34.739508, lng: 135.504192, minZoom: 11 },
  { id: "shin-osaka", name: "新大阪《しんおおさか》", kana: "しんおおさか", romaji: "Shin-Osaka", lat: 34.733483, lng: 135.500114, minZoom: 5 },
  { id: "osaka", name: "大阪《おおさか》", kana: "おおさか", romaji: "Osaka", lat: 34.701889, lng: 135.494972, minZoom: 8 },

  // ===== JR神戸線（大阪〜姫路） =====
  { id: "tsukamoto", name: "塚本《つかもと》", kana: "つかもと", romaji: "Tsukamoto", lat: 34.712581, lng: 135.468878, minZoom: 11 },
  { id: "amagasaki", name: "尼崎《あまがさき》", wikipediaTitle: "尼崎駅 (JR西日本)", kana: "あまがさき", romaji: "Amagasaki", lat: 34.731633, lng: 135.431686, minZoom: 10 },
  { id: "tachibana", name: "立花《たちばな》", kana: "たちばな", romaji: "Tachibana", lat: 34.737961, lng: 135.399122, minZoom: 11 },
  { id: "koshienguchi", name: "甲子園口《こうしえんぐち》", kana: "こうしえんぐち", romaji: "Koshienguchi", lat: 34.738953, lng: 135.374703, minZoom: 11 },
  { id: "nishinomiya", name: "西宮《にしのみや》", wikipediaTitle: "西宮駅 (JR西日本)", kana: "にしのみや", romaji: "Nishinomiya", lat: 34.738764, lng: 135.347867, minZoom: 11 },
  { id: "sakura-shukugawa", name: "さくら夙川《しゅくがわ》", kana: "さくらしゅくがわ", romaji: "Sakura-Shukugawa", lat: 34.738989, lng: 135.331044, minZoom: 11 },
  { id: "ashiya", name: "芦屋《あしや》", wikipediaTitle: "芦屋駅 (JR西日本)", kana: "あしや", romaji: "Ashiya", lat: 34.734242, lng: 135.307069, minZoom: 10 },
  { id: "konan-yamate", name: "甲南山手《こうなんやまて》", kana: "こうなんやまて", romaji: "Konan-Yamate", lat: 34.730583, lng: 135.292425, minZoom: 11 },
  { id: "settsu-motoyama", name: "摂津本山《せっつもとやま》", kana: "せっつもとやま", romaji: "Settsu-Motoyama", lat: 34.726681, lng: 135.27645, minZoom: 11 },
  { id: "sumiyoshi", name: "住吉《すみよし》", wikipediaTitle: "住吉駅 (JR西日本・神戸新交通)", kana: "すみよし", romaji: "Sumiyoshi", lat: 34.719572, lng: 135.261856, minZoom: 11 },
  { id: "rokkomichi", name: "六甲道《ろっこうみち》", kana: "ろっこうみち", romaji: "Rokkomichi", lat: 34.714989, lng: 135.238508, minZoom: 11 },
  { id: "maya", name: "摩耶《まや》", kana: "まや", romaji: "Maya", lat: 34.708667, lng: 135.225167, minZoom: 11 },
  { id: "nada", name: "灘《なだ》", kana: "なだ", romaji: "Nada", lat: 34.7062, lng: 135.2165, minZoom: 11 },
  { id: "sannomiya", name: "｜三ノ宮《さんのみや》", kana: "さんのみや", romaji: "Sannomiya", lat: 34.694839, lng: 135.194942, minZoom: 9 },
  { id: "motomachi", name: "元町《もとまち》", wikipediaTitle: "元町駅 (兵庫県)", kana: "もとまち", romaji: "Motomachi", lat: 34.689567, lng: 135.187372, minZoom: 11 },
  { id: "kobe", name: "神戸《こうべ》", wikipediaTitle: "神戸駅 (兵庫県)", kana: "こうべ", romaji: "Kobe", lat: 34.679528, lng: 135.178025, minZoom: 9 },
  { id: "hyogo", name: "兵庫《ひょうご》", kana: "ひょうご", romaji: "Hyogo", lat: 34.668, lng: 135.164536, minZoom: 11 },
  { id: "shin-nagata", name: "新長田《しんながた》", kana: "しんながた", romaji: "Shin-Nagata", lat: 34.657572, lng: 135.145122, minZoom: 11 },
  { id: "takatori", name: "鷹取《たかとり》", kana: "たかとり", romaji: "Takatori", lat: 34.651339, lng: 135.135203, minZoom: 11 },
  { id: "suma-kaihinkoen", name: "須磨海浜公園《すまかいひんこうえん》", kana: "すまかいひんこうえん", romaji: "Suma-Kaihinkoen", lat: 34.647192, lng: 135.126622, minZoom: 11 },
  { id: "suma", name: "須磨《すま》", kana: "すま", romaji: "Suma", lat: 34.642272, lng: 135.112892, minZoom: 11 },
  { id: "shioya", name: "塩屋《しおや》", wikipediaTitle: "塩屋駅 (兵庫県)", kana: "しおや", romaji: "Shioya", lat: 34.6336, lng: 135.083372, minZoom: 11 },
  { id: "tarumi", name: "垂水《たるみ》", kana: "たるみ", romaji: "Tarumi", lat: 34.629528, lng: 135.053628, minZoom: 11 },
  { id: "maiko", name: "舞子《まいこ》", kana: "まいこ", romaji: "Maiko", lat: 34.633483, lng: 135.033772, minZoom: 11 },
  { id: "asagiri", name: "朝霧《あさぎり》", kana: "あさぎり", romaji: "Asagiri", lat: 34.644444, lng: 135.0175, minZoom: 11 },
  { id: "akashi", name: "明石《あかし》", kana: "あかし", romaji: "Akashi", lat: 34.649089, lng: 134.992839, minZoom: 10 },
  { id: "nishi-akashi", name: "西明石《にしあかし》", kana: "にしあかし", romaji: "Nishi-Akashi", lat: 34.666853, lng: 134.960539, minZoom: 10 },
  { id: "okubo", name: "大久保《おおくぼ》", wikipediaTitle: "大久保駅 (兵庫県)", kana: "おおくぼ", romaji: "Okubo", lat: 34.682292, lng: 134.938856, minZoom: 11 },
  { id: "uozumi", name: "魚住《うおずみ》", kana: "うおずみ", romaji: "Uozumi", lat: 34.696486, lng: 134.905975, minZoom: 11 },
  { id: "tsuchiyama", name: "土山《つちやま》", kana: "つちやま", romaji: "Tsuchiyama", lat: 34.720483, lng: 134.888872, minZoom: 11 },
  // 記事に座標が載っていない唯一の駅。ここだけ手打ちの概算値のまま
  { id: "higashi-kakogawa", name: "東加古川《ひがしかこがわ》", kana: "ひがしかこがわ", romaji: "Higashi-Kakogawa", lat: 34.7566, lng: 134.89, minZoom: 11 },
  { id: "kakogawa", name: "加古川《かこがわ》", kana: "かこがわ", romaji: "Kakogawa", lat: 34.767842, lng: 134.839414, minZoom: 10 },
  { id: "hoden", name: "宝殿《ほうでん》", kana: "ほうでん", romaji: "Hoden", lat: 34.784544, lng: 134.812431, minZoom: 11 },
  { id: "sone", name: "曽根《そね》", wikipediaTitle: "曽根駅 (兵庫県)", kana: "そね", romaji: "Sone", lat: 34.793272, lng: 134.769914, minZoom: 11 },
  { id: "himeji-bessho", name: "ひめじ別所《べっしょ》", kana: "ひめじべっしょ", romaji: "Himeji-Bessho", lat: 34.805553, lng: 134.75325, minZoom: 11 },
  { id: "gochaku", name: "御着《ごちゃく》", kana: "ごちゃく", romaji: "Gochaku", lat: 34.816942, lng: 134.735589, minZoom: 11 },
  { id: "higashi-himeji", name: "東姫路《ひがしひめじ》", kana: "ひがしひめじ", romaji: "Higashi-Himeji", lat: 34.824361, lng: 134.710806, minZoom: 11 },
  { id: "himeji", name: "姫路《ひめじ》", kana: "ひめじ", romaji: "Himeji", lat: 34.82675, lng: 134.690917, minZoom: 8 },

  // ===== 近江鉄道 本線（米原〜貴生川） =====
  { id: "fujitec-mae", name: "フジテック前《まえ》", kana: "ふじてっくまえ", romaji: "Fujitec-mae", lat: 35.294258, lng: 136.285514, minZoom: 12 },
  { id: "toriimoto", name: "鳥居本《とりいもと》", kana: "とりいもと", romaji: "Toriimoto", lat: 35.284281, lng: 136.283069, minZoom: 12 },
  { id: "hikone-serikawa", name: "ひこね芹川《せりかわ》", kana: "ひこねせりかわ", romaji: "Hikone-Serikawa", lat: 35.26215, lng: 136.260947, minZoom: 12 },
  { id: "hikoneguchi", name: "彦根口《ひこねぐち》", kana: "ひこねぐち", romaji: "Hikoneguchi", lat: 35.254728, lng: 136.258253, minZoom: 12 },
  { id: "takamiya", name: "高宮《たかみや》", wikipediaTitle: "高宮駅 (滋賀県)", kana: "たかみや", romaji: "Takamiya", lat: 35.236183, lng: 136.2605, minZoom: 12 },
  { id: "amago", name: "尼子《あまご》", kana: "あまご", romaji: "Amago", lat: 35.213953, lng: 136.246139, minZoom: 12 },
  { id: "toyosato", name: "豊郷《とよさと》", wikipediaTitle: "豊郷駅 (滋賀県)", kana: "とよさと", romaji: "Toyosato", lat: 35.197719, lng: 136.230714, minZoom: 12 },
  { id: "echigawa", name: "愛知川《えちがわ》", kana: "えちがわ", romaji: "Echigawa", lat: 35.175981, lng: 136.213308, minZoom: 12 },
  { id: "gokasho", name: "五個荘《ごかしょう》", kana: "ごかしょう", romaji: "Gokasho", lat: 35.154733, lng: 136.197136, minZoom: 12 },
  { id: "kawabe-no-mori", name: "河辺《かわべ》の森《もり》", kana: "かわべのもり", romaji: "Kawabe-no-mori", lat: 35.1354, lng: 136.196183, minZoom: 12 },
  { id: "yokaichi", name: "八日市《ようかいち》", kana: "ようかいち", romaji: "Yokaichi", lat: 35.1145, lng: 136.194833, minZoom: 11 },
  { id: "haseno", name: "長谷野《はせの》", kana: "はせの", romaji: "Haseno", lat: 35.095689, lng: 136.18765, minZoom: 12 },
  { id: "daigaku-mae", name: "大学前《だいがくまえ》", wikipediaTitle: "大学前駅 (滋賀県)", kana: "だいがくまえ", romaji: "Daigaku-mae", lat: 35.087733, lng: 136.184678, minZoom: 12 },
  { id: "kyocera-mae", name: "｜京セラ前《きょうせらまえ》", kana: "きょうせらまえ", romaji: "Kyocera-mae", lat: 35.074797, lng: 136.180361, minZoom: 12 },
  { id: "sakuragawa", name: "桜川《さくらがわ》", wikipediaTitle: "桜川駅 (滋賀県)", kana: "さくらがわ", romaji: "Sakuragawa", lat: 35.064756, lng: 136.187614, minZoom: 12 },
  { id: "asahi-otsuka", name: "朝日大塚《あさひおおつか》", kana: "あさひおおつか", romaji: "Asahi-Otsuka", lat: 35.051117, lng: 136.193519, minZoom: 12 },
  { id: "asahino", name: "朝日野《あさひの》", kana: "あさひの", romaji: "Asahino", lat: 35.031533, lng: 136.205725, minZoom: 12 },
  { id: "hino", name: "日野《ひの》", wikipediaTitle: "日野駅 (滋賀県)", kana: "ひの", romaji: "Hino", lat: 35.012278, lng: 136.219594, minZoom: 12 },
  { id: "minakuchi-matsuo", name: "水口松尾《みなくちまつお》", kana: "みなくちまつお", romaji: "Minakuchi-Matsuo", lat: 34.980242, lng: 136.18615, minZoom: 12 },
  { id: "minakuchi", name: "水口《みなくち》", kana: "みなくち", romaji: "Minakuchi", lat: 34.974253, lng: 136.176944, minZoom: 12 },
  { id: "minakuchi-ishibashi", name: "水口石橋《みなくちいしばし》", kana: "みなくちいしばし", romaji: "Minakuchi-Ishibashi", lat: 34.970186, lng: 136.171392, minZoom: 12 },
  { id: "minakuchi-jonan", name: "水口城南《みなくちじょうなん》", kana: "みなくちじょうなん", romaji: "Minakuchi-Jonan", lat: 34.968253, lng: 136.165633, minZoom: 12 },
  { id: "kibukawa", name: "貴生川《きぶかわ》", kana: "きぶかわ", romaji: "Kibukawa", lat: 34.952106, lng: 136.153933, minZoom: 11 },

  // ===== 近江鉄道 多賀線 =====
  { id: "screen", name: "スクリーン", kana: "すくりーん", romaji: "Screen", lat: 35.233142, lng: 136.267203, minZoom: 12 },
  { id: "taga-taisha-mae", name: "多賀大社前《たがたいしゃまえ》", kana: "たがたいしゃまえ", romaji: "Taga-Taisha-mae", lat: 35.226403, lng: 136.284242, minZoom: 12 },

  // ===== 近江鉄道 八日市線（万葉あかね線） =====
  { id: "musa", name: "武佐《むさ》", wikipediaTitle: "武佐駅 (滋賀県)", kana: "むさ", romaji: "Musa", lat: 35.114931, lng: 136.130522, minZoom: 12 },
  { id: "hirata", name: "平田《ひらた》", wikipediaTitle: "平田駅 (滋賀県)", kana: "ひらた", romaji: "Hirata", lat: 35.110278, lng: 136.146631, minZoom: 12 },
  { id: "ichinobe", name: "市辺《いちのべ》", kana: "いちのべ", romaji: "Ichinobe", lat: 35.103753, lng: 136.165525, minZoom: 12 },
  { id: "tarobogu-mae", name: "太郎坊宮前《たろうぼうぐうまえ》", kana: "たろうぼうぐうまえ", romaji: "Tarobogu-mae", lat: 35.108522, lng: 136.183697, minZoom: 12 },
  { id: "shin-yokaichi", name: "新八日市《しんようかいち》", kana: "しんようかいち", romaji: "Shin-Yokaichi", lat: 35.110372, lng: 136.191125, minZoom: 12 },
];

export const stations: Station[] = list;

export const stationMap: Record<string, Station> = Object.fromEntries(
  list.map((s) => [s.id, s]),
);

export function getStation(id: string): Station {
  const s = stationMap[id];
  if (!s) throw new Error(`unknown station id: ${id}`);
  return s;
}
