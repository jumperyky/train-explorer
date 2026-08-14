"use client";

import { useState } from "react";
import { isAllowedLink } from "@/lib/safeLink";

/**
 * 外部サイトへの唯一の出口（要件 機能E）。
 *
 * 二重に絞っている:
 *  1. ホワイトリストに無いURLは、そもそもリンクにしない（ただの文字になる）
 *  2. 大人だけが通れる確認（かけ算）を通らないと開かない
 *
 * ふつうの <a> を置かないこと。子どもが1タップで外に出られてしまう。
 */

/** 一度通ったら、この時間だけは再確認しない（大人が出典を続けて見るとき用） */
const UNLOCK_MS = 5 * 60 * 1000;
let unlockedUntil = 0;

export default function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);

  // ホワイトリスト外は、リンクにせず文字として出す
  if (!isAllowedLink(href)) {
    return <span className={className}>{children}</span>;
  }

  const open = () => {
    unlockedUntil = Date.now() + UNLOCK_MS;
    setAsking(false);
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (Date.now() < unlockedUntil) open();
          else setAsking(true);
        }}
      >
        {children}
      </button>
      {asking && (
        <ParentalGate href={href} onPass={open} onCancel={() => setAsking(false)} />
      )}
    </>
  );
}

/**
 * 大人向けの確認。
 * わざとふりがなを振らず、5歳では解けないかけ算を出す。
 */
function ParentalGate({
  href,
  onPass,
  onCancel,
}: {
  href: string;
  onPass: () => void;
  onCancel: () => void;
}) {
  // 開くたびに問題を変える（答えを覚えられないように）
  const [question] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 4); // 6〜9
    const b = 6 + Math.floor(Math.random() * 4);
    return { a, b, answer: a * b };
  });
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);

  const host = (() => {
    try {
      return new URL(href).hostname;
    } catch {
      return href;
    }
  })();

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-5"
      role="dialog"
      aria-modal="true"
      aria-label="保護者確認"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <form
        className="animate-pop-in w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (Number(input) === question.answer) onPass();
          else {
            setWrong(true);
            setInput("");
          }
        }}
      >
        <h2 className="text-xl font-bold text-[#14304d]">保護者の方へ</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#14304d]/70">
          この先は外部サイト（{host}）です。アプリの外に出るため、
          お子さまだけで移動できないようにしています。
        </p>

        <p className="mt-4 text-center text-2xl text-[#14304d]">
          {question.a} × {question.b} = ?
        </p>
        <input
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value.replace(/[^0-9]/g, ""));
            setWrong(false);
          }}
          inputMode="numeric"
          aria-label="計算の答え"
          className="mt-2 w-full rounded-xl border-2 border-[#c3ccd6] px-4 py-3 text-center text-2xl outline-none focus:border-[#1f4fb6]"
        />
        {wrong && (
          <p className="mt-2 text-center text-sm text-[#e5342a]">
            答えが違います。
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-[#eef1f4] px-4 py-3 text-lg text-[#14304d] active:scale-95"
          >
            もどる
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#1f4fb6] px-4 py-3 text-lg text-white active:scale-95"
          >
            ひらく
          </button>
        </div>
      </form>
    </div>
  );
}
