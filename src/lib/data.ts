import "server-only";

// 서버 전용 데이터 접근 — 스킬 JSON(약 500KB)이 클라이언트 번들에 섞이지 않도록 server-only 로 막습니다.
// 클라이언트 컴포넌트는 API Route + TanStack Query 로 받아 씁니다.

import heroesJson from "@/data/heroes.json";
import statsJson from "@/data/stats.json";
import skillsJson from "@/data/skills.json";
import teamupsJson from "@/data/teamups.json";
import mapsJson from "@/data/maps.json";
import mapModesJson from "@/data/map-modes.json";
import metaJson from "@/data/meta.json";
import type {
  DataMeta,
  GameMap,
  Hero,
  HeroListItem,
  HeroStat,
  MapModeInfo,
  Skill,
  TeamUp,
} from "./types";
import type { TeamData } from "./team-types";

export const heroes = heroesJson as Hero[];
export const stats = statsJson as HeroStat[];
export const skills = skillsJson as Skill[];
export const teamups = teamupsJson as TeamUp[];
export const maps = mapsJson as GameMap[];
export const mapModes = mapModesJson as MapModeInfo[];
export const meta = metaJson as DataMeta;

const heroBySlug = new Map(heroes.map((h) => [h.slug, h]));
const statById = new Map(stats.map((s) => [s.id, s]));

export const getHero = (slug: string): Hero | undefined => heroBySlug.get(slug);
export const getStat = (id: string): HeroStat | undefined => statById.get(id);

/** 영웅에 연결된 통계 (데드풀은 역할별 3개) */
export const getHeroStats = (slug: string): HeroStat[] =>
  (heroBySlug.get(slug)?.statIds ?? []).map((id) => statById.get(id)).filter((s): s is HeroStat => Boolean(s));

export const getHeroSkills = (slug: string): Skill[] => skills.filter((s) => s.heroSlug === slug);

/** 이 영웅이 가진 협공 + 이 영웅이 파트너인 협공 */
export const getHeroTeamUps = (slug: string): TeamUp[] =>
  teamups.filter((t) => t.heroSlug === slug || t.partnerSlug === slug);

/** 영웅 목록·미리보기용 데이터 (/api/heroes 와 서버 미리 채움이 같은 함수를 씀) */
export function getHeroList(): HeroListItem[] {
  return heroes.map((h) => ({
    slug: h.slug,
    nameKo: h.nameKo,
    nameEn: h.nameEn,
    roles: h.roles,
    healthText: h.healthText,
    healthTotal: h.healthTotal,
    difficulty: h.difficulty,
    ultimateName: h.ultimateName,
    ultimateCostText: h.ultimateCostText,
    forms: h.forms,
    ultimateDescription: skills.find((s) => s.heroSlug === h.slug && s.type === "ultimate")?.description ?? "",
    stats: getHeroStats(h.slug).map(({ id, label, variantRole, tier, winRate, playstyles, pdr }) => ({
      id,
      label,
      variantRole,
      tier,
      winRate,
      playstyles,
      pdr,
    })),
  }));
}

/** 팀 빌더용 데이터 (/api/team-data 와 서버 미리 채움이 같은 함수를 씀) */
export function getTeamData(): TeamData {
  return {
    entries: [...stats]
      .sort((a, b) => a.rank - b.rank)
      .map((s) => {
        const h = heroBySlug.get(s.heroSlug)!;
        return {
          statId: s.id,
          slug: h.slug,
          label: s.label,
          nameEn: h.nameEn,
          role: s.variantRole ?? h.roles[0],
          tier: s.tier,
          winRate: s.winRate,
          playstyles: s.playstyles,
          pdr: s.pdr,
        };
      }),
    teamups: teamups.map(({ id, heroSlug, partnerSlug, name, key }) => ({ id, heroSlug, partnerSlug, name, key })),
    counters: Object.fromEntries(stats.map((s) => [s.id, s.counters.map(({ statId, score }) => ({ statId, score }))])),
  };
}
