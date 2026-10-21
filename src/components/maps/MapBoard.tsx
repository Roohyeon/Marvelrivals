"use client";

import { CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { SourceNote } from "@/components/ui/Badges";
import { StatRow } from "@/components/ui/StatRow";
import { MAP_MODE_LABEL } from "@/lib/labels";
import type { MapCardData } from "@/lib/meta";
import type { MapMode, MapModeInfo } from "@/lib/types";
import { MapArt } from "./MapArt";

const MODES: MapMode[] = ["domination", "convoy", "convergence"];

interface Props {
  maps: MapCardData[];
  modes: MapModeInfo[];
}

export function MapBoard(props: Props) {
  return (
    <Suspense fallback={<MapBoardView {...props} mode="domination" onMode={() => {}} />}>
      <MapBoardFromUrl {...props} />
    </Suspense>
  );
}

function MapBoardFromUrl(props: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("mode") as MapMode | null;
  const mode = raw && MODES.includes(raw) ? raw : "domination";
  return <MapBoardView {...props} mode={mode} onMode={(m) => router.replace(`${pathname}?mode=${m}`, { scroll: false })} />;
}

function MapBoardView({ maps, modes, mode, onMode }: Props & { mode: MapMode; onMode: (m: MapMode) => void }) {
  const info = modes.find((m) => m.mode === mode);
  const list = maps.filter((m) => m.mode === mode);

  // 홈의 맵 카드에서 #맵ID 로 들어오면 그 카드를 펼치고 보여줌
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const el = id ? document.getElementById(id) : null;
    if (el instanceof HTMLDetailsElement) {
      el.open = true;
      el.scrollIntoView({ block: "center" });
    }
  }, [mode]);

  return (
    <>
      <div role="tablist" aria-label="모드" className="flex gap-1 overflow-x-auto rounded-full bg-elevated p-1 [scrollbar-width:none] md:inline-flex">
        {MODES.map((m) => {
          const active = m === mode;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onMode(m)}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-label transition-colors ${
                active ? "bg-surface font-bold text-primary shadow-panel" : "font-medium text-secondary hover:text-primary"
              }`}
            >
              {MAP_MODE_LABEL[m]}
              <span className="tabular text-caption text-secondary">{maps.filter((x) => x.mode === m).length}</span>
            </button>
          );
        })}
      </div>

      {info && (
        <p className="mt-3 max-w-3xl text-table text-secondary">
          <span className="font-semibold text-primary">{info.nameEn}</span> — {info.description}
        </p>
      )}

      <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((m) => (
          <li key={m.id}>
            <details id={m.id} className="group overflow-hidden rounded-panel border border-line bg-surface shadow-panel">
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <MapArt map={m} sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="aspect-[16/9]" />
                <div className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-title font-bold">{m.nameKo}</h2>
                    <p className="text-caption text-secondary">{m.nameEn}</p>
                    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-caption text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" aria-hidden />
                        {m.regionKo ? `${m.regionKo}` : "지역 정보 없음"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {m.releaseLabel} · {m.releaseDate}
                      </span>
                    </p>
                  </div>
                  <span className="mt-1 inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-line px-3 text-caption font-semibold">
                    승률 TOP5
                    <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden />
                  </span>
                </div>
              </summary>
              <div className="border-t border-line px-3 pb-3">
                <ol>
                  {m.top5.map((row, i) => (
                    <StatRow key={row.statId} row={row} rate={row.mapWinRate} rank={i + 1} />
                  ))}
                </ol>
                <div className="px-1 pt-2">
                  <SourceNote>커뮤니티 통계 · 맵 80판 미만 영웅 제외 · 10/15</SourceNote>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
