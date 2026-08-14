"use client";

import { useEffect } from "react";

/**
 * Service Worker の登録。
 * MVPでは「アプリの殻をキャッシュして、2回目以降の起動を速くする」だけ。
 * 将来オフライン対応を広げるときは public/sw.js を拡張する。
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* 登録に失敗してもアプリ本体は動くので握りつぶす */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
