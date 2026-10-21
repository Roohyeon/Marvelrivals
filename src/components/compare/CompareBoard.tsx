"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Trophy, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PDR_KEYS } from "@/components/charts/PdrBars";
import { HeroSearch } from "@/components/heroes/HeroFilters";
import { RoleBadge, SourceNote, TierBadge } from "@/components/ui/Badges";
import { DifficultyStars } from "@/components/ui/DifficultyStars";
import { HeroAvatar } from "@/components/ui/HeroAvatar";
import { WinRateText } from "@/components/ui/WinRateBar";
import { matchesSearch } from "@/lib/hero-filters";
import { PLAYSTYLE_LABEL } from "@/lib/labels";
import { compareDataQuery } from "@/lib/queries";
import type { CompareHero } from "@/lib/team-types";
import { COMPARE_MAX, useCollectionStore } from "@/stores/collection-store";

export function CompareBoard() {
  return (
    <>
      <Suspense fallback={null}>
        <UrlCompareLoader />
      </Suspense>
      <CompareView />
    </>
  );
}

/** ?heroes=iron-man,storm 가 있으면 그 목록을 쓰고, 이후 바뀌면 주소도 함께 바꿈 (링크 공유) */
function UrlCompareLoader() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useQuery(compareDataQuery);
  const compare = useCollectionStore((s) => s.compare);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !data) return;
    loaded.current = true;
    const fromUrl = params.get("heroes");
    if (fromUrl !== null) {
      const valid = new Set(data.map((h) => h.slug));
      useCollectionStore.getState().setCompare(fromUrl.split(",").filter((s) => valid.has(s)));
    }
  }, [data, params]);

  useEffect(() => {
    if (!loaded.current) return;
    const next = compare.length ? `${pathname}?heroes=${compare.join(",")}` : pathname;
    router.replace(next, { scroll: false });
  }, [compare, pathname, router]);

  return null;
}

function Row({ label, children, cols }: { label: string; children: ReactNode[]; cols: number }) {
  return (
    <tr className="border-b border-line align-top last:border-0">
      <th scope="row" className="sticky left-0 z-10 w-24 bg-surface px-3 py-3 text-left text-caption font-medium text-secondary md:w-32">
        {label}
      </th>
      {children}
      {Array.from({ length: COMPARE_MAX - cols }, (_, i) => (
        <td key={`empty-${i}`} className="px-3 py-3" />
      ))}
    </tr>
  );
}

/** 폼별 값("200 (브루스 배너) / 400+300 …")은 한 줄에 하나씩 */
function Lines({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" / ").map((t) => (
        <span key={t} className="block">
          {t}
        </span>
      ))}
    </span>
  );
}

/** 여러 명 중 가장 좋은 값에 붙이는 표시 (색 + 아이콘 + 글자) */
function Best() {
  return (
    <span className="ml-1 inline-flex items-center gap-0.5 text-tiny font-bold text-positive">
      <Trophy className="size-3" aria-hidden />
      최고
    </span>
  );
}

