"use client";

import { Info } from "lucide-react";
import { useId, useMemo, useState, type ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import type { HeroDetail } from "@/lib/hero-detail";
import { ROLE_LABEL } from "@/lib/labels";
import type { SkillType } from "@/lib/types";
import { CounterSection } from "./CounterSection";
import { PdrSection } from "./PdrSection";
import { SkillList } from "./SkillList";
import { TeamUpList } from "./TeamUpList";

type MobileTab = "skills" | "counters" | "teamups" | "pdr";
const MOBILE_TABS: { id: MobileTab; label: string }[] = [
  { id: "skills", label: "스킬" },
  { id: "counters", label: "상성" },
  { id: "teamups", label: "협공" },
  { id: "pdr", label: "성향" },
];

type SkillTab = "attack" | "ability" | "ultimate" | "passive" | "teamup";
const SKILL_TABS: { id: SkillTab; label: string; types: SkillType[]; desktopOnly?: boolean }[] = [
  { id: "attack", label: "일반 공격", types: ["attack"] },
  { id: "ability", label: "스킬", types: ["ability", "shop"] },
  { id: "ultimate", label: "궁극기", types: ["ultimate"] },
  { id: "passive", label: "패시브", types: ["passive"] },
  // 모바일에서는 상단 탭 "협공"으로 따로 보여줌
  { id: "teamup", label: "협공", types: [], desktopOnly: true },
];

/** 알약 모양 탭 묶음 (가로 스크롤) — 활성 탭은 밝은 면 + 진한 글자 */
function PillTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  idPrefix,
}: {
  tabs: { id: T; label: ReactNode; className?: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  idPrefix: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 overflow-x-auto rounded-full bg-elevated p-1 [scrollbar-width:none]"
      onKeyDown={(e) => {
        // 좌우 화살표로 탭 이동
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const ids = tabs.map((t) => t.id);
        const next = ids[(ids.indexOf(value) + (e.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length];
        onChange(next);
        document.getElementById(`${idPrefix}-${next}`)?.focus();
      }}
    >
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            id={`${idPrefix}-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={`inline-flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-4 text-label transition-colors ${
              active ? "bg-surface font-bold text-primary shadow-panel" : "font-medium text-secondary hover:text-primary"
            } ${t.className ?? ""}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 hidden text-h2 font-bold xl:block">{children}</h2>;
}

export function HeroDetailBody({ detail }: { detail: HeroDetail }) {
  const { hero, stats, skills, teamups } = detail;
  const uid = useId();

  const [mobileTab, setMobileTab] = useState<MobileTab>("skills");
  const [skillTab, setSkillTab] = useState<SkillTab>("attack");
  const [form, setForm] = useState<string | null>(null);
  const [statIndex, setStatIndex] = useState(0);
  const stat = stats[statIndex];

  const hasForms = hero.forms.length > 1;
  const visibleSkills = useMemo(() => {
    const types = SKILL_TABS.find((t) => t.id === skillTab)?.types ?? [];
    return skills.filter((s) => types.includes(s.type) && (!form || !s.form || s.form === form));
  }, [skills, skillTab, form]);

  const countByTab = (tab: (typeof SKILL_TABS)[number]) =>
    tab.id === "teamup"
      ? teamups.own.length
      : skills.filter((s) => tab.types.includes(s.type) && (!form || !s.form || s.form === form)).length;

  // 모바일: 선택한 상단 탭의 구역만 / 데스크톱: 모든 구역
  const show = (tab: MobileTab) => (mobileTab === tab ? "" : "hidden xl:block");

  // 데드풀: 역할별 통계 선택
  const statPicker = stats.length > 1 && (
    <div className="mb-3">
      <PillTabs
        label="통계 역할"
        idPrefix={`${uid}-stat`}
        value={String(statIndex)}
        onChange={(i) => setStatIndex(Number(i))}
        tabs={stats.map((s, i) => ({ id: String(i), label: `${ROLE_LABEL[s.variantRole!]} 통계` }))}
      />
    </div>
  );

  return (
    <Container className="pb-8">
      {/* 모바일·태블릿: 상단 고정 탭 */}
      <div className="sticky top-14 z-30 -mx-4 bg-base/90 px-4 py-2 backdrop-blur-md md:-mx-6 md:px-6 xl:hidden">
        <PillTabs label="상세 정보" idPrefix={`${uid}-m`} value={mobileTab} onChange={setMobileTab} tabs={MOBILE_TABS} />
      </div>

      <div className="mt-4 space-y-8 xl:mt-10 xl:space-y-12">
        {/* 스킬 */}
        <section aria-labelledby={`${uid}-skills`} className={show("skills")}>
          <h2 id={`${uid}-skills`} className="sr-only xl:not-sr-only xl:mb-3 xl:text-h2 xl:font-bold">
            스킬
          </h2>
          <PillTabs
            label="스킬 유형"
            idPrefix={`${uid}-s`}
            value={skillTab}
            onChange={setSkillTab}
            tabs={SKILL_TABS.map((t) => ({
              id: t.id,
              className: t.desktopOnly ? "hidden xl:inline-flex" : "",
              label: (
                <>
                  {t.label}
                  <span className="tabular text-caption text-secondary">{countByTab(t)}</span>
                </>
              ),
            }))}
          />

          {hasForms && skillTab !== "teamup" && (
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="폼/모드">
              {[null, ...hero.forms].map((f) => (
                <button
                  key={f ?? "all"}
                  type="button"
                  aria-pressed={form === f}
                  onClick={() => setForm(f)}
                  className={`inline-flex h-9 shrink-0 items-center rounded-full border px-3 text-caption transition-colors ${
                    form === f ? "border-accent bg-accent/10 font-bold text-accent-text" : "border-line bg-surface text-secondary"
                  }`}
                >
                  {f ?? "모든 폼"}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3">
            {skillTab === "teamup" ? (
              <TeamUpList own={teamups.own} joined={teamups.joined} />
            ) : (
              <SkillList skills={visibleSkills} showForm={hasForms && !form} />
            )}
          </div>
          <p className="mt-3 flex items-start gap-1 text-caption text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            스킬 이름·설명은 위키 영어 원문을 옮긴 비공식 번역이에요. 원문 스킬명을 함께 적었습니다.
          </p>
        </section>

        {/* 협공 — 모바일 전용 구역 (데스크톱은 스킬 탭 안에서 보여줌) */}
        <section aria-label="협공" className={mobileTab === "teamups" ? "xl:hidden" : "hidden"}>
          <TeamUpList own={teamups.own} joined={teamups.joined} />
        </section>

        <div className="xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:gap-8">
          {/* 상성 */}
          <section aria-labelledby={`${uid}-counters`} className={show("counters")}>
            <SectionTitle>
              <span id={`${uid}-counters`}>상성</span>
            </SectionTitle>
            {statPicker}
            <CounterSection stat={stat} heroName={hero.nameKo} />
          </section>

          {/* 조합 성향 */}
          <section aria-label="조합 성향" className={`${show("pdr")} xl:mt-0`}>
            <SectionTitle>성향</SectionTitle>
            <div className="xl:hidden">{statPicker}</div>
            {/* 데스크톱에서는 상성 구역의 역할 선택을 함께 따르므로, 그 높이만큼 비워 카드 윗선을 맞춤 */}
            {stats.length > 1 && <div className="hidden h-[52px] xl:block" aria-hidden />}
            <PdrSection stat={stat} />
          </section>
        </div>
      </div>
    </Container>
  );
}
