import type { Train } from "@/data/types";

/**
 * 車両のイラスト（内蔵SVG）。
 * Wikimedia から画像が取れないとき／APIキー未設定のときでも
 * 「絵がある状態」を保つためのフォールバック。
 * 新幹線はロングノーズ、在来線は角ばった顔で描き分ける。
 */
export default function TrainArt({
  train,
  className,
}: {
  train: Train;
  className?: string;
}) {
  const isShinkansen = train.network === "shinkansen";
  const body = train.bodyColor;
  const stripe = train.stripeColor;

  return (
    <svg
      viewBox="0 0 320 140"
      className={className}
      role="img"
      aria-label={train.kana}
    >
      <defs>
        <linearGradient id={`sky-${train.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe8ff" />
          <stop offset="100%" stopColor="#eaf6ff" />
        </linearGradient>
        <linearGradient id={`body-${train.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={body} />
          <stop offset="100%" stopColor={shade(body, -14)} />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="320" height="140" fill={`url(#sky-${train.id})`} />

      {/* 車体 */}
      {isShinkansen ? (
        <path
          d="M18 96 C18 74 34 62 62 56 C110 46 168 40 300 40 L300 96 Z"
          fill={`url(#body-${train.id})`}
          stroke={shade(body, -30)}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M22 96 L22 52 Q22 42 34 42 L300 42 L300 96 Z"
          fill={`url(#body-${train.id})`}
          stroke={shade(body, -30)}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}

      {/* 帯 */}
      {isShinkansen ? (
        <path d="M40 82 C90 70 170 66 300 66 L300 78 C170 78 96 82 46 92 Z" fill={stripe} />
      ) : (
        <rect x="24" y="72" width="276" height="12" fill={stripe} />
      )}

      {/* 運転席の窓 */}
      {isShinkansen ? (
        <path d="M50 70 C64 60 84 55 108 52 L108 66 C86 68 68 71 56 76 Z" fill="#17324a" opacity="0.85" />
      ) : (
        <rect x="34" y="50" width="52" height="18" rx="5" fill="#17324a" opacity="0.85" />
      )}

      {/* 客室の窓 */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={140 + i * 42}
          y={isShinkansen ? 52 : 50}
          width="30"
          height="16"
          rx="4"
          fill="#17324a"
          opacity="0.75"
        />
      ))}

      {/* ヘッドライト */}
      <circle cx={isShinkansen ? 42 : 32} cy={isShinkansen ? 86 : 88} r="5.5" fill="#ffe36e" stroke="#e0a800" strokeWidth="1.5" />

      {/* 台車と車輪 */}
      <rect x="18" y="96" width="284" height="8" fill="#5b6b7a" />
      {[62, 96, 210, 250].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={110} r="11" fill="#2f3b47" />
          <circle cx={cx} cy={110} r="4.5" fill="#9aa7b3" />
        </g>
      ))}

      {/* レール */}
      <rect x="0" y="122" width="320" height="6" fill="#8d99a6" />
      <rect x="0" y="128" width="320" height="12" fill="#c8b39a" />
    </svg>
  );
}

/** 16進カラーを明るく／暗くする（percent は -100〜100） */
function shade(hex: string, percent: number): string {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const num = parseInt(full, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((num >> 16) & 0xff) * (1 + percent / 100));
  const g = clamp(((num >> 8) & 0xff) * (1 + percent / 100));
  const b = clamp((num & 0xff) * (1 + percent / 100));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
