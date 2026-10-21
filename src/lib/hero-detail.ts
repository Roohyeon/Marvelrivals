import "server-only";

import { getHero, getHeroSkills, getHeroStats, getStat, heroes, teamups } from "./data";
import type { CounterEntry, Hero, HeroStat, Role, Skill, TeamUp } from "./types";

// 영웅 상세 화면에 필요한 데이터를 한 번에 모아, 다른 영웅 참조(slug/통계 ID)를 이름·역할로 풀어 둡니다.

export interface HeroRef {
  statId: string;
  slug: string;
  /** 통계 표기 이름. 예: "데드풀(전략가)" */
  label: string;
  role: Role;
}

export interface ResolvedCounter extends HeroRef {
  score: number;
  type: CounterEntry["type"];
}

export interface DetailStat extends Omit<HeroStat, "counters" | "strongAgainst"> {
  counters: ResolvedCounter[];
  strongAgainst: HeroRef[];
}

export interface TeamUpWithPartner extends TeamUp {
  /** 상대편 영웅 (내 협공이면 파트너, 참여 협공이면 협공 주인) */
  other: { slug: string; nameKo: string; role: Role };
}

export interface HeroDetail {
  hero: Hero;
  stats: DetailStat[];
  skills: Skill[];
  teamups: { own: TeamUpWithPartner[]; joined: TeamUpWithPartner[] };
}

function heroRef(statId: string): HeroRef | null {
  const stat = getStat(statId);
  const hero = stat && getHero(stat.heroSlug);
  if (!stat || !hero) return null;
  return { statId, slug: hero.slug, label: stat.label, role: stat.variantRole ?? hero.roles[0] };
}

function other(slug: string): TeamUpWithPartner["other"] {
  const h = getHero(slug);
  return { slug, nameKo: h?.nameKo ?? slug, role: h?.roles[0] ?? "duelist" };
}

export function getHeroDetail(slug: string): HeroDetail | null {
  const hero = getHero(slug);
  if (!hero) return null;

  const stats: DetailStat[] = getHeroStats(slug).map((s) => ({
    ...s,
    counters: s.counters
      .map((c) => {
        const ref = heroRef(c.statId);
        return ref ? { ...ref, score: c.score, type: c.type } : null;
      })
      .filter((c): c is ResolvedCounter => c !== null),
    strongAgainst: s.strongAgainst.map(heroRef).filter((r): r is HeroRef => r !== null),
  }));

  return {
    hero,
    stats,
    skills: getHeroSkills(slug),
    teamups: {
      own: teamups.filter((t) => t.heroSlug === slug).map((t) => ({ ...t, other: other(t.partnerSlug) })),
      joined: teamups.filter((t) => t.partnerSlug === slug).map((t) => ({ ...t, other: other(t.heroSlug) })),
    },
  };
}

export const allHeroSlugs = () => heroes.map((h) => h.slug);
