"use client";

import { useEffect, useState } from "react";
import { fetchImage } from "./api";

/**
 * バックエンド経由で Wikipedia の写真URLを取りにいく。
 * 取れなければ null のまま（呼び出し側は内蔵イラストを出す）。
 */
export function useTrainImage(wikipediaTitle: string | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!wikipediaTitle) return;
    const ac = new AbortController();
    let alive = true;
    fetchImage(wikipediaTitle, ac.signal).then((data) => {
      if (alive && data?.imageUrl) setUrl(data.imageUrl);
    });
    return () => {
      alive = false;
      ac.abort();
    };
  }, [wikipediaTitle]);

  return url;
}
