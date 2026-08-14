"use client";

import { useState } from "react";
import type { Train } from "@/data/types";
import TrainArt from "./TrainArt";
import { useTrainImage } from "@/lib/useTrainImage";

/**
 * 車両のビジュアル。
 * バックエンドの画像プロキシから写真が取れたら写真、だめなら内蔵イラスト。
 * 読み込みに失敗したときもイラストに戻す（子どもに壊れた画像を見せない）。
 *
 * 写真は外部ドメインなので next/image ではなく素の <img> を使う
 * （URLが実行時に決まり、Wikimedia 側の都合でドメインも変わりうるため）。
 */
export default function TrainPhoto({
  train,
  className,
}: {
  train: Train;
  className?: string;
}) {
  const photo = useTrainImage(train.wikipediaTitle);
  const [failed, setFailed] = useState(false);

  if (photo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={train.kana}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${className ?? ""} object-cover`}
      />
    );
  }
  return <TrainArt train={train} className={className} />;
}
