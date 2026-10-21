"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Check, Link2, RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { teamDataQuery } from "@/lib/queries";
import { activeTeamUps, addToTeam, averagePdr, parseTeamParam, styleSummary, TEAM_SIZE } from "@/lib/team-analysis";
import type { TeamEntry } from "@/lib/team-types";
import { useTeamStore, type Side } from "@/stores/team-store";
import { PickerGrid } from "./PickerGrid";
import { TeamAnalysis } from "./TeamAnalysis";
import { TeamSlots } from "./TeamSlots";

export function TeamBuilder() {
  return (
    <>
      {/* 주소(?team=)를 읽는 부분만 Suspense — 화면 본체는 정적 HTML로 미리 그려짐 */}
      <Suspense fallback={null}>
        <UrlTeamLoader />
      </Suspense>
      <TeamBuilderView />
    </>
  );
}

/** 공유 링크(?team=…&enemy=…)가 있으면 그 팀을, 없으면 기기에 저장된 팀을 불러옴 */
function UrlTeamLoader() {
  const params = useSearchParams();
  const { data } = useQuery(teamDataQuery);
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !data) return;
    done.current = true;
    const valid = new Set(data.entries.map((e) => e.statId));
    const ally = parseTeamParam(params.get("team"), valid);
    const enemy = parseTeamParam(params.get("enemy"), valid);
    if (ally || enemy) useTeamStore.setState({ ally: ally ?? [], enemy: enemy ?? [] });
    else void useTeamStore.persist.rehydrate();
  }, [data, params]);

  return null;
}

