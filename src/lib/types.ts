// 데이터 타입 — scripts/build-data.ts 가 만들어 내는 src/data/*.json 의 형태

export type Role = "vanguard" | "duelist" | "strategist";
export type Tier = "S" | "A" | "B" | "C" | "D" | "F";
export type Playstyle = "P" | "D" | "R";
export type MapMode = "domination" | "convoy" | "convergence";

/** 영웅 slug (이미지 파일명·URL과 같음). 예: "iron-man" */
export type HeroSlug = string;

/**
 * 통계 ID. 대부분 영웅 slug와 같고, 데드풀만 역할별로 나뉩니다.
 * 예: "iron-man", "deadpool-vanguard"
 */
export type StatId = string;

export interface Hero {
  slug: HeroSlug;
  nameKo: string;
  nameEn: string;
  /** official = 공식 한국어 영웅 목록, common = 통상 표기(공식 미확인) */
  nameKoSource: "official" | "common";
  roles: Role[];
  /** 원문 표기 그대로. 예: "350+200 재생 보호막", 헐크·데드풀은 폼/역할별 여러 값 */
  healthText: string;
  /** 정렬용: 기본 체력 + 재생 보호막 (여러 값이면 가장 큰 값) */
  healthTotal: number;
  /** 1~5, 위키에 값이 없으면 null (데드풀) */
  difficulty: number | null;
  moveSpeed: number;
  /** false = 개별 수치 미확인 (일반값 6m/s) */
  moveSpeedVerified: boolean;
  ultimateName: string;
  /** 원문 표기. 예: "3400", 헐크는 폼별 값 */
  ultimateCostText: string;
  /** 단일 값일 때만 숫자, 아니면 null */
  ultimateCost: number | null;
  passives: string[];
  forms: string[];
  wikiUrl: string;
  skillCount: number;
  /** 이 영웅에 연결된 통계 ID (데드풀만 3개) */
  statIds: StatId[];
}

export interface CounterEntry {
  statId: StatId;
  /** 카운터 지수 (승률 %가 아님, 0 = 비등) */
  score: number;
  type: "duel" | "team" | "mixed" | null;
}

export interface HeroStat {
  id: StatId;
  heroSlug: HeroSlug;
  /** 표시용 이름. 예: "아이언맨", "데드풀(전략가)" */
  label: string;
  /** 데드풀처럼 역할별로 나뉜 경우의 역할 */
  variantRole: Role | null;
  tier: Tier;
  rank: number;
  winRate: number;
  playstyles: Playstyle[];
  /** 0~1 */
  pdr: { p: number; d: number; r: number };
  pdrNote: string;
  /** 이 영웅을 잡는 영웅 TOP5 */
  counters: CounterEntry[];
  /** 이 영웅이 강한 상대 TOP3 */
  strongAgainst: StatId[];
}

export type SkillType = "attack" | "ability" | "ultimate" | "passive" | "teamup" | "shop";

export interface SkillDetail {
  label: string;
  value: string;
}

export interface Skill {
  id: string;
  heroSlug: HeroSlug;
  form: string | null;
  type: SkillType;
  name: string;
  nameEn: string;
  key: string;
  partnerSlug: HeroSlug | null;
  cooldown: string | null;
  ultimateCost: number | null;
  details: SkillDetail[];
  description: string;
}

export interface TeamUp {
  id: string;
  heroSlug: HeroSlug;
  name: string;
  partnerSlug: HeroSlug;
  key: string;
  cooldown: string | null;
  details: SkillDetail[];
  effect: string;
}

export interface MapWinRate {
  statId: StatId;
  winRate: number;
}

export interface GameMap {
  id: string;
  mode: MapMode;
  order: number;
  nameKo: string;
  nameEn: string;
  regionKo: string | null;
  regionEn: string | null;
  releaseDate: string;
  releaseLabel: string;
  top5: MapWinRate[];
  /** image/Maps 에 원본이 있으면 변환된 WebP, 없으면 null (디자인 카드로 대체) */
  image: { src: string; width: number; height: number } | null;
}

export interface MapModeInfo {
  mode: MapMode;
  nameKo: string;
  nameEn: string;
  description: string;
}

// ───────── 화면용 가공 데이터 (API 응답) ─────────

/** 목록·미리보기에 필요한 통계만 추린 것 */
export type HeroListStat = Pick<HeroStat, "id" | "label" | "variantRole" | "tier" | "winRate" | "playstyles" | "pdr">;

/** /api/heroes 응답 한 줄 — 영웅 목록·미리보기 패널용 */
export interface HeroListItem
  extends Pick<
    Hero,
    | "slug"
    | "nameKo"
    | "nameEn"
    | "roles"
    | "healthText"
    | "healthTotal"
    | "difficulty"
    | "ultimateName"
    | "ultimateCostText"
    | "forms"
  > {
  ultimateDescription: string;
  /** 데드풀만 3개 (역할 순서) */
  stats: HeroListStat[];
}

export interface DataMeta {
  collectedAt: string;
  statsUpdatedAt: string;
  season: string;
  notes: Record<"heroes" | "tier" | "counters" | "pdr" | "maps" | "skills", string[]>;
  sources: { category: string; url: string; usage: string }[];
}
