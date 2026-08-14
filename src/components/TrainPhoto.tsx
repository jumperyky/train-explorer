"use client";

import { useState } from "react";
import type { Train } from "@/data/types";
import TrainArt from "./TrainArt";
import PhotoCredit from "./PhotoCredit";
import { usePhoto } from "@/lib/usePhoto";

/**
 * 車両のビジュアル。
 * 写真が取れたら写真＋クレジット、だめなら内蔵イラスト。
 * 読み込みに失敗したときもイラストに戻す（子どもに壊れた画像を見せない）。
 *
 * 写真は外部ドメインなので next/image ではなく素の <img> を使う
 * （URLが実行時に決まり、Wikimedia 側の都合でドメインも変わりうるため）。
 */
/**
 * クレジットを省くオプションはあえて用意していない。
 * 表示のたびに帰属表示が要るライセンスなので、写真を出すなら必ずクレジットも出る。
 * クレジットが読めないほど小さい場所では、写真ではなく TrainArt を直接使うこと。
 */
export default function TrainPhoto({
  train,
  className,
}: {
  train: Train;
  className?: string;
}) {
  const photo = usePhoto(train.photo, train.wikipediaTitle);
  const [failed, setFailed] = useState(false);

  if (!photo?.imageUrl || failed) {
    return <TrainArt train={train} className={className} />;
  }

  return (
    <span className="relative block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.imageUrl}
        alt={train.kana}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${className ?? ""} object-cover`}
      />
      <PhotoCredit photo={photo} className="absolute bottom-1 right-2 text-right" />
    </span>
  );
}
