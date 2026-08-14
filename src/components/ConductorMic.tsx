"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { search, type SearchHit } from "@/lib/search";
import RubyText from "./RubyText";

/**
 * 機能D「車掌さんマイク」。
 * Web Speech API (SpeechRecognition) で音声を文字にして、
 * ずかん／路線ガイド／マップの該当箇所へジャンプする。
 *
 * - HTTPS（または localhost）でないと動かない
 * - 未対応ブラウザではキーボード入力にフォールバックする
 */

type Phase = "idle" | "listening" | "thinking" | "result" | "unsupported" | "error";

// Web Speech API は TS の標準型に含まれないので最小限だけ定義する
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * 音声認識が使えるかどうか。
 * サーバー側では「使える」前提で描画し、クライアントで実際の値に切り替える
 * （useState + useEffect だとハイドレーション後に無駄な再レンダリングが起きるため）。
 */
const EMPTY_SUBSCRIBE = () => () => {};
function useSpeechSupported() {
  return useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => getRecognitionCtor() !== null,
    () => true,
  );
}

export default function ConductorMic() {
  const router = useRouter();
  const supported = useSpeechSupported();
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [typed, setTyped] = useState("");
  const recogRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => () => recogRef.current?.abort(), []);

  const runSearch = useCallback((text: string) => {
    setTranscript(text);
    const found = search(text);
    setHits(found);
    setPhase("result");
    // ぴったり1件だけ見つかったら、そのまま連れていく
    if (found.length === 1) router.push(found[0].href);
  }, [router]);

  const listen = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setPhase("unsupported");
      return;
    }
    const recog = new Ctor();
    recogRef.current = recog;
    recog.lang = "ja-JP";
    recog.interimResults = false;
    recog.continuous = false;
    recog.maxAlternatives = 1;

    recog.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      setPhase("thinking");
      runSearch(text);
    };
    recog.onerror = () => setPhase("error");
    recog.onend = () => setPhase((p) => (p === "listening" ? "idle" : p));

    setTranscript("");
    setHits([]);
    setPhase("listening");
    try {
      recog.start();
    } catch {
      setPhase("error");
    }
  }, [runSearch]);

  const listening = phase === "listening";

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={listening ? () => recogRef.current?.stop() : listen}
        disabled={!supported}
        aria-label="しゃしょうさんマイク"
        className={[
          "relative flex h-32 w-32 flex-col items-center justify-center rounded-full text-white shadow-[0_8px_0_rgba(0,0,0,0.2)] transition active:translate-y-1 active:shadow-[0_3px_0_rgba(0,0,0,0.2)]",
          listening ? "animate-pulse-ring bg-[#e5342a]" : "bg-[#1f4fb6]",
          supported ? "" : "opacity-40",
        ].join(" ")}
      >
        <span className="text-5xl leading-none">🎤</span>
        <span className="ruby-line mt-1 text-base">
          <RubyText text={listening ? "聞《き》いてるよ" : "お話《はなし》"} />
        </span>
      </button>

      <p className="ruby-line min-h-7 text-center text-lg text-foreground/70">
        {phase === "listening" && <RubyText text="「のぞみ！」って 言《い》ってみて" />}
        {phase === "thinking" && <RubyText text="探《さが》してるよ…" />}
        {phase === "error" && (
          <RubyText text="うまく 聞《き》こえなかった。もう一度《いちど》！" />
        )}
        {!supported && <RubyText text="このブラウザは お声《こえ》が 使《つか》えないよ" />}
        {phase === "result" && transcript && `「${transcript}」`}
      </p>

      {phase === "result" && hits.length === 0 && (
        <p className="ruby-line text-lg text-[#e5342a]">
          <RubyText text="見《み》つからなかった…ほかの 言葉《ことば》で！" />
        </p>
      )}

      {hits.length > 1 && (
        <ul className="flex w-full max-w-md flex-col gap-2">
          {hits.map((h) => (
            <li key={`${h.kind}-${h.href}`}>
              <button
                type="button"
                onClick={() => router.push(h.href)}
                className="ruby-line w-full rounded-2xl bg-card px-4 py-4 text-left text-xl shadow active:scale-[0.99]"
              >
                <span className="mr-2">
                  {h.kind === "train" ? "🚆" : h.kind === "line" ? "🛤️" : "🚉"}
                </span>
                <RubyText text={h.label} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 音声が使えない環境用のフォールバック */}
      {(!supported || phase === "error") && (
        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed.trim()) runSearch(typed.trim());
          }}
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="でんしゃや えきの なまえ"
            className="min-w-0 flex-1 rounded-2xl bg-card px-4 py-3 text-xl shadow outline-none"
          />
          <button
            type="submit"
            className="ruby-line rounded-2xl bg-[#1f4fb6] px-5 py-3 text-xl text-white shadow active:scale-95"
          >
            <RubyText text="探《さがす》" />
          </button>
        </form>
      )}
    </div>
  );
}
