import { PLAYSTYLE_LABEL } from "./labels";
import type { TeamData, TeamEntry } from "./team-types";
import type { Playstyle, Role } from "./types";

// 팀 빌더 계산 규칙 (기획서 4-2)
// - 팀 성향 = 고른 영웅 P·D·R 점수의 각각 평균
// - 상성 순환: 포킹 > 러쉬 > 다이브 > 포킹
// - 카운터 추천 = 상대 영웅들의 "이 영웅을 잡는 영웅" 지수를 후보별로 합산

export const TEAM_SIZE = 6;

export type Pdr = { p: number; d: number; r: number };

export function averagePdr(team: TeamEntry[]): Pdr | null {
  if (!team.length) return null;
  const sum = team.reduce((acc, e) => ({ p: acc.p + e.pdr.p, d: acc.d + e.pdr.d, r: acc.r + e.pdr.r }), { p: 0, d: 0, r: 0 });
  return { p: sum.p / team.length, d: sum.d / team.length, r: sum.r / team.length };
}

/** 가장 높은 성향 (0.05 이내 차이는 함께 표기 — 예: 다이브 / 러쉬) */
export function mainStyles(pdr: Pdr): Playstyle[] {
  const entries: [Playstyle, number][] = [
    ["P", pdr.p],
    ["D", pdr.d],
    ["R", pdr.r],
  ];
  const max = Math.max(...entries.map(([, v]) => v));
  return entries.filter(([, v]) => max - v < 0.05).map(([k]) => k);
}

// 가위바위보: key 가 이기는 상대
const BEATS: Record<Playstyle, Playstyle> = { P: "R", R: "D", D: "P" };
const LOSES_TO: Record<Playstyle, Playstyle> = { P: "D", R: "P", D: "R" };

export function styleSummary(pdr: Pdr) {
  const main = mainStyles(pdr);
  const label = main.map((s) => PLAYSTYLE_LABEL[s]).join(" / ");
  // 두 성향 이상이 비슷하면 상성 조언은 생략
  const single = main.length === 1 ? main[0] : null;
  return {
    main,
    sentence: main.length === 3 ? "성향이 고르게 섞인 조합이에요" : `${label} 중심 조합이에요`,
    strongVs: single ? PLAYSTYLE_LABEL[BEATS[single]] : null,
    weakVs: single ? PLAYSTYLE_LABEL[LOSES_TO[single]] : null,
  };
}

export function roleCounts(team: TeamEntry[]): Record<Role, number> {
  const out: Record<Role, number> = { vanguard: 0, duelist: 0, strategist: 0 };
  for (const e of team) out[e.role]++;
  return out;
}

/** 팀 안에서 발동되는 협공 (협공 주인과 파트너가 모두 팀에 있을 때) */
export function activeTeamUps(team: TeamEntry[], data: TeamData) {
  const slugs = new Set(team.map((e) => e.slug));
  return data.teamups.filter((t) => slugs.has(t.heroSlug) && slugs.has(t.partnerSlug));
}

/** 한 명만 더하면 발동되는 협공 — 팀에 있는 영웅과 짝을 이루는 후보 */
export function nearTeamUps(team: TeamEntry[], data: TeamData, limit = 4) {
  const slugs = new Set(team.map((e) => e.slug));
  if (slugs.size >= TEAM_SIZE) return [];
  return data.teamups
    .filter((t) => slugs.has(t.heroSlug) !== slugs.has(t.partnerSlug))
    .map((t) => ({ ...t, missing: slugs.has(t.heroSlug) ? t.partnerSlug : t.heroSlug }))
    .slice(0, limit);
}

export interface CounterPick {
  entry: TeamEntry;
  total: number;
  /** 이 후보가 잡는 상대 영웅들 */
  against: { entry: TeamEntry; score: number }[];
}

export function counterPicks(ally: TeamEntry[], enemy: TeamEntry[], data: TeamData, limit = 3): CounterPick[] {
  if (!enemy.length) return [];
  const bySlugInTeam = new Set(ally.map((e) => e.slug));
  const entryById = new Map(data.entries.map((e) => [e.statId, e]));
  const totals = new Map<string, CounterPick>();

  for (const foe of enemy) {
    for (const c of data.counters[foe.statId] ?? []) {
      const candidate = entryById.get(c.statId);
      if (!candidate || bySlugInTeam.has(candidate.slug)) continue;
      const pick = totals.get(c.statId) ?? { entry: candidate, total: 0, against: [] };
      pick.total += c.score;
      pick.against.push({ entry: foe, score: c.score });
      totals.set(c.statId, pick);
    }
  }
  return [...totals.values()].sort((a, b) => b.total - a.total || b.against.length - a.against.length).slice(0, limit);
}

/** 같은 영웅(데드풀 역할 변형 포함)은 한 팀에 한 번만 */
export function addToTeam(team: string[], statId: string, entries: Map<string, TeamEntry>): string[] {
  const entry = entries.get(statId);
  if (!entry) return team;
  const withoutSameHero = team.filter((id) => entries.get(id)?.slug !== entry.slug);
  if (withoutSameHero.length >= TEAM_SIZE) return team;
  // 같은 영웅의 다른 역할을 고르면 그 자리를 바꿈
  const sameIndex = team.findIndex((id) => entries.get(id)?.slug === entry.slug);
  if (sameIndex >= 0) return team.map((id, i) => (i === sameIndex ? statId : id));
  return [...team, statId];
}

/** URL 공유: ?team=iron-man,storm&enemy=hulk */
export function parseTeamParam(value: string | null, valid: Set<string>): string[] | null {
  if (value === null) return null;
  const ids = value.split(",").filter((id) => valid.has(id));
  return [...new Set(ids)].slice(0, TEAM_SIZE);
}
