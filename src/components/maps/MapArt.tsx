import Image from "next/image";
import { MAP_MODE_LABEL } from "@/lib/labels";
import type { GameMap, MapMode } from "@/lib/types";

// 모드별 장식 색 (사선 띠) — 이미지가 없을 때의 디자인 카드
const MODE_ACCENT: Record<MapMode, string> = {
  domination: "bg-chart-ally",
  convoy: "bg-chart-r",
  convergence: "bg-chart-d",
};

/**
 * 맵 대표 이미지. image/Maps 에 원본을 넣고 npm run data 를 돌리면 사진이 나오고,
 * 없으면 남색 바탕 + 모드 색 사선 띠 + 원문 이름으로 된 카드로 대신합니다.
 */
export function MapArt({ map, sizes, className = "" }: { map: GameMap; sizes: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-hero-accent ${className}`}>
      {map.image ? (
        <Image src={map.image.src} alt={`${map.nameKo} 맵 이미지`} fill sizes={sizes} className="object-cover" />
      ) : (
        <>
          <span aria-hidden className={`absolute -right-6 top-0 h-full w-1/3 -skew-x-12 opacity-80 ${MODE_ACCENT[map.mode]}`} />
          <span aria-hidden className="absolute -right-2 top-0 h-full w-6 -skew-x-12 bg-selected/80" />
          <span className="absolute bottom-3 left-4 right-1/3 text-[22px] font-extrabold uppercase leading-none tracking-tight text-white/90">
            {map.nameEn}
          </span>
        </>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-tiny font-bold text-white backdrop-blur-sm">
        {MAP_MODE_LABEL[map.mode]}
      </span>
    </div>
  );
}