function TeamBuilderView() {
  const { data } = useQuery(teamDataQuery);
  const { ally: allyIds, enemy: enemyIds, side, setTeam, setSide, reset } = useTeamStore();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const byId = useMemo(() => new Map((data?.entries ?? []).map((e) => [e.statId, e])), [data]);
  const toEntries = (ids: string[]) => ids.map((id) => byId.get(id)).filter((e): e is TeamEntry => Boolean(e));
  const ally = toEntries(allyIds);
  const enemy = toEntries(enemyIds);

  const currentIds = side === "ally" ? allyIds : enemyIds;
  const otherIds = side === "ally" ? enemyIds : allyIds;

  // 꽉 찼을 때: 같은 영웅의 다른 역할(데드풀) 교체만 허용
  const blocked = useMemo(() => {
    if (currentIds.length < TEAM_SIZE || !data) return new Set<string>();
    const slugs = new Set(currentIds.map((id) => byId.get(id)?.slug));
    return new Set(data.entries.filter((e) => !currentIds.includes(e.statId) && !slugs.has(e.slug)).map((e) => e.statId));
  }, [currentIds, data, byId]);

  const toggle = (statId: string) => {
    const next = currentIds.includes(statId) ? currentIds.filter((id) => id !== statId) : addToTeam(currentIds, statId, byId);
    setTeam(side, next);
  };

  const remove = (s: Side) => (statId: string) => setTeam(s, (s === "ally" ? allyIds : enemyIds).filter((id) => id !== statId));

  const share = async () => {
    // 통계 ID는 영문 소문자·하이픈뿐이라 쉼표를 %2C 로 바꾸지 않고 그대로 써서 읽기 쉬운 주소로
    const query = [
      allyIds.length ? `team=${allyIds.join(",")}` : "",
      enemyIds.length ? `enemy=${enemyIds.join(",")}` : "",
    ]
      .filter(Boolean)
      .join("&");
    const url = `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("이 링크를 복사하세요", url);
    }
    window.history.replaceState(null, "", url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allyPdr = averagePdr(ally);
  const summaryLine = allyPdr
    ? `${styleSummary(allyPdr).sentence.replace(/ 조합이에요$/, "")} · 협공 ${data ? activeTeamUps(ally, data).length : 0}개`
    : "우리 팀을 골라 보세요";

  const sideToggle = (
    <div role="tablist" aria-label="고를 팀" className="grid grid-cols-2 gap-1 rounded-full bg-elevated p-1">
      {(["ally", "enemy"] as Side[]).map((s) => (
        <button
          key={s}
          type="button"
          role="tab"
          aria-selected={side === s}
          onClick={() => setSide(s)}
          className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-label transition-colors ${
            side === s ? "bg-surface font-bold text-primary shadow-panel" : "font-medium text-secondary"
          }`}
        >
          <span aria-hidden className={`size-2 rounded-full ${s === "ally" ? "bg-chart-ally" : "bg-chart-enemy"}`} />
          {s === "ally" ? "우리 팀" : "상대 팀"}
          <span className="tabular text-caption text-secondary">{(s === "ally" ? allyIds : enemyIds).length}</span>
        </button>
      ))}
    </div>
  );

  const actions = (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={share}
        disabled={!allyIds.length && !enemyIds.length}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-label font-semibold disabled:opacity-40"
      >
        {copied ? <Check className="size-4 text-positive" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        <span aria-live="polite">{copied ? "복사했어요" : "링크 복사"}</span>
      </button>
      <button
        type="button"
        onClick={reset}
        disabled={!allyIds.length && !enemyIds.length}
        aria-label="팀 초기화"
        className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface disabled:opacity-40"
      >
        <RotateCcw className="size-4" aria-hidden />
      </button>
    </div>
  );

  const slots = (both: boolean) => (
    <div className="space-y-3">
      {(both || side === "ally") && (
        <TeamSlots title="우리 팀" tone="ally" team={ally} active={side === "ally"} onRemove={remove("ally")} onActivate={() => setSide("ally")} />
      )}
      {(both || side === "enemy") && (
        <TeamSlots title="상대 팀" tone="enemy" team={enemy} active={side === "enemy"} onRemove={remove("enemy")} onActivate={() => setSide("enemy")} />
      )}
    </div>
  );

  return (
    <Container className="py-6 xl:py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-title font-bold xl:text-h1">팀 빌더</h1>
          <p className="text-caption text-secondary">영웅을 눌러 팀에 넣고, 슬롯을 눌러 빼세요</p>
        </div>
        {actions}
      </div>

      {/* 모바일·태블릿: 슬롯 + 팀 성향 한 줄 요약을 위에 고정 */}
      <div className="sticky top-14 z-30 -mx-4 mt-4 space-y-2 border-b border-line bg-base/95 px-4 pb-3 pt-2 backdrop-blur-md md:-mx-6 md:px-6 xl:hidden">
        {sideToggle}
        {slots(false)}
        <p className="text-caption font-semibold text-secondary">{summaryLine}</p>
      </div>

      <div className="mt-4 xl:mt-6 xl:grid xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start xl:gap-8">
        <section aria-label="영웅 선택">
          <div className="mb-3 hidden xl:block xl:w-72">{sideToggle}</div>
          {data && (
            <PickerGrid
              entries={data.entries}
              picked={new Set(currentIds)}
              otherPicked={new Set(otherIds)}
              blocked={blocked}
              onToggle={toggle}
            />
          )}
        </section>

        {/* 데스크톱: 오른쪽 팀 슬롯 + 분석 패널 */}
        <aside aria-label="팀 분석" className="sticky top-[72px] hidden max-h-[calc(100dvh-88px)] space-y-4 overflow-y-auto pb-2 xl:block">
          <div className="rounded-panel border border-line bg-surface p-4 shadow-panel">{slots(true)}</div>
          {data && <TeamAnalysis ally={ally} enemy={enemy} data={data} />}
        </aside>
      </div>

      {/* 모바일·태블릿: [분석 보기] → 하단 시트 */}
      <button
        type="button"
        onClick={() => setAnalysisOpen(true)}
        aria-haspopup="dialog"
        className="fixed bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom)+12px)] right-4 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-5 text-table font-bold text-on-brand shadow-panel xl:hidden"
      >
        <BarChart3 className="size-4" aria-hidden />
        분석 보기
      </button>
      <BottomSheet open={analysisOpen && !isDesktop} onClose={() => setAnalysisOpen(false)} label="팀 분석">
        <h2 className="mb-3 text-title font-bold">팀 분석</h2>
        <div className="mb-3 rounded-panel border border-line p-3">{slots(true)}</div>
        {data && <TeamAnalysis ally={ally} enemy={enemy} data={data} />}
      </BottomSheet>
    </Container>
  );
}
