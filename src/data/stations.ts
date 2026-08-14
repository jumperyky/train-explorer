import type { Station } from "./types";

/**
 * 駅マスタ（MVPモックデータ）。
 * 緯度経度はおおよその値。将来 ODPT API から取得したデータで差し替える。
 * minZoom = 地図でこのズームレベル以上になったらピンを表示する。
 */
const list: Station[] = [
  // ===== 東海道新幹線 =====
  { id: "tokyo", name: "東京《とうきょう》", kana: "とうきょう", romaji: "Tokyo", lat: 35.6812, lng: 139.7671, minZoom: 5 },
  { id: "shinagawa", name: "品川《しながわ》", kana: "しながわ", romaji: "Shinagawa", lat: 35.6285, lng: 139.7387, minZoom: 5 },
  { id: "shin-yokohama", name: "新横浜《しんよこはま》", kana: "しんよこはま", romaji: "Shin-Yokohama", lat: 35.5077, lng: 139.6172, minZoom: 5 },
  { id: "odawara", name: "小田原《おだわら》", kana: "おだわら", romaji: "Odawara", lat: 35.2564, lng: 139.1553, minZoom: 8 },
  { id: "atami", name: "熱海《あたみ》", kana: "あたみ", romaji: "Atami", lat: 35.1036, lng: 139.078, minZoom: 8 },
  { id: "mishima", name: "三島《みしま》", kana: "みしま", romaji: "Mishima", lat: 35.1265, lng: 138.911, minZoom: 8 },
  { id: "shin-fuji", name: "新富士《しんふじ》", kana: "しんふじ", romaji: "Shin-Fuji", lat: 35.1424, lng: 138.6636, minZoom: 8 },
  { id: "shizuoka", name: "静岡《しずおか》", kana: "しずおか", romaji: "Shizuoka", lat: 34.9714, lng: 138.3888, minZoom: 7 },
  { id: "kakegawa", name: "掛川《かけがわ》", kana: "かけがわ", romaji: "Kakegawa", lat: 34.769, lng: 138.0146, minZoom: 8 },
  { id: "hamamatsu", name: "浜松《はままつ》", kana: "はままつ", romaji: "Hamamatsu", lat: 34.7036, lng: 137.7348, minZoom: 7 },
  { id: "toyohashi", name: "豊橋《とよはし》", kana: "とよはし", romaji: "Toyohashi", lat: 34.7626, lng: 137.3819, minZoom: 8 },
  { id: "mikawa-anjo", name: "三河安城《みかわあんじょう》", kana: "みかわあんじょう", romaji: "Mikawa-Anjo", lat: 34.9686, lng: 137.0596, minZoom: 8 },
  { id: "nagoya", name: "名古屋《なごや》", kana: "なごや", romaji: "Nagoya", lat: 35.1709, lng: 136.8815, minZoom: 5 },
  { id: "gifu-hashima", name: "岐阜羽島《ぎふはしま》", kana: "ぎふはしま", romaji: "Gifu-Hashima", lat: 35.3157, lng: 136.6862, minZoom: 8 },

  // ===== 米原（新幹線・琵琶湖線・近江鉄道の乗りかえ駅） =====
  { id: "maibara", name: "米原《まいばら》", kana: "まいばら", romaji: "Maibara", lat: 35.3145, lng: 136.2896, minZoom: 7, transfers: ["tokaido-shinkansen", "biwako", "ohmi-main"] },

  // ===== 琵琶湖線（米原〜京都） =====
  { id: "hikone", name: "彦根《ひこね》", kana: "ひこね", romaji: "Hikone", lat: 35.2751, lng: 136.2593, minZoom: 9, transfers: ["ohmi-main"] },
  { id: "minami-hikone", name: "南彦根《みなみひこね》", kana: "みなみひこね", romaji: "Minami-Hikone", lat: 35.2452, lng: 136.2419, minZoom: 11 },
  { id: "kawase", name: "河瀬《かわせ》", kana: "かわせ", romaji: "Kawase", lat: 35.2244, lng: 136.2246, minZoom: 11 },
  { id: "inae", name: "稲枝《いなえ》", kana: "いなえ", romaji: "Inae", lat: 35.1966, lng: 136.1972, minZoom: 11 },
  { id: "notogawa", name: "能登川《のとがわ》", kana: "のとがわ", romaji: "Notogawa", lat: 35.1707, lng: 136.1615, minZoom: 10 },
  { id: "azuchi", name: "安土《あづち》", kana: "あづち", romaji: "Azuchi", lat: 35.1519, lng: 136.1341, minZoom: 11 },
  { id: "omi-hachiman", name: "近江八幡《おうみはちまん》", kana: "おうみはちまん", romaji: "Omi-Hachiman", lat: 35.136, lng: 136.0983, minZoom: 9, transfers: ["ohmi-yokaichi"] },
  { id: "shinohara", name: "篠原《しのはら》", kana: "しのはら", romaji: "Shinohara", lat: 35.1114, lng: 136.0512, minZoom: 11 },
  { id: "yasu", name: "野洲《やす》", kana: "やす", romaji: "Yasu", lat: 35.0685, lng: 136.0233, minZoom: 10 },
  { id: "moriyama", name: "守山《もりやま》", kana: "もりやま", romaji: "Moriyama", lat: 35.0554, lng: 135.9962, minZoom: 10 },
  { id: "ritto", name: "栗東《りっとう》", kana: "りっとう", romaji: "Ritto", lat: 35.0388, lng: 135.9787, minZoom: 11 },
  { id: "kusatsu", name: "草津《くさつ》", kana: "くさつ", romaji: "Kusatsu", lat: 35.0208, lng: 135.9612, minZoom: 9 },
  { id: "minami-kusatsu", name: "南草津《みなみくさつ》", kana: "みなみくさつ", romaji: "Minami-Kusatsu", lat: 34.9962, lng: 135.9455, minZoom: 10 },
  { id: "seta", name: "瀬田《せた》", kana: "せた", romaji: "Seta", lat: 34.9757, lng: 135.9241, minZoom: 11 },
  { id: "ishiyama", name: "石山《いしやま》", kana: "いしやま", romaji: "Ishiyama", lat: 34.9633, lng: 135.9022, minZoom: 10 },
  { id: "zeze", name: "膳所《ぜぜ》", kana: "ぜぜ", romaji: "Zeze", lat: 34.9989, lng: 135.8843, minZoom: 11 },
  { id: "otsu", name: "大津《おおつ》", kana: "おおつ", romaji: "Otsu", lat: 35.011, lng: 135.8636, minZoom: 9 },
  { id: "yamashina", name: "山科《やましな》", kana: "やましな", romaji: "Yamashina", lat: 34.9932, lng: 135.8156, minZoom: 10 },
  { id: "kyoto", name: "京都《きょうと》", kana: "きょうと", romaji: "Kyoto", lat: 34.9855, lng: 135.7587, minZoom: 5, transfers: ["tokaido-shinkansen", "biwako", "jr-kyoto"] },

  // ===== JR京都線（京都〜大阪） =====
  { id: "nishioji", name: "西大路《にしおおじ》", kana: "にしおおじ", romaji: "Nishioji", lat: 34.9832, lng: 135.7345, minZoom: 11 },
  { id: "katsuragawa", name: "桂川《かつらがわ》", kana: "かつらがわ", romaji: "Katsuragawa", lat: 34.9509, lng: 135.7139, minZoom: 11 },
  { id: "mukomachi", name: "向日町《むこうまち》", kana: "むこうまち", romaji: "Mukomachi", lat: 34.9463, lng: 135.7071, minZoom: 11 },
  { id: "nagaokakyo", name: "長岡京《ながおかきょう》", kana: "ながおかきょう", romaji: "Nagaokakyo", lat: 34.9235, lng: 135.6957, minZoom: 10 },
  { id: "yamazaki", name: "山崎《やまざき》", kana: "やまざき", romaji: "Yamazaki", lat: 34.894, lng: 135.681, minZoom: 11 },
  { id: "shimamoto", name: "島本《しまもと》", kana: "しまもと", romaji: "Shimamoto", lat: 34.8768, lng: 135.6702, minZoom: 11 },
  { id: "takatsuki", name: "高槻《たかつき》", kana: "たかつき", romaji: "Takatsuki", lat: 34.8556, lng: 135.6172, minZoom: 9 },
  { id: "settsu-tonda", name: "摂津富田《せっつとんだ》", kana: "せっつとんだ", romaji: "Settsu-Tonda", lat: 34.8399, lng: 135.5866, minZoom: 11 },
  { id: "jr-sojiji", name: "JR総持寺《そうじじ》", kana: "じぇいあーるそうじじ", romaji: "JR-Sojiji", lat: 34.83, lng: 135.572, minZoom: 11 },
  { id: "ibaraki", name: "茨木《いばらき》", kana: "いばらき", romaji: "Ibaraki", lat: 34.8149, lng: 135.5619, minZoom: 10 },
  { id: "senrioka", name: "千里丘《せんりおか》", kana: "せんりおか", romaji: "Senrioka", lat: 34.7987, lng: 135.5443, minZoom: 11 },
  { id: "kishibe", name: "岸辺《きしべ》", kana: "きしべ", romaji: "Kishibe", lat: 34.7871, lng: 135.532, minZoom: 11 },
  { id: "suita", name: "吹田《すいた》", kana: "すいた", romaji: "Suita", lat: 34.762, lng: 135.5171, minZoom: 11 },
  { id: "higashi-yodogawa", name: "東淀川《ひがしよどがわ》", kana: "ひがしよどがわ", romaji: "Higashi-Yodogawa", lat: 34.7435, lng: 135.5049, minZoom: 11 },
  { id: "shin-osaka", name: "新大阪《しんおおさか》", kana: "しんおおさか", romaji: "Shin-Osaka", lat: 34.7332, lng: 135.5, minZoom: 5, transfers: ["tokaido-shinkansen", "jr-kyoto"] },
  { id: "osaka", name: "大阪《おおさか》", kana: "おおさか", romaji: "Osaka", lat: 34.7025, lng: 135.4959, minZoom: 8, transfers: ["jr-kyoto", "jr-kobe"] },

  // ===== JR神戸線（大阪〜姫路） =====
  { id: "tsukamoto", name: "塚本《つかもと》", kana: "つかもと", romaji: "Tsukamoto", lat: 34.707, lng: 135.4713, minZoom: 11 },
  { id: "amagasaki", name: "尼崎《あまがさき》", kana: "あまがさき", romaji: "Amagasaki", lat: 34.7331, lng: 135.4213, minZoom: 10 },
  { id: "tachibana", name: "立花《たちばな》", kana: "たちばな", romaji: "Tachibana", lat: 34.7202, lng: 135.4009, minZoom: 11 },
  { id: "koshienguchi", name: "甲子園口《こうしえんぐち》", kana: "こうしえんぐち", romaji: "Koshienguchi", lat: 34.7295, lng: 135.372, minZoom: 11 },
  { id: "nishinomiya", name: "西宮《にしのみや》", kana: "にしのみや", romaji: "Nishinomiya", lat: 34.7358, lng: 135.3475, minZoom: 11 },
  { id: "sakura-shukugawa", name: "さくら夙川《しゅくがわ》", kana: "さくらしゅくがわ", romaji: "Sakura-Shukugawa", lat: 34.7368, lng: 135.3324, minZoom: 11 },
  { id: "ashiya", name: "芦屋《あしや》", kana: "あしや", romaji: "Ashiya", lat: 34.7276, lng: 135.305, minZoom: 10 },
  { id: "konan-yamate", name: "甲南山手《こうなんやまて》", kana: "こうなんやまて", romaji: "Konan-Yamate", lat: 34.7268, lng: 135.285, minZoom: 11 },
  { id: "settsu-motoyama", name: "摂津本山《せっつもとやま》", kana: "せっつもとやま", romaji: "Settsu-Motoyama", lat: 34.7222, lng: 135.2707, minZoom: 11 },
  { id: "sumiyoshi", name: "住吉《すみよし》", kana: "すみよし", romaji: "Sumiyoshi", lat: 34.7196, lng: 135.2606, minZoom: 11 },
  { id: "rokkomichi", name: "六甲道《ろっこうみち》", kana: "ろっこうみち", romaji: "Rokkomichi", lat: 34.7139, lng: 135.2379, minZoom: 11 },
  { id: "maya", name: "摩耶《まや》", kana: "まや", romaji: "Maya", lat: 34.7107, lng: 135.2222, minZoom: 11 },
  { id: "nada", name: "灘《なだ》", kana: "なだ", romaji: "Nada", lat: 34.7082, lng: 135.2137, minZoom: 11 },
  { id: "sannomiya", name: "｜三ノ宮《さんのみや》", kana: "さんのみや", romaji: "Sannomiya", lat: 34.695, lng: 135.1954, minZoom: 9 },
  { id: "motomachi", name: "元町《もとまち》", kana: "もとまち", romaji: "Motomachi", lat: 34.6893, lng: 135.1874, minZoom: 11 },
  { id: "kobe", name: "神戸《こうべ》", kana: "こうべ", romaji: "Kobe", lat: 34.6795, lng: 135.1782, minZoom: 9 },
  { id: "hyogo", name: "兵庫《ひょうご》", kana: "ひょうご", romaji: "Hyogo", lat: 34.6702, lng: 135.1655, minZoom: 11 },
  { id: "shin-nagata", name: "新長田《しんながた》", kana: "しんながた", romaji: "Shin-Nagata", lat: 34.6606, lng: 135.1436, minZoom: 11 },
  { id: "takatori", name: "鷹取《たかとり》", kana: "たかとり", romaji: "Takatori", lat: 34.66, lng: 135.1319, minZoom: 11 },
  { id: "suma-kaihinkoen", name: "須磨海浜公園《すまかいひんこうえん》", kana: "すまかいひんこうえん", romaji: "Suma-Kaihinkoen", lat: 34.654, lng: 135.124, minZoom: 11 },
  { id: "suma", name: "須磨《すま》", kana: "すま", romaji: "Suma", lat: 34.6448, lng: 135.1102, minZoom: 11 },
  { id: "shioya", name: "塩屋《しおや》", kana: "しおや", romaji: "Shioya", lat: 34.6382, lng: 135.08, minZoom: 11 },
  { id: "tarumi", name: "垂水《たるみ》", kana: "たるみ", romaji: "Tarumi", lat: 34.6304, lng: 135.0546, minZoom: 11 },
  { id: "maiko", name: "舞子《まいこ》", kana: "まいこ", romaji: "Maiko", lat: 34.6314, lng: 135.0345, minZoom: 11 },
  { id: "asagiri", name: "朝霧《あさぎり》", kana: "あさぎり", romaji: "Asagiri", lat: 34.6373, lng: 135.0122, minZoom: 11 },
  { id: "akashi", name: "明石《あかし》", kana: "あかし", romaji: "Akashi", lat: 34.6486, lng: 134.9924, minZoom: 10 },
  { id: "nishi-akashi", name: "西明石《にしあかし》", kana: "にしあかし", romaji: "Nishi-Akashi", lat: 34.664, lng: 134.9662, minZoom: 10 },
  { id: "okubo", name: "大久保《おおくぼ》", kana: "おおくぼ", romaji: "Okubo", lat: 34.6797, lng: 134.9354, minZoom: 11 },
  { id: "uozumi", name: "魚住《うおずみ》", kana: "うおずみ", romaji: "Uozumi", lat: 34.6899, lng: 134.9068, minZoom: 11 },
  { id: "tsuchiyama", name: "土山《つちやま》", kana: "つちやま", romaji: "Tsuchiyama", lat: 34.7011, lng: 134.8779, minZoom: 11 },
  { id: "higashi-kakogawa", name: "東加古川《ひがしかこがわ》", kana: "ひがしかこがわ", romaji: "Higashi-Kakogawa", lat: 34.7566, lng: 134.89, minZoom: 11 },
  { id: "kakogawa", name: "加古川《かこがわ》", kana: "かこがわ", romaji: "Kakogawa", lat: 34.757, lng: 134.8425, minZoom: 10 },
  { id: "hoden", name: "宝殿《ほうでん》", kana: "ほうでん", romaji: "Hoden", lat: 34.7749, lng: 134.8135, minZoom: 11 },
  { id: "sone", name: "曽根《そね》", kana: "そね", romaji: "Sone", lat: 34.7827, lng: 134.7813, minZoom: 11 },
  { id: "himeji-bessho", name: "ひめじ別所《べっしょ》", kana: "ひめじべっしょ", romaji: "Himeji-Bessho", lat: 34.8033, lng: 134.7325, minZoom: 11 },
  { id: "gochaku", name: "御着《ごちゃく》", kana: "ごちゃく", romaji: "Gochaku", lat: 34.8259, lng: 134.7175, minZoom: 11 },
  { id: "higashi-himeji", name: "東姫路《ひがしひめじ》", kana: "ひがしひめじ", romaji: "Higashi-Himeji", lat: 34.8289, lng: 134.7, minZoom: 11 },
  { id: "himeji", name: "姫路《ひめじ》", kana: "ひめじ", romaji: "Himeji", lat: 34.8295, lng: 134.6903, minZoom: 8 },

  // ===== 近江鉄道 本線（米原〜貴生川） =====
  { id: "fujitec-mae", name: "フジテック前《まえ》", kana: "ふじてっくまえ", romaji: "Fujitec-mae", lat: 35.3018, lng: 136.282, minZoom: 12 },
  { id: "toriimoto", name: "鳥居本《とりいもと》", kana: "とりいもと", romaji: "Toriimoto", lat: 35.2895, lng: 136.2758, minZoom: 12 },
  { id: "hikone-serikawa", name: "ひこね芹川《せりかわ》", kana: "ひこねせりかわ", romaji: "Hikone-Serikawa", lat: 35.2653, lng: 136.251, minZoom: 12 },
  { id: "hikoneguchi", name: "彦根口《ひこねぐち》", kana: "ひこねぐち", romaji: "Hikoneguchi", lat: 35.2545, lng: 136.242, minZoom: 12 },
  { id: "takamiya", name: "高宮《たかみや》", kana: "たかみや", romaji: "Takamiya", lat: 35.2447, lng: 136.2372, minZoom: 12, transfers: ["ohmi-taga"] },
  { id: "amago", name: "尼子《あまご》", kana: "あまご", romaji: "Amago", lat: 35.2233, lng: 136.2321, minZoom: 12 },
  { id: "toyosato", name: "豊郷《とよさと》", kana: "とよさと", romaji: "Toyosato", lat: 35.2046, lng: 136.2216, minZoom: 12 },
  { id: "echigawa", name: "愛知川《えちがわ》", kana: "えちがわ", romaji: "Echigawa", lat: 35.1856, lng: 136.2098, minZoom: 12 },
  { id: "gokasho", name: "五個荘《ごかしょう》", kana: "ごかしょう", romaji: "Gokasho", lat: 35.1595, lng: 136.1855, minZoom: 12 },
  { id: "kawabe-no-mori", name: "河辺《かわべ》の森《もり》", kana: "かわべのもり", romaji: "Kawabe-no-mori", lat: 35.14, lng: 136.173, minZoom: 12 },
  { id: "yokaichi", name: "八日市《ようかいち》", kana: "ようかいち", romaji: "Yokaichi", lat: 35.1179, lng: 136.1863, minZoom: 11, transfers: ["ohmi-yokaichi"] },
  { id: "haseno", name: "長谷野《はせの》", kana: "はせの", romaji: "Haseno", lat: 35.106, lng: 136.1928, minZoom: 12 },
  { id: "daigaku-mae", name: "大学前《だいがくまえ》", kana: "だいがくまえ", romaji: "Daigaku-mae", lat: 35.098, lng: 136.202, minZoom: 12 },
  { id: "kyocera-mae", name: "｜京セラ前《きょうせらまえ》", kana: "きょうせらまえ", romaji: "Kyocera-mae", lat: 35.0895, lng: 136.21, minZoom: 12 },
  { id: "sakuragawa", name: "桜川《さくらがわ》", kana: "さくらがわ", romaji: "Sakuragawa", lat: 35.0684, lng: 136.213, minZoom: 12 },
  { id: "asahi-otsuka", name: "朝日大塚《あさひおおつか》", kana: "あさひおおつか", romaji: "Asahi-Otsuka", lat: 35.049, lng: 136.205, minZoom: 12 },
  { id: "asahino", name: "朝日野《あさひの》", kana: "あさひの", romaji: "Asahino", lat: 35.0356, lng: 136.2035, minZoom: 12 },
  { id: "hino", name: "日野《ひの》", kana: "ひの", romaji: "Hino", lat: 35.0072, lng: 136.208, minZoom: 12 },
  { id: "minakuchi-matsuo", name: "水口松尾《みなくちまつお》", kana: "みなくちまつお", romaji: "Minakuchi-Matsuo", lat: 34.974, lng: 136.185, minZoom: 12 },
  { id: "minakuchi", name: "水口《みなくち》", kana: "みなくち", romaji: "Minakuchi", lat: 34.97, lng: 136.172, minZoom: 12 },
  { id: "minakuchi-ishibashi", name: "水口石橋《みなくちいしばし》", kana: "みなくちいしばし", romaji: "Minakuchi-Ishibashi", lat: 34.9695, lng: 136.165, minZoom: 12 },
  { id: "minakuchi-jonan", name: "水口城南《みなくちじょうなん》", kana: "みなくちじょうなん", romaji: "Minakuchi-Jonan", lat: 34.9663, lng: 136.16, minZoom: 12 },
  { id: "kibukawa", name: "貴生川《きぶかわ》", kana: "きぶかわ", romaji: "Kibukawa", lat: 34.95, lng: 136.158, minZoom: 11 },

  // ===== 近江鉄道 多賀線 =====
  { id: "screen", name: "スクリーン", kana: "すくりーん", romaji: "Screen", lat: 35.247, lng: 136.252, minZoom: 12 },
  { id: "taga-taisha-mae", name: "多賀大社前《たがたいしゃまえ》", kana: "たがたいしゃまえ", romaji: "Taga-Taisha-mae", lat: 35.245, lng: 136.268, minZoom: 12 },

  // ===== 近江鉄道 八日市線（万葉あかね線） =====
  { id: "musa", name: "武佐《むさ》", kana: "むさ", romaji: "Musa", lat: 35.124, lng: 136.12, minZoom: 12 },
  { id: "hirata", name: "平田《ひらた》", kana: "ひらた", romaji: "Hirata", lat: 35.118, lng: 136.14, minZoom: 12 },
  { id: "ichinobe", name: "市辺《いちのべ》", kana: "いちのべ", romaji: "Ichinobe", lat: 35.116, lng: 136.156, minZoom: 12 },
  { id: "tarobogu-mae", name: "太郎坊宮前《たろうぼうぐうまえ》", kana: "たろうぼうぐうまえ", romaji: "Tarobogu-mae", lat: 35.115, lng: 136.17, minZoom: 12 },
  { id: "shin-yokaichi", name: "新八日市《しんようかいち》", kana: "しんようかいち", romaji: "Shin-Yokaichi", lat: 35.1188, lng: 136.183, minZoom: 12 },
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
