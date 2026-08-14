"use client";

import { useEffect, useState } from "react";
import type { Train } from "@/data/types";
import { networkMap, lineMap } from "@/data/lines";
import RubyText from "./RubyText";
import TrainPhoto from "./TrainPhoto";
import { toPlainText } from "@/lib/ruby";

/**
 * 「でんしゃのひみつ」モーダル。
 * 機能E Phase1 として、外部詳細ページのボタンは置くが
 * 実際には外に出ず、アプリ内の簡単なテキスト表示にとどめる。
 */
export default function TrainDetailModal({
  train,
  onClose,
}: {
  train: Train;
  onClose: () => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const network = networkMap[train.network];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={toPlainText(train.name)}
      onClick={onClose}
    >
      <div
        className="animate-pop-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-card pb-8 shadow-2xl sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <TrainPhoto train={train} className="h-52 w-full rounded-t-[2rem] object-cover" />
          <button
            type="button"
            onClick={onClose}
            aria-label="とじる"
            className="absolute right-3 top-3 flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-3xl text-white active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pt-4">
          <span
            className="ruby-line inline-block rounded-full px-3 py-1 text-base text-white"
            style={{ background: network.color }}
          >
            {network.emoji} <RubyText text={network.name} />
          </span>

          <h2 className="ruby-line mt-2 text-4xl leading-tight">
            <RubyText text={train.name} />
          </h2>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#eaf4ff] p-3 text-center">
              <dt className="ruby-line text-base text-foreground/60">
                <RubyText text="最高速度《さいこうそくど》" />
              </dt>
              <dd className="text-3xl" style={{ color: network.color }}>
                {train.maxSpeed}
                <span className="text-lg"> km/h</span>
              </dd>
            </div>
            <div className="rounded-2xl bg-[#eaf4ff] p-3 text-center">
              <dt className="ruby-line text-base text-foreground/60">デビュー</dt>
              <dd className="ruby-line text-3xl" style={{ color: network.color }}>
                {train.debutYear}
                <span className="text-lg">
                  {" "}
                  <RubyText text="年《ねん》" />
                </span>
              </dd>
            </div>
          </dl>

          <h3 className="ruby-line mt-5 text-2xl">
            ✨ <RubyText text="電車《でんしゃ》の 秘密《ひみつ》" />
          </h3>
          <ul className="ruby-line mt-2 flex flex-col gap-2">
            {train.secrets.map((s, i) => (
              <li key={i} className="rounded-2xl bg-[#fff7e0] px-4 py-3 text-xl">
                <RubyText text={s} />
              </li>
            ))}
          </ul>

          <h3 className="ruby-line mt-5 text-2xl">
            🛤️ <RubyText text="走《はし》る 路線《ろせん》" />
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {train.lineIds.map((id) => {
              const line = lineMap[id];
              if (!line) return null;
              return (
                <li
                  key={id}
                  className="ruby-line rounded-full px-3 py-2 text-lg text-white"
                  style={{ background: line.color }}
                >
                  <RubyText text={line.name} />
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="ruby-line mt-6 w-full rounded-2xl bg-[#1f4fb6] px-4 py-4 text-xl text-white shadow active:scale-[0.99]"
          >
            📚 もっと <RubyText text="詳《くわ》しく" />
          </button>
          {showMore && (
            <div className="ruby-line animate-pop-in mt-3 rounded-2xl bg-[#eef1f4] p-4 text-lg">
              <p>
                <RubyText text="今《いま》は 準備中《じゅんびちゅう》だよ。" />
                <br />
                これから「<RubyText text={train.name} />」の{" "}
                <RubyText text="詳《くわ》しい ページが 見《み》られるように なるよ！" />
              </p>
              <p className="mt-2 text-base text-foreground/60">
                （Phase2: ホワイトリスト化した安全なページのみを表示する予定。
                現在はアプリ内モックのみ）
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
