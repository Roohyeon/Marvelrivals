/**
 * 엑셀(주 데이터) + 위키 JSON(교차 검증용) → src/data/*.json
 *
 *   npm run data
 *
 * 검증에 실패하면 종료 코드 1로 끝나므로, prebuild 에 걸어 두면 잘못된 데이터가 배포되지 않습니다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import sharp from "sharp";
import type {
  CounterEntry,
  DataMeta,
  GameMap,
  Hero,
  HeroStat,
  MapMode,
  MapModeInfo,
  Playstyle,
  Role,
  Skill,
  SkillDetail,
  SkillType,
  TeamUp,
  Tier,
} from "../src/lib/types";

const ROOT = path.resolve(__dirname, "..");
const XLSX_PATH = path.join(ROOT, "마블라이벌즈_영웅_데이터_한글1015 햄찌 수정본.xlsx");
const WIKI_JSON_PATH = path.join(ROOT, "marvel_rivals_wiki_data.json");
const IMAGE_DIR = path.join(ROOT, "public/images/heroes");
const OUT_DIR = path.join(ROOT, "src/data");
const MAP_IMAGE_SRC = path.join(ROOT, "image/Maps");
const MAP_IMAGE_OUT = path.join(ROOT, "public/images/maps");

const EXPECTED = { heroes: 54, stats: 56, skills: 601, maps: 18 };

const errors: string[] = [];
const warnings: string[] = [];
const fail = (msg: string) => errors.push(msg);
const warn = (msg: string) => warnings.push(msg);

// ───────────────────────── 엑셀 읽기 도우미 ─────────────────────────

type Row = (string | number | null)[];

function cellValue(v: ExcelJS.CellValue): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" || typeof v === "string") return typeof v === "string" ? v.trim() : v;
  if (typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if ("richText" in v) return v.richText.map((t) => t.text).join("").trim();
  if ("hyperlink" in v) return v.hyperlink; // 하이퍼링크 셀은 주소를 값으로 사용
  if ("result" in v) return cellValue(v.result as ExcelJS.CellValue);
  if ("error" in v) return null;
  return String(v);
}

function sheetRows(wb: ExcelJS.Workbook, name: string): Row[] {
  const ws = wb.getWorksheet(name);
  if (!ws) throw new Error(`엑셀 시트를 찾을 수 없음: ${name}`);
  const rows: Row[] = [];
  ws.eachRow({ includeEmpty: true }, (row) => {
    const values = row.values as ExcelJS.CellValue[]; // 1부터 시작
    rows.push(values.slice(1).map(cellValue));
  });
  return rows;
}

/** 머리글 다음 줄부터, 첫 칸이 비거나 "※"·"출처"로 시작하는 줄(각주) 전까지 */
function dataRows(rows: Row[]): Row[] {
  const out: Row[] = [];
  for (const r of rows.slice(1)) {
    const first = r[0];
    if (first == null || first === "") break;
    out.push(r);
  }
  return out;
}