function CompareView() {
  const { data } = useQuery(compareDataQuery);
  const compare = useCollectionStore((s) => s.compare);
  const toggle = useCollectionStore((s) => s.toggleCompare);
  const [q, setQ] = useState("");

  const bySlug = useMemo(() => new Map((data ?? []).map((h) => [h.slug, h])), [data]);
  const list = compare.map((s) => bySlug.get(s)).filter((h): h is CompareHero => Boolean(h));
  const candidates = (data ?? []).filter((h) => !compare.includes(h.slug) && q.trim() && matchesSearch(h, q)).slice(0, 8);

  const maxHealth = Math.max(...list.map((h) => h.healthTotal));
  const costs = list.map((h) => h.ultimateCost).filter((c): c is number => c !== null);
  const minCost = costs.length > 1 ? Math.min(...costs) : null;
  const cell = "px-3 py-3 min-w-[150px]";

  return (
    <div>
      {/* 영웅 추가 */}
      <div className="relative max-w-md">
        <HeroSearch value={q} onChange={setQ} />
        {candidates.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-line bg-surface shadow-panel">
            {candidates.map((h) => (
              <li key={h.slug}>
                <button
                  type="button"
                  onClick={() => {
                    toggle(h.slug);
                    setQ("");
                  }}
                  className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left hover:bg-elevated"
                >
                  <HeroAvatar slug={h.slug} size={28} />
                  <span className="flex-1 text-table font-semibold">{h.nameKo}</span>
                  <span className="text-caption text-secondary">{h.nameEn}</span>
                  <Plus className="size-4 text-accent-text" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-2 text-caption text-secondary">
        최대 {COMPARE_MAX}명까지 비교할 수 있어요. 가득 찬 상태에서 추가하면 가장 먼저 넣은 영웅이 빠져요.
      </p>

      {list.length === 0 ? (
        <div className="mt-6 rounded-panel border border-dashed border-line p-10 text-center">
          <p className="text-title font-bold">비교할 영웅을 넣어 보세요</p>
          <p className="mt-1 text-table text-secondary">위 검색창이나 영웅 상세의 [비교에 추가] 버튼으로 넣을 수 있어요.</p>
          <Link href="/heroes" className="mt-4 inline-flex h-11 items-center rounded-full bg-brand px-5 text-table font-bold text-on-brand">
            영웅 목록 보기
          </Link>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-panel border border-line bg-surface shadow-panel">
          <table className="w-full min-w-[560px] text-table">
            <thead>
              <tr className="border-b border-line">
                <td className="sticky left-0 z-10 bg-surface" />
                {list.map((h) => (
                  <th key={h.slug} scope="col" className={`${cell} text-left align-top`}>
                    <div className="flex items-start gap-2">
                      <Link href={`/heroes/${h.slug}`} className="flex min-w-0 flex-1 flex-col gap-1.5 hover:opacity-80">
                        <HeroAvatar slug={h.slug} size={56} />
                        <span className="text-title font-bold">{h.nameKo}</span>
                        <span className="text-caption font-normal text-secondary">{h.nameEn}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggle(h.slug)}
                        aria-label={`${h.nameKo} 비교에서 빼기`}
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line hover:bg-elevated"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </div>
                  </th>
                ))}
                {Array.from({ length: COMPARE_MAX - list.length }, (_, i) => (
                  <th key={`empty-${i}`} scope="col" className={`${cell} text-left align-middle`}>
                    <span className="inline-flex h-14 items-center gap-1 text-caption font-normal text-muted">
                      <Plus className="size-4" aria-hidden /> 영웅 추가
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="역할" cols={list.length}>
                {list.map((h) => (
                  <td key={h.slug} className={cell}>
                    <span className="flex flex-wrap gap-1">
                      {h.roles.map((r) => (
                        <RoleBadge key={r} role={r} />
                      ))}
                    </span>
                  </td>
                ))}
              </Row>
              <Row label="티어 · 승률" cols={list.length}>
                {list.map((h) => (
                  <td key={h.slug} className={cell}>
                    <ul className="space-y-1">
                      {h.stats.map((s) => (
                        <li key={s.id} className="flex items-center gap-1.5">
                          <TierBadge tier={s.tier} size="sm" />
                          {h.stats.length > 1 && <span className="text-caption text-secondary">{s.label.replace(h.nameKo, "")}</span>}
                          <WinRateText rate={s.winRate} />
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </Row>
              <Row label="체력" cols={list.length}>
                {list.map((h) => (
                  <td key={h.slug} className={`${cell} tabular`}>
                    <Lines text={h.healthText} className="font-semibold" />
                    {list.length > 1 && h.healthTotal === maxHealth && <Best />}
                  </td>
                ))}
              </Row>
              <Row label="난이도" cols={list.length}>
                {list.map((h) => (
                  <td key={h.slug} className={cell}>
                    <DifficultyStars value={h.difficulty} />
                  </td>
                ))}
              </Row>
              <Row label="궁극기" cols={list.length}>
                {list.map((h) => (
                  <td key={h.slug} className={cell}>
                    <p className="line-clamp-2 font-semibold">{h.ultimateName}</p>
                    <div className="tabular text-caption text-secondary">
                      {h.ultimateCost !== null ? `비용 ${h.ultimateCost.toLocaleString("ko-KR")}` : <Lines text={h.ultimateCostText} />}
                      {minCost !== null && h.ultimateCost === minCost && <Best />}
                    </div>
                  </td>
                ))}
              </Row>
              <Row label="이동 속도" cols={list.length}>
                {list.map((h) => (
                  <td key={h.slug} className={`${cell} tabular`}>
                    {h.moveSpeed}m/s{!h.moveSpeedVerified && <span className="text-caption text-secondary"> (일반값)</span>}
                  </td>
                ))}
              </Row>
              <Row label="조합 성향" cols={list.length}>
                {list.map((h) => {
                  const pdr = h.stats[0].pdr;
                  return (
                    <td key={h.slug} className={cell}>
                      <ul className="space-y-1.5">
                        {PDR_KEYS.map(({ key, style, fill }) => (
                          <li key={key} className="grid grid-cols-[52px_1fr_36px] items-center gap-2 text-caption">
                            <span className="font-semibold">
                              {style} <span className="font-normal text-secondary">{PLAYSTYLE_LABEL[style]}</span>
                            </span>
                            <span className="h-1.5 rounded-full bg-track">
                              <span className={`block h-full rounded-full ${fill}`} style={{ width: `${pdr[key] * 100}%` }} />
                            </span>
                            <span className="tabular text-right font-bold">{Math.round(pdr[key] * 100)}%</span>
                          </li>
                        ))}
                      </ul>
                      {h.stats.length > 1 && <p className="mt-1 text-tiny text-secondary">{h.stats[0].label} 기준</p>}
                    </td>
                  );
                })}
              </Row>
              <Row label="주요 쿨타임" cols={list.length}>
                {list.map((h) => (
                  <td key={h.slug} className={cell}>
                    {h.cooldowns.length ? (
                      <ul className="space-y-1 text-caption">
                        {h.cooldowns.map((c) => (
                          <li key={`${c.name}-${c.form}`} className="flex items-baseline justify-between gap-2">
                            <span className="min-w-0 truncate">
                              {c.name} <span className="text-secondary">{c.key}</span>
                            </span>
                            <span className="tabular shrink-0 font-bold">{c.cooldown}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-caption text-secondary">쿨타임 스킬 없음 (충전식 등)</span>
                    )}
                  </td>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3">
        <SourceNote>체력·스킬: 위키 기준 · 티어·성향: 커뮤니티 통계(counterwatch.gg) · 2026-10-15</SourceNote>
      </div>
    </div>
  );
}
