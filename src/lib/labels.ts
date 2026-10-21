import type { MapMode, Playstyle, Role, Tier } from "./types";

export const ROLE_LABEL: Record<Role, string> = {
  vanguard: "뱅가드",
  duelist: "듀얼리스트",
  strategist: "전략가",
};

export const ROLES: Role[] = ["vanguard", "duelist", "strategist"];
export const TIERS: Tier[] = ["S", "A", "B", "C", "D", "F"];
export const PLAYSTYLES: Playstyle[] = ["P", "D", "R"];

export const PLAYSTYLE_LABEL: Record<Playstyle, string> = {
  P: "포킹",
  D: "다이브",
  R: "러쉬",
};

export const MAP_MODE_LABEL: Record<MapMode, string> = {
  domination: "경쟁",
  convoy: "호송",
  convergence: "경쟁+호송",
};

export const COUNTER_TYPE_LABEL = {
  duel: "1:1 대결 우세",
  team: "팀 단위 압박",
  mixed: "복합 위협",
} as const;