/** 각주 줄 ("※ …", "출처: …", "P(포킹…" 등) */
function footnotes(rows: Row[]): string[] {
  return rows
    .map((r) => r[0])
    .filter((v): v is string => typeof v === "string" && /^(※|출처|[PDR]\(|상성|주 성향 =)/.test(v));
}

const str = (v: string | number | null | undefined): string => (v === null || v === undefined ? "" : String(v).trim());
const strOrNull = (v: string | number | null | undefined): string | null => {
  const s = str(v);
  return s === "" || s === "-" ? null : s;
};
const num = (v: string | number | null | undefined): number | null => {
  if (typeof v === "number") return v;
  const s = str(v).replace(/,/g, "");
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
};
const splitSlash = (v: string | number | null): string[] =>
  str(v)
    .split(" / ")
    .map((s) => s.trim())
    .filter((s) => s && s !== "-");

// ───────────────────────── 변환 규칙 ─────────────────────────

const ROLE_KO: Record<string, Role> = { 뱅가드: "vanguard", 듀얼리스트: "duelist", 전략가: "strategist" };

function parseRole(text: string): Role {
  const key = text.replace(/\(.*\)/, "").trim();
  const role = ROLE_KO[key];
  if (!role) throw new Error(`알 수 없는 역할: ${text}`);
  return role;
}

function slugFromWikiUrl(url: string): { slug: string; nameEn: string } {
  const page = decodeURIComponent(url.split("/wiki/")[1] ?? "");
  const nameEn = page.replace(/_/g, " ");
  const slug = nameEn
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return { slug, nameEn };
}

/** "350+200 재생 보호막" / "200 (브루스 배너) / 400+300 …" → 가장 큰 (기본+보호막) */
function healthTotal(text: string): number {
  const totals = text.split("/").map((seg) => {
    const m = seg.match(/(\d+)(?:\s*\+\s*(\d+))?/);
    return m ? Number(m[1]) + Number(m[2] ?? 0) : 0;
  });
  return Math.max(...totals);
}

const PLAYSTYLES = new Set<Playstyle>(["P", "D", "R"]);
function parsePlaystyles(text: string, where: string): Playstyle[] {
  const list = str(text)
    .split("/")
    .map((s) => s.trim()) as Playstyle[];
  for (const p of list) if (!PLAYSTYLES.has(p)) fail(`${where}: 알 수 없는 성향 "${text}"`);
  return list;
}

const TIERS = new Set<Tier>(["S", "A", "B", "C", "D", "F"]);

const COUNTER_TYPE: Record<string, CounterEntry["type"]> = {
  "1:1 대결 우세": "duel",
  "팀 단위 압박": "team",
  "복합 위협": "mixed",
};

const SKILL_TYPE: Record<string, SkillType> = {
  "일반 공격": "attack",
  "일반 스킬": "ability",
  궁극기: "ultimate",
  패시브: "passive",
  "협공 스킬": "teamup",
  "특수 상점 아이템": "shop",
};

const MAP_MODE: Record<string, MapMode> = {
  Domination: "domination",
  Convoy: "convoy",
  Convergence: "convergence",
};

/** "피해: 60; 탄약: 15" → [{label:"피해", value:"60"}, …] */
function parseDetails(text: string | number | null): SkillDetail[] {
  const s = str(text);
  if (!s || s === "-") return [];
  // 괄호 안의 "; " 는 나누지 않음 — 예: "10 (1s마다; 버프 활성 중에만)"
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === ";" && depth === 0 && /\s/.test(s[i + 1] ?? " ")) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const i = part.indexOf(": ");
      return i === -1 ? { label: "", value: part } : { label: part.slice(0, i), value: part.slice(i + 2) };
    });
}

