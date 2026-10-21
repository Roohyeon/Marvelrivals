import { PLAYSTYLES, ROLES, TIERS } from "./labels";
import type { HeroListItem, HeroListStat, Playstyle, Role, Tier } from "./types";

// 영웅 목록 필터 — URL(?role=duelist&tier=S,A)이 유일한 기준. 새로고침·링크 공유 시 그대로 유지됩니다.

export type SortKey = "winrate" | "name" | "health" | "difficulty";

export const SORT_LABEL: Record<SortKey, string> = {
  winrate: "승률순",
  name: "이름순",
  health: "체력순",
  difficulty: "난이도 쉬운 순",
};

export const DIFFICULTIES = [1, 2, 3, 4, 5] as const;

export interface HeroFilters {
  role: Role | null;
  tiers: Tier[];
  styles: Playstyle[];
  difficulties: number[];
  q: string;
  sort: SortKey;
}

export const DEFAULT_FILTERS: HeroFilters = {
  role: null,
  tiers: [],
  styles: [],
  difficulties: [],
  q: "",
  sort: "winrate",
};

function parseList<T>(value: string | null, allowed: readonly T[], map: (s: string) => T = (s) => s as T): T[] {
  if (!value) return [];
  const out = value.split(",").map(map);
  return allowed.filter((a) => out.includes(a)); // 허용된 값만, 정해진 순서로
}

export function parseFilters(params: URLSearchParams): HeroFilters {
  const role = params.get("role") as Role | null;
  const sort = params.get("sort") as SortKey | null;
  return {
    role: role && ROLES.includes(role) ? role : null,
    tiers: parseList(params.get("tier"), TIERS),
    styles: parseList(params.get("style"), PLAYSTYLES),
    difficulties: parseList(params.get("diff"), DIFFICULTIES, Number),
    q: params.get("q")?.slice(0, 40) ?? "",
    sort: sort && sort in SORT_LABEL ? sort : "winrate",
  };
}

/** 기본값과 같은 항목은 URL에서 뺌 → 깔끔한 주소 */
export function filtersToSearch(f: HeroFilters, keep?: URLSearchParams): string {
  const p = new URLSearchParams();
  if (f.role) p.set("role", f.role);
  if (f.tiers.length) p.set("tier", f.tiers.join(","));
  if (f.styles.length) p.set("style", f.styles.join(","));
  if (f.difficulties.length) p.set("diff", f.difficulties.join(","));
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.sort !== "winrate") p.set("sort", f.sort);
  keep?.forEach((v, k) => {
    if (!["role", "tier", "style", "diff", "q", "sort", "focus"].includes(k)) p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function countActiveFilters(f: HeroFilters): number {
  return f.tiers.length + f.styles.length + f.difficulties.length;
}

export function hasAnyFilter(f: HeroFilters): boolean {
  return Boolean(f.role || f.q.trim() || countActiveFilters(f));
}

export function toggle<T>(list: T[], value: T, order: readonly T[]): T[] {
  const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  return order.filter((v) => next.includes(v));
}

/**
 * 화면에 대표로 보여줄 통계.
 * 데드풀처럼 역할별 통계가 있으면: 역할 필터가 걸린 경우 그 역할, 아니면 승률이 가장 높은 것.
 */
export function primaryStat(hero: HeroListItem, role: Role | null): HeroListStat {
  if (role) {
    const match = hero.stats.find((s) => s.variantRole === role);
    if (match) return match;
  }
  return hero.stats.reduce((best, s) => (s.winRate > best.winRate ? s : best), hero.stats[0]);
}

const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_.·]/g, "");

export function matchesSearch(hero: HeroListItem, q: string): boolean {
  const query = normalize(q);
  if (!query) return true;
  return [hero.nameKo, hero.nameEn, hero.slug].some((name) => normalize(name).includes(query));
}

export interface HeroRow {
  hero: HeroListItem;
  stat: HeroListStat;
}

export function applyFilters(list: HeroListItem[], f: HeroFilters): HeroRow[] {
  const rows = list
    .filter((h) => !f.role || h.roles.includes(f.role))
    .filter((h) => matchesSearch(h, f.q))
    .filter((h) => !f.difficulties.length || (h.difficulty !== null && f.difficulties.includes(h.difficulty)))
    .map((hero) => ({ hero, stat: primaryStat(hero, f.role) }))
    .filter(({ stat }) => !f.tiers.length || f.tiers.includes(stat.tier))
    .filter(({ stat }) => !f.styles.length || stat.playstyles.some((p) => f.styles.includes(p)));

  const byName = (a: HeroRow, b: HeroRow) => a.hero.nameKo.localeCompare(b.hero.nameKo, "ko");
  const compare: Record<SortKey, (a: HeroRow, b: HeroRow) => number> = {
    winrate: (a, b) => b.stat.winRate - a.stat.winRate || byName(a, b),
    name: byName,
    health: (a, b) => b.hero.healthTotal - a.hero.healthTotal || byName(a, b),
    // 난이도 값이 없는 영웅(데드풀)은 맨 뒤
    difficulty: (a, b) => (a.hero.difficulty ?? 9) - (b.hero.difficulty ?? 9) || byName(a, b),
  };
  return rows.sort(compare[f.sort]);
}
