import "server-only";

import { getHero, getStat, mapModes, maps, stats } from "./data";
import type { GameMap, HeroStat, MapModeInfo, Playstyle, Role, Tier } from "./types";

// 홈·티어·맵 화면용 가공 데이터 — 통계 ID를 영웅 이름·역할·이미지 slug로 풀어 둠

export interface StatRowData {
  statId: string;
  slug: string;
  label: string;
  role: Role;
  tier: Tier;
  rank: number;
  winRate: number;
  playstyles: Playstyle[];
}

export function toRow(s: HeroStat): StatRowData {
  const hero = getHero(s.heroSlug);
  return {
    statId: s.id,
    slug: s.heroSlug,
    label: s.label,
    role: s.variantRole ?? hero?.roles[0] ?? "duelist",
    tier: s.tier,
    rank: s.rank,
    winRate: s.winRate,
    playstyles: s.playstyles,
  };
}

/** 승률 순 전체 (티어 목록 시트의 순위와 같음) */
export const getStatRows = (): StatRowData[] => [...stats].sort((a, b) => a.rank - b.rank).map(toRow);

export function getRoleTop(role: Role, n = 5): StatRowData[] {
  return getStatRows()
    .filter((r) => r.role === role)
    .slice(0, n);
}

export interface MapCardData extends Omit<GameMap, "top5"> {
  top5: (StatRowData & { mapWinRate: number })[];
}

export function getMapCards(): MapCardData[] {
  return [...maps]
    .sort((a, b) => a.order - b.order)
    .map((m) => ({
      ...m,
      top5: m.top5
        .map((t) => {
          const s = getStat(t.statId);
          return s ? { ...toRow(s), mapWinRate: t.winRate } : null;
        })
        .filter((v): v is NonNullable<typeof v> => v !== null),
    }));
}

export const getMapModes = (): MapModeInfo[] => mapModes;

/** 티어 구간 기준 (티어 목록 시트 각주) */
export const TIER_RULE: Partial<Record<Tier, string>> = { S: "승률 53% 이상", F: "승률 47% 미만" };