// ───────────────────────── 메인 ─────────────────────────

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const wiki = JSON.parse(readFileSync(WIKI_JSON_PATH, "utf8")) as {
    heroes: Record<string, { role: string; health: string; difficulty: string; id: string }>;
    skills: { hero: string; name: string; section: string }[];
  };

  // ── 영웅 요약 ──
  const summaryRows = sheetRows(wb, "영웅 요약");
  const header = summaryRows[0].map(str);
  const col = (name: string) => {
    const i = header.indexOf(name);
    if (i === -1) throw new Error(`영웅 요약: 열 "${name}" 없음`);
    return i;
  };
  const C = {
    name: col("영웅"),
    nameSource: col("한글명 근거"),
    role: col("역할"),
    health: col("체력"),
    difficulty: col("난이도(1~5)"),
    speed: col("이동 속도(m/s)"),
    ult: col("궁극기"),
    ultCost: col("궁극기 비용"),
    passive: col("패시브"),
    forms: col("폼/모드"),
    skillCount: col("스킬 수"),
    wiki: col("위키 문서"),
  };

  const heroes: Hero[] = [];
  /** 한글 이름 → slug */
  const slugByKo = new Map<string, string>();

  for (const r of dataRows(summaryRows)) {
    const nameKo = str(r[C.name]);
    const wikiUrl = str(r[C.wiki]);
    if (!wikiUrl.startsWith("https://marvelrivals.fandom.com/wiki/")) {
      fail(`영웅 요약: ${nameKo} 위키 주소가 없음 (${wikiUrl})`);
      continue;
    }
    const { slug, nameEn } = slugFromWikiUrl(wikiUrl);
    const roles = str(r[C.role]).split(" / ").map(parseRole);
    const speedText = str(r[C.speed]);
    const ultCostText = str(r[C.ultCost]);

    heroes.push({
      slug,
      nameKo,
      nameEn,
      nameKoSource: str(r[C.nameSource]).startsWith("공식") ? "official" : "common",
      roles,
      healthText: str(r[C.health]),
      healthTotal: healthTotal(str(r[C.health])),
      difficulty: num(r[C.difficulty]),
      moveSpeed: Number(speedText.match(/\d+(\.\d+)?/)?.[0] ?? 6),
      moveSpeedVerified: !speedText.includes("미확인"),
      ultimateName: str(r[C.ult]),
      ultimateCostText: ultCostText,
      ultimateCost: num(ultCostText),
      passives: splitSlash(r[C.passive]),
      forms: splitSlash(r[C.forms]),
      wikiUrl,
      skillCount: num(r[C.skillCount]) ?? 0,
      statIds: [],
    });
    slugByKo.set(nameKo, slug);
  }

  /** "헐크(브루스 배너)" 처럼 폼이 붙은 이름도 영웅으로 연결 */
  const heroSlugOf = (name: string, where: string): string | null => {
    const exact = slugByKo.get(name) ?? slugByKo.get(name.replace(/\(.*\)$/, "").trim());
    if (!exact) fail(`${where}: 영웅 이름 "${name}"을(를) 찾을 수 없음`);
    return exact ?? null;
  };

  // ── 통계 ID: 데드풀만 역할별 ──
  const ROLE_FROM_LABEL: Record<string, Role> = { 뱅가드: "vanguard", 듀얼리스트: "duelist", 전략가: "strategist" };
  const statIdOf = (label: string, where: string): { id: string; heroSlug: string; variantRole: Role | null } | null => {
    const m = label.match(/^(.+)\((뱅가드|듀얼리스트|전략가)\)$/);
    if (m) {
      const heroSlug = heroSlugOf(m[1].trim(), where);
      if (!heroSlug) return null;
      const variantRole = ROLE_FROM_LABEL[m[2]];
      return { id: `${heroSlug}-${variantRole}`, heroSlug, variantRole };
    }
    const heroSlug = heroSlugOf(label, where);
    return heroSlug ? { id: heroSlug, heroSlug, variantRole: null } : null;
  };

  // ── 티어 ──
  const tierRows = sheetRows(wb, "티어 목록");
  const stats = new Map<string, HeroStat>();
  for (const r of dataRows(tierRows)) {
    const label = str(r[2]);
    const ref = statIdOf(label, "티어 목록");
    if (!ref) continue;
    const tier = str(r[0]) as Tier;
    if (!TIERS.has(tier)) fail(`티어 목록: ${label} 티어 값 "${tier}" 오류`);
    const winRate = num(r[3]);
    if (winRate === null) fail(`티어 목록: ${label} 승률 없음`);
    if (stats.has(ref.id)) fail(`티어 목록: ${label} 중복`);
    stats.set(ref.id, {
      ...ref,
      label,
      tier,
      rank: num(r[1]) ?? 0,
      winRate: winRate ?? 0,
      playstyles: parsePlaystyles(str(r[4]), `티어 목록 ${label}`),
      pdr: { p: 0, d: 0, r: 0 },
      pdrNote: "",
      counters: [],
      strongAgainst: [],
    });
  }

  const statOf = (label: string, where: string): HeroStat | null => {
    const ref = statIdOf(label, where);
    if (!ref) return null;
    const s = stats.get(ref.id);
    if (!s) fail(`${where}: "${label}"이(가) 티어 목록에 없음`);
    return s ?? null;
  };

  // ── 조합 성향(PDR) ──
  const pdrRows = sheetRows(wb, "조합 성향(PDR)");
  const pdrSeen = new Set<string>();
  for (const r of dataRows(pdrRows)) {
    const label = str(r[0]);
    const s = statOf(label, "조합 성향");
    if (!s) continue;
    const [p, d, rr] = [num(r[2]), num(r[3]), num(r[4])];
    if ([p, d, rr].some((v) => v === null || v < 0 || v > 1)) fail(`조합 성향: ${label} 점수 범위 오류`);
    s.pdr = { p: p ?? 0, d: d ?? 0, r: rr ?? 0 };
    s.pdrNote = str(r[5]);
    const pdrMain = parsePlaystyles(str(r[1]), `조합 성향 ${label}`).join("/");
    if (pdrMain !== s.playstyles.join("/"))
      warn(`주 성향 불일치: ${label} — 티어 목록 ${s.playstyles.join("/")} / 조합 성향 시트 ${pdrMain}`);
    pdrSeen.add(s.id);
  }

  // ── 카운터 ──
  const counterRows = sheetRows(wb, "카운터");
  const counterSeen = new Set<string>();
  const COUNTER_RE = /^(.+?) \(([+-]?\d+(?:\.\d+)?)(?:, (.+))?\)$/;
  for (const r of dataRows(counterRows)) {
    const label = str(r[0]);
    const s = statOf(label, "카운터");
    if (!s) continue;
    if (str(r[1]) !== s.tier) warn(`카운터 시트 티어 불일치: ${label} (${str(r[1])} vs ${s.tier})`);
    for (const cell of r.slice(2, 7)) {
      const text = str(cell);
      if (!text) continue;
      const m = text.match(COUNTER_RE);
      if (!m) {
        fail(`카운터: ${label} "${text}" 형식 오류`);
        continue;
      }
      const target = statOf(m[1], `카운터(${label})`);
      if (!target) continue;
      const type = m[3] ? COUNTER_TYPE[m[3]] : null;
      if (type === undefined) fail(`카운터: 알 수 없는 유형 "${m[3]}"`);
      s.counters.push({ statId: target.id, score: Number(m[2]), type: type ?? null });
    }
    s.strongAgainst = str(r[7])
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => statOf(n, `역카운터(${label})`)?.id)
      .filter((id): id is string => Boolean(id));
    counterSeen.add(s.id);
  }

  for (const s of stats.values()) {
    if (!pdrSeen.has(s.id)) fail(`조합 성향 시트에 ${s.label} 없음`);
    if (!counterSeen.has(s.id)) fail(`카운터 시트에 ${s.label} 없음`);
    if (s.counters.length !== 5) warn(`${s.label}: 카운터 ${s.counters.length}명 (5명 예상)`);
    if (s.strongAgainst.length !== 3) warn(`${s.label}: 강한 상대 ${s.strongAgainst.length}명 (3명 예상)`);
    heroes.find((h) => h.slug === s.heroSlug)?.statIds.push(s.id);
  }
  const ROLE_ORDER: Role[] = ["vanguard", "duelist", "strategist"];
  for (const h of heroes) {
    if (h.statIds.length === 0) fail(`${h.nameKo}: 통계 데이터 없음`);
    // 데드풀: 역할 순서(뱅가드·듀얼리스트·전략가)로 정렬
    const roleRank = (id: string) => ROLE_ORDER.indexOf(stats.get(id)?.variantRole ?? "vanguard");
    h.statIds.sort((a, b) => roleRank(a) - roleRank(b));
  }

  // ── 스킬 상세 ──
  const skillRows = sheetRows(wb, "스킬 상세");
  const skills: Skill[] = [];
  const skillIndex = new Map<string, number>();
  for (const r of dataRows(skillRows)) {
    const heroName = str(r[0]);
    const heroSlug = heroSlugOf(heroName, "스킬 상세");
    if (!heroSlug) continue;
    const typeText = str(r[3]);
    const type = SKILL_TYPE[typeText];
    if (!type) fail(`스킬 상세: 알 수 없는 유형 "${typeText}" (${heroName})`);
    const partnerName = strOrNull(r[6]);
    const n = (skillIndex.get(heroSlug) ?? 0) + 1;
    skillIndex.set(heroSlug, n);
    skills.push({
      id: `${heroSlug}-${String(n).padStart(2, "0")}`,
      heroSlug,
      form: strOrNull(r[2]),
      type,
      name: str(r[4]),
      nameEn: str(r[11]),
      key: str(r[5]),
      partnerSlug: partnerName ? heroSlugOf(partnerName, `스킬 상세 협공 파트너(${heroName})`) : null,
      cooldown: strOrNull(r[7]),
      ultimateCost: num(r[8]),
      details: parseDetails(r[9]),
      description: str(r[10]),
    });
  }

  for (const h of heroes) {
    const n = skillIndex.get(h.slug) ?? 0;
    if (n !== h.skillCount) fail(`${h.nameKo}: 스킬 수 불일치 (영웅 요약 ${h.skillCount} / 스킬 상세 ${n})`);
    // 폼 목록은 스킬 상세의 폼 값에서 등장 순서대로 (영웅 요약의 "A / B" 표기는 데드풀처럼 "역할 / 무기"가 섞여 모호함)
    const forms = [...new Set(skills.filter((s) => s.heroSlug === h.slug && s.form).map((s) => s.form as string))];
    if (forms.length > 0) h.forms = forms;
  }

  // ── 협공 스킬 ──
  const teamupRows = sheetRows(wb, "협공 스킬");
  const teamups: TeamUp[] = [];
  for (const [i, r] of dataRows(teamupRows).entries()) {
    const heroName = str(r[0]);
    const heroSlug = heroSlugOf(heroName, "협공 스킬");
    const partnerSlug = heroSlugOf(str(r[2]), `협공 스킬 파트너(${heroName})`);
    if (!heroSlug || !partnerSlug) continue;
    teamups.push({
      id: `teamup-${String(i + 1).padStart(3, "0")}`,
      heroSlug,
      name: str(r[1]),
      partnerSlug,
      key: str(r[3]),
      cooldown: strOrNull(r[4]),
      details: parseDetails(r[5]),
      effect: str(r[6]),
    });
  }

  // ── 맵 ──
  const mapRows = sheetRows(wb, "맵");
  const maps: GameMap[] = [];
  for (const r of dataRows(mapRows)) {
    if (num(r[2]) === null) break; // 아래쪽 "모드 설명" 표 시작
    const mode = MAP_MODE[str(r[1])];
    const nameEn = str(r[4]);
    if (!mode) fail(`맵: 알 수 없는 모드 "${str(r[1])}"`);
    const top5 = str(r[9])
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((part) => {
        const m = part.match(/^(.+) (\d+(?:\.\d+)?)%$/);
        if (!m) {
          fail(`맵 ${nameEn}: 승률 형식 오류 "${part}"`);
          return null;
        }
        const s = statOf(m[1], `맵 ${nameEn}`);
        return s ? { statId: s.id, winRate: Number(m[2]) } : null;
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
    if (top5.length !== 5) warn(`맵 ${nameEn}: 승률 TOP${top5.length}`);
    maps.push({
      id: slugFromWikiUrl(`/wiki/${nameEn.replace(/ /g, "_")}`).slug,
      mode,
      order: num(r[2]) ?? 0,
      nameKo: str(r[3]),
      nameEn,
      regionKo: strOrNull(r[5]),
      regionEn: strOrNull(r[6]),
      releaseDate: str(r[7]),
      releaseLabel: str(r[8]),
      top5,
      image: null,
    });
  }

  // ── 맵 이미지: image/Maps/{id}.(png|jpg|webp) → public/images/maps/{id}.webp (1280px) ──
  mkdirSync(MAP_IMAGE_OUT, { recursive: true });
  const mapFiles = existsSync(MAP_IMAGE_SRC) ? readdirSync(MAP_IMAGE_SRC) : [];
  for (const m of maps) {
    const file = mapFiles.find((f) => new RegExp(`^${m.id}\\.(png|jpe?g|webp)$`, "i").test(f));
    if (!file) continue;
    const src = path.join(MAP_IMAGE_SRC, file);
    const out = path.join(MAP_IMAGE_OUT, `${m.id}.webp`);
    // 원본이 바뀌었을 때만 다시 변환
    if (!existsSync(out) || statSync(out).mtimeMs < statSync(src).mtimeMs) {
      await sharp(src).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    }
    const { width = 0, height = 0 } = await sharp(out).metadata();
    m.image = { src: `/images/maps/${m.id}.webp`, width, height };
  }
  const mapImageCount = maps.filter((m) => m.image).length;
  if (mapImageCount < maps.length)
    warn(`맵 이미지 ${mapImageCount}/${maps.length}장 — 없는 맵은 디자인 카드로 표시 (image/Maps/다운로드_목록.md 참고)`);

  const modeStart = mapRows.findIndex((r) => str(r[0]) === "모드 설명");
  const mapModes: MapModeInfo[] = [];
  for (const r of mapRows.slice(modeStart + 1)) {
    if (!str(r[0])) break;
    const m = str(r[1]).match(/^(\w+) \((.+)\)$/);
    const mode = m ? MAP_MODE[m[1]] : undefined;
    if (!m || !mode) {
      fail(`맵 모드 설명 형식 오류: ${str(r[1])}`);
      continue;
    }
    mapModes.push({ mode, nameKo: str(r[0]), nameEn: `${m[1]} (${m[2]})`, description: str(r[2]) });
  }

  // ── 출처·각주 ──
  const sources = dataRows(sheetRows(wb, "출처")).map((r) => ({
    category: str(r[0]),
    url: str(r[1]),
    usage: str(r[2]),
  }));

  const meta: DataMeta = {
    collectedAt: "2026-10-15",
    statsUpdatedAt: "2026-10-15",
    season: "시즌 10",
    notes: {
      heroes: footnotes(summaryRows),
      tier: footnotes(tierRows),
      counters: footnotes(counterRows),
      pdr: footnotes(pdrRows),
      maps: footnotes(mapRows),
      skills: footnotes(skillRows),
    },
    sources,
  };

  // ───────────── 교차 검증: 위키 JSON ─────────────
  const wikiHeroes = new Map(Object.entries(wiki.heroes).map(([name, v]) => [slugFromWikiUrl(`/wiki/${name}`).slug, v]));
  const wikiSkillCount = new Map<string, number>();
  for (const s of wiki.skills) {
    const slug = slugFromWikiUrl(`/wiki/${s.hero}`).slug;
    wikiSkillCount.set(slug, (wikiSkillCount.get(slug) ?? 0) + 1);
  }
  for (const h of heroes) {
    const w = wikiHeroes.get(h.slug);
    const wikiSkills = wikiSkillCount.get(h.slug) ?? 0;
    if (wikiSkills !== h.skillCount) warn(`${h.nameKo}: 스킬 수 엑셀 ${h.skillCount} / 위키 JSON ${wikiSkills}`);
    if (!w) {
      // 위키 JSON 의 heroes 는 일부 영웅만 담고 있음 — 스킬로만 존재 확인
      if (wikiSkills === 0) warn(`${h.nameKo}: 위키 JSON 에 없음`);
      continue;
    }
    const wikiRoles = w.role.split(" / ").map((r) => parseRole(ROLE_ENGLISH[r.trim()] ?? r));
    if (wikiRoles.join("/") !== h.roles.join("/"))
      warn(`${h.nameKo}: 역할 불일치 (엑셀 ${h.roles.join("/")} / 위키 ${w.role})`);
    if (h.difficulty !== null && Number(w.difficulty) !== h.difficulty)
      warn(`${h.nameKo}: 난이도 불일치 (엑셀 ${h.difficulty} / 위키 ${w.difficulty})`);
  }

  // ───────────── 기본 검증 ─────────────
  const expect = (label: string, actual: number, expected: number) => {
    if (actual !== expected) fail(`${label}: ${actual}개 (예상 ${expected}개)`);
  };
  expect("영웅", heroes.length, EXPECTED.heroes);
  expect("통계 항목", stats.size, EXPECTED.stats);
  expect("스킬", skills.length, EXPECTED.skills);
  expect("맵", maps.length, EXPECTED.maps);
  expect("맵 모드 설명", mapModes.length, 3);

  const slugs = new Set<string>();
  for (const h of heroes) {
    if (slugs.has(h.slug)) fail(`slug 중복: ${h.slug}`);
    slugs.add(h.slug);
    if (!existsSync(path.join(IMAGE_DIR, `${h.slug}.png`))) fail(`이미지 없음: public/images/heroes/${h.slug}.png`);
  }
  for (const m of maps) if (maps.filter((x) => x.id === m.id).length > 1) fail(`맵 id 중복: ${m.id}`);

  // ───────────── 결과 ─────────────
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`  ✖ ${e}`);
    console.error(`\n데이터 검증 실패: 오류 ${errors.length}건 — JSON을 쓰지 않고 종료합니다.`);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const write = (file: string, data: unknown) =>
    writeFileSync(path.join(OUT_DIR, file), JSON.stringify(data, null, 2) + "\n", "utf8");
  write("heroes.json", heroes);
  write("stats.json", [...stats.values()].sort((a, b) => a.rank - b.rank));
  write("skills.json", skills);
  write("teamups.json", teamups);
  write("maps.json", maps);
  write("map-modes.json", mapModes);
  write("meta.json", meta);

  console.log(
    `✔ 데이터 생성 완료 — 영웅 ${heroes.length} · 통계 ${stats.size} · 스킬 ${skills.length} · 협공 ${teamups.length} · 맵 ${maps.length} (경고 ${warnings.length}건)`,
  );
}

const ROLE_ENGLISH: Record<string, string> = { Vanguard: "뱅가드", Duelist: "듀얼리스트", Strategist: "전략가" };

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
