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
import type { DataMeta, GameMap, Hero, HeroStat, MapModeInfo, Skill, TeamUp } from "./types";

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
