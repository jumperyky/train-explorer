/**
 * PWA用アイコン(PNG)をコード生成する。
 * 画像ライブラリを入れずに済むよう、zlib で最小構成のPNGを組み立てている。
 *   node scripts/generate-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const BG = [11, 87, 208];
const BODY = [255, 255, 255];
const WINDOW = [23, 50, 74];
const STRIPE = [255, 212, 0];
const RAIL = [180, 200, 225];

/** 正規化座標(0〜1)で「でんしゃ」を描く */
function pixel(u, v, maskable) {
  // maskable 用は安全領域(中央80%)に収まるよう少し縮める
  const k = maskable ? 0.8 : 1;
  const x = (u - 0.5) / k + 0.5;
  const y = (v - 0.5) / k + 0.5;

  // 車体（角丸の四角）
  const bx0 = 0.22, bx1 = 0.78, by0 = 0.2, by1 = 0.74, r = 0.12;
  if (inRoundRect(x, y, bx0, by0, bx1, by1, r)) {
    // 窓（大きな1枚窓）
    if (x > 0.3 && x < 0.7 && y > 0.28 && y < 0.44) return WINDOW;
    // 帯
    if (y > 0.5 && y < 0.56) return STRIPE;
    // ヘッドライト
    if (dist(x, y, 0.33, 0.64) < 0.045 || dist(x, y, 0.67, 0.64) < 0.045) return STRIPE;
    return BODY;
  }
  // 車輪
  if (dist(x, y, 0.36, 0.79) < 0.055 || dist(x, y, 0.64, 0.79) < 0.055) return WINDOW;
  // レール
  if (y > 0.85 && y < 0.89 && x > 0.14 && x < 0.86) return RAIL;
  return BG;
}

const dist = (x, y, cx, cy) => Math.hypot(x - cx, y - cy);

function inRoundRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return dist(x, y, cx, cy) <= r + 1e-6;
}

function renderPng(size, maskable) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let p = 0;
  for (let j = 0; j < size; j++) {
    raw[p++] = 0; // filter type: none
    for (let i = 0; i < size; i++) {
      const [r, g, b] = pixel((i + 0.5) / size, (j + 0.5) / size, maskable);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
      raw[p++] = 255;
    }
  }
  return buildPng(size, size, deflateSync(raw, { level: 9 }));
}

function buildPng(width, height, idatData) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([len, body, crc]);
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

mkdirSync(OUT_DIR, { recursive: true });
const targets = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
  ["apple-touch-icon.png", 180, false],
];
for (const [name, size, maskable] of targets) {
  writeFileSync(join(OUT_DIR, name), renderPng(size, maskable));
  console.log("generated", name, `${size}x${size}`);
}
