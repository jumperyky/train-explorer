"use client";

import { useEffect, useState } from "react";
import { fetchImage, fetchPhoto, type CommonsPhoto } from "./api";
import type { Photo } from "@/data/types";

/**
 * 写真とクレジットをまとめて取ってくるフック。
 *
 * 2段構え:
 *  1. photo.commonsFile があれば Commons から直接。撮影者とライセンスも取れる
 *  2. なければ wikipediaTitle の代表画像。データを増やすときは記事名だけでも
 *     とりあえず絵が出る（あとから commonsFile を足して精度を上げられる）
 *
 * 取得できなければ null。呼び出し側は内蔵イラストにフォールバックする。
 */
export function usePhoto(photo: Photo | undefined, wikipediaTitle?: string) {
  const [data, setData] = useState<CommonsPhoto | null>(null);
  const file = photo?.commonsFile;

  useEffect(() => {
    if (!file && !wikipediaTitle) return;
    const ac = new AbortController();
    let alive = true;

    const load = async () => {
      if (file) {
        const found = await fetchPhoto(file, ac.signal);
        if (alive && found?.imageUrl) {
          setData(found);
          return;
        }
      }
      if (!wikipediaTitle) return;
      const fallback = await fetchImage(wikipediaTitle, ac.signal);
      if (alive && fallback?.imageUrl) {
        setData({
          file: wikipediaTitle,
          imageUrl: fallback.imageUrl,
          descriptionUrl: fallback.pageUrl,
          artist: null,
          license: null,
          licenseUrl: null,
          attributionRequired: true,
        });
      }
    };
    load();

    return () => {
      alive = false;
      ac.abort();
    };
  }, [file, wikipediaTitle]);

  return data;
}
