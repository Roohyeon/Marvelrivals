import type { Playstyle, Role, Tier } from "./types";

/** 팀 빌더에서 고를 수 있는 한 칸 = 통계 항목 1개 (데드풀은 역할별로 3개) */
export interface TeamEntry {
  statId: string;
  slug: string;
  /** 예: "아이언맨", "데드풀(전략가)" */
  label: string;
  /** 검색용 영문 이름 */
  nameEn: string;
  role: Role;
  tier: Tier;
  winRate: number;
  playstyles: Playstyle[];
  pdr: { p: number; d: number; r: number };
}

export interface TeamData {
  entries: TeamEntry[];
  /** 협공: 영웅 slug 기준 (폼별 중복 제거된 협공 스킬 시트) */
  teamups: { id: string; heroSlug: string; partnerSlug: string; name: string; key: string }[];
  /** 통계 ID → 이 영웅을 잡는 영웅 (카운터 지수) */
  counters: Record<string, { statId: string; score: number }[]>;
}
