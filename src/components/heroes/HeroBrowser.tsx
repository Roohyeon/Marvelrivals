"use client";

import { useQuery } from "@tanstack/react-query";
import { RotateCcw, Star } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import {
  applyFilters,
  countActiveFilters,
  DEFAULT_FILTERS,
  filtersToSearch,
  hasAnyFilter,
  parseFilters,
  type HeroFilters,
} from "@/lib/hero-filters";
import { heroListQuery } from "@/lib/queries";
import { useCollectionStore } from "@/stores/collection-store";
import { HeroCard, HeroCardSkeleton } from "./HeroCard";
import { FilterGroups, HeroSearch, RoleFilterBar, RoleSelect, SortSelect } from "./HeroFilters";
import { HeroPreview } from "./HeroPreview";

/**
 * useSearchParams 를 쓰는 부분은 Suspense 로 감쌉니다 (Next.js 16 Cache Components).
 * fallback 으로 "필터 없는 전체 목록"을 그려서, 미리 만들어지는 HTML에도 영웅 54명이 모두 들어갑니다(SEO).
 */
export function HeroBrowserWithParams() {
  return (
    <Suspense fallback={<HeroBrowserView filters={DEFAULT_FILTERS} onChange={() => {}} />}>
      <HeroBrowserFromUrl />
    </Suspense>
  );
}

function HeroBrowserFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const onChange = (next: Partial<HeroFilters>) => {
    const merged = { ...filters, ...next };
    router.replace(`${pathname}${filtersToSearch(merged, searchParams)}`, { scroll: false });
  };

  return (
    <HeroBrowserView
      filters={filters}
      onChange={onChange}
      autoFocusSearch={searchParams.get("focus") === "search"}
    />
  );
}

interface ViewProps {
  filters: HeroFilters;
  onChange: (next: Partial<HeroFilters>) => void;
  autoFocusSearch?: boolean;
}

function HeroBrowserView({ filters, onChange, autoFocusSearch }: ViewProps) {
  const { data, isPending, isError, refetch } = useQuery(heroListQuery);
  const favorites = useCollectionStore((s) => s.favorites);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  // 검색어는 입력 즉시 목록에 반영하고, 주소(URL)에는 잠깐 멈췄을 때만 반영
  const [query, setQuery] = useState(filters.q);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    if (query.trim() === filters.q) return;
    const t = setTimeout(() => onChangeRef.current({ q: query }), 250);
    return () => clearTimeout(t);
  }, [query, filters.q]);

  const effective = useMemo(() => ({ ...filters, q: query }), [filters, query]);
  const rows = useMemo(() => (data ? applyFilters(data, effective, favorites) : []), [data, effective, favorites]);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const previewHeadingId = useId();

  // 데스크톱 패널: 고른 영웅이 필터에서 빠지면 목록 첫 영웅
  const selected = data?.find((h) => h.slug === selectedSlug);
  const panelHero = (selected && rows.some((r) => r.hero.slug === selected.slug) ? selected : rows[0]?.hero) ?? null;

  const onSelect = (slug: string) => {
    setSelectedSlug(slug);
    if (!isDesktop) setPreviewOpen(true);
  };

  const reset = () => {
    setQuery("");
    onChange({ ...DEFAULT_FILTERS });
  };

  const activeCount = countActiveFilters(filters);
  const total = data?.length ?? 54;

  return (
    <div className="relative xl:overflow-hidden xl:bg-hero">
      {/* 데스크톱 히어로 섹션의 남색 사선 띠 (CSS로 새로 그린 장식) */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 hidden h-[520px] w-[46%] bg-hero-accent opacity-[var(--hero-accent-opacity)] [clip-path:polygon(28%_0,100%_0,100%_100%,0_55%)] xl:block"
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-8 pt-4 md:px-6 xl:px-8 xl:pt-8">
        {/* ── 데스크톱 툴바 ── */}
        <div className="hidden xl:block">
          <div className="flex items-end gap-4">
            <h1 className="text-h1 font-extrabold">
              영웅 <span className="tabular text-secondary">{total}</span>
            </h1>
            <HeroSearch value={query} onChange={setQuery} autoFocus={autoFocusSearch} className="ml-auto w-72" />
            <button
              type="button"
              aria-pressed={filters.favOnly}
              onClick={() => onChange({ favOnly: !filters.favOnly })}
              className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-label font-semibold ${
                filters.favOnly ? "border-meta bg-meta/10 text-meta" : "border-line bg-surface/80 text-primary"
              }`}
            >
              <Star className={`size-4 ${filters.favOnly ? "fill-current" : ""}`} aria-hidden />
              즐겨찾기 <span className="tabular">{favorites.length}</span>
            </button>
            <RoleSelect value={filters.role} onChange={(role) => onChange({ role })} />
            <SortSelect value={filters.sort} onChange={(sort) => onChange({ sort })} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <FilterGroups filters={filters} onChange={onChange} />
            {hasAnyFilter(effective) && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-label font-semibold text-accent-text hover:bg-surface/60"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                초기화
              </button>
            )}
          </div>
        </div>

        {/* ── 모바일·태블릿: 제목·검색 → 역할 바(상단 고정) → 결과 수·정렬 ── */}
        <div className="xl:hidden">
          <h1 className="text-title font-bold">영웅</h1>
          <HeroSearch value={query} onChange={setQuery} autoFocus={autoFocusSearch} className="mt-3" />
        </div>
        <div className="sticky top-14 z-30 -mx-4 bg-base/90 px-4 py-2 backdrop-blur-md md:-mx-6 md:px-6 xl:hidden">
          <RoleFilterBar
            role={filters.role}
            onRole={(role) => onChange({ role, favOnly: false })}
            favOnly={filters.favOnly}
            onFav={() => onChange({ favOnly: !filters.favOnly, role: null })}
            activeCount={activeCount}
            onOpenFilters={() => setFilterOpen(true)}
          />
        </div>

        <div className="mt-2 flex items-center justify-between xl:mt-6">
          <p className="text-caption text-secondary" aria-live="polite">
            결과 <span className="tabular font-bold text-primary">{rows.length}</span>명
          </p>
          <div className="xl:hidden">
            <SortSelect value={filters.sort} onChange={(sort) => onChange({ sort })} />
          </div>
        </div>

        <div className="mt-3 xl:flex xl:items-start xl:gap-8">
          <section aria-label="영웅 목록" className="min-w-0 flex-1">
            {isError ? (
              <StateMessage title="데이터를 불러오지 못했어요" action="다시 시도" onAction={() => refetch()} />
            ) : isPending ? (
              <ul className={GRID}>
                {Array.from({ length: 12 }, (_, i) => (
                  <HeroCardSkeleton key={i} />
                ))}
              </ul>
            ) : rows.length === 0 ? (
              <StateMessage
                title={filters.favOnly && !favorites.length ? "즐겨찾기한 영웅이 없어요" : "조건에 맞는 영웅이 없어요"}
                action="필터 초기화"
                onAction={reset}
              />
            ) : (
              <ul className={GRID}>
                {rows.map(({ hero, stat }, i) => (
                  <HeroCard
                    key={hero.slug}
                    hero={hero}
                    stat={stat}
                    index={i}
                    selected={isDesktop && panelHero?.slug === hero.slug}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* ── 데스크톱: 오른쪽 고정 미리보기 패널 360px ── */}
          <aside
            aria-label="영웅 미리보기"
            aria-live="polite"
            className="sticky top-[72px] hidden w-[360px] shrink-0 rounded-panel border border-line bg-surface p-6 shadow-panel xl:block"
          >
            {panelHero ? (
              <div key={panelHero.slug} className="panel-swap">
                <HeroPreview hero={panelHero} />
              </div>
            ) : (
              <p className="py-10 text-center text-table text-secondary">영웅을 선택하세요</p>
            )}
          </aside>
        </div>
      </div>

      {/* ── 모바일·태블릿: 미리보기 하단 시트 ── */}
      <BottomSheet open={previewOpen && !isDesktop} onClose={() => setPreviewOpen(false)} label="영웅 미리보기">
        {selected && <HeroPreview hero={selected} headingId={previewHeadingId} onNavigate={() => setPreviewOpen(false)} />}
      </BottomSheet>

      {/* ── 모바일·태블릿: 추가 필터 하단 시트 ── */}
      <BottomSheet
        open={filterOpen && !isDesktop}
        onClose={() => setFilterOpen(false)}
        label="추가 필터"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ tiers: [], styles: [], difficulties: [] })}
              className="h-12 rounded-full border border-line px-5 text-table font-semibold"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="h-12 flex-1 rounded-full bg-brand text-table font-bold text-on-brand"
            >
              결과 {rows.length}명 보기
            </button>
          </div>
        }
      >
        <h2 className="mb-4 text-title font-bold">추가 필터</h2>
        <div className="flex flex-col gap-5">
          <FilterGroups filters={filters} onChange={onChange} />
        </div>
      </BottomSheet>
    </div>
  );
}

// 모바일 4열 · 태블릿 6열 · 데스크톱 5열(+패널) · 와이드 7열
const GRID =
  "grid grid-cols-4 gap-x-2 gap-y-3 md:grid-cols-6 md:gap-3 xl:grid-cols-5 xl:gap-x-5 xl:gap-y-6 xl:px-2 xl:pt-2 2xl:grid-cols-7";

function StateMessage({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-panel border border-line bg-surface py-16 text-center">
      <p className="text-title font-bold">{title}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-full border border-line px-5 text-table font-semibold hover:bg-elevated"
      >
        <RotateCcw className="size-4" aria-hidden />
        {action}
      </button>
    </div>
  );
}
