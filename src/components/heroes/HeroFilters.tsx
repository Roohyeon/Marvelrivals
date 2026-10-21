"use client";

import { ChevronDown, LayoutGrid, Search, SlidersHorizontal, Star, X } from "lucide-react";
import type { ReactNode } from "react";
import { RoleIcon } from "@/components/ui/RoleIcon";
import { DIFFICULTIES, SORT_LABEL, toggle, type HeroFilters, type SortKey } from "@/lib/hero-filters";
import { PLAYSTYLE_LABEL, PLAYSTYLES, ROLE_LABEL, ROLES, TIERS } from "@/lib/labels";
import type { Role, Tier } from "@/lib/types";

type Change = (next: Partial<HeroFilters>) => void;

// ───────── 검색 ─────────

export function HeroSearch({
  value,
  onChange,
  autoFocus,
  className = "",
}: {
  value: string;
  onChange: (q: string) => void;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <label className={`relative flex items-center ${className}`}>
      <span className="sr-only">영웅 이름 검색</span>
      <Search className="pointer-events-none absolute left-3.5 size-4 text-secondary" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        placeholder="영웅 이름 (한글/영문)"
        className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-10 text-table text-primary placeholder:text-secondary focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="검색어 지우기"
          className="absolute right-1 inline-flex size-9 items-center justify-center rounded-full text-secondary hover:text-primary"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </label>
  );
}

// ───────── 모바일: 아이콘 역할 필터 바 + [필터] 버튼 ─────────

export function RoleFilterBar({
  role,
  onRole,
  activeCount,
  onOpenFilters,
  favOnly,
  onFav,
}: {
  role: Role | null;
  onRole: (role: Role | null) => void;
  favOnly: boolean;
  onFav: () => void;
  activeCount: number;
  onOpenFilters: () => void;
}) {
  // 활성 칸: 파란 배경 + 흰 아이콘. 라벨은 칸 아래에 둠 (파란 배경 위 작은 흰 글자는 다크에서 대비 3.6:1로 부족)
  const item = "flex flex-col items-center gap-1 rounded-md";
  const icon = (active: boolean) =>
    `relative flex h-11 w-full items-center justify-center rounded-md transition-colors ${
      active ? "bg-accent text-white" : "text-secondary group-hover:text-primary"
    }`;
  const label = (active: boolean) => `text-tiny ${active ? "font-bold text-accent-text" : "font-medium text-secondary"}`;

  return (
    <div className="grid grid-cols-6 gap-1 rounded-md bg-surface p-1 pb-1.5" role="group" aria-label="역할 필터">
      <button type="button" aria-pressed={role === null && !favOnly} onClick={() => onRole(null)} className={`group ${item}`}>
        <span className={icon(role === null && !favOnly)}>
          <LayoutGrid className="size-5" aria-hidden />
        </span>
        <span className={label(role === null && !favOnly)}>전체</span>
      </button>
      {ROLES.map((r) => (
        <button key={r} type="button" aria-pressed={role === r} onClick={() => onRole(r)} className={`group ${item}`}>
          <span className={icon(role === r)}>
            <RoleIcon role={r} className="size-5" />
          </span>
          <span className={label(role === r)}>{r === "duelist" ? "듀얼" : ROLE_LABEL[r]}</span>
        </button>
      ))}
      <button type="button" aria-pressed={favOnly} onClick={onFav} className={`group ${item}`}>
        <span className={icon(favOnly)}>
          <Star className={`size-5 ${favOnly ? "fill-current" : ""}`} aria-hidden />
        </span>
        <span className={label(favOnly)}>즐겨찾기</span>
      </button>
      <button
        type="button"
        onClick={onOpenFilters}
        aria-haspopup="dialog"
        aria-label={`추가 필터${activeCount ? ` (${activeCount}개 적용됨)` : ""}`}
        className={`group ${item}`}
      >
        <span className={icon(false)}>
          <SlidersHorizontal className="size-5" aria-hidden />
          {activeCount > 0 && (
            <span className="absolute right-2 top-1 inline-flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <span className={label(activeCount > 0)}>필터</span>
      </button>
    </div>
  );
}

// ───────── 칩 그룹 (데스크톱 툴바 · 모바일 필터 시트 공통) ─────────

const TIER_ACTIVE: Record<Tier, string> = {
  S: "bg-tier-s",
  A: "bg-tier-a",
  B: "bg-tier-b",
  C: "bg-tier-c",
  D: "bg-tier-d",
  F: "bg-tier-f",
};

function ChipButton({
  pressed,
  onClick,
  children,
  activeClass = "border-accent bg-accent/10 text-accent-text font-bold",
  label,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  activeClass?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-label transition-colors xl:h-9 xl:min-w-9 ${
        pressed ? activeClass : "border-line bg-surface font-medium text-secondary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={title} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-caption font-bold text-secondary">{title}</span>
      {children}
    </div>
  );
}

export function FilterGroups({ filters, onChange }: { filters: HeroFilters; onChange: Change }) {
  return (
    <>
      <Group title="티어">
        {TIERS.map((t) => (
          <ChipButton
            key={t}
            pressed={filters.tiers.includes(t)}
            onClick={() => onChange({ tiers: toggle(filters.tiers, t, TIERS) })}
            activeClass={`${TIER_ACTIVE[t]} border-transparent text-on-brand font-extrabold`}
            label={`${t} 티어`}
          >
            {t}
          </ChipButton>
        ))}
      </Group>
      <Group title="성향">
        {PLAYSTYLES.map((p) => (
          <ChipButton
            key={p}
            pressed={filters.styles.includes(p)}
            onClick={() => onChange({ styles: toggle(filters.styles, p, PLAYSTYLES) })}
          >
            {p} {PLAYSTYLE_LABEL[p]}
          </ChipButton>
        ))}
      </Group>
      <Group title="난이도">
        {DIFFICULTIES.map((d) => (
          <ChipButton
            key={d}
            pressed={filters.difficulties.includes(d)}
            onClick={() => onChange({ difficulties: toggle(filters.difficulties, d, DIFFICULTIES) })}
            label={`난이도 ${d}`}
          >
            {d}
          </ChipButton>
        ))}
      </Group>
    </>
  );
}

// ───────── 선택 상자 (정렬 · 데스크톱 역할) ─────────

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-11 appearance-none rounded-full border border-line bg-surface/80 pl-4 pr-9 text-label font-semibold text-primary focus:border-accent focus:outline-none xl:h-10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-secondary" aria-hidden />
    </label>
  );
}

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (sort: SortKey) => void }) {
  return (
    <Select
      label="정렬"
      value={value}
      onChange={onChange}
      options={(Object.keys(SORT_LABEL) as SortKey[]).map((k) => ({ value: k, label: SORT_LABEL[k] }))}
    />
  );
}

export function RoleSelect({ value, onChange }: { value: Role | null; onChange: (role: Role | null) => void }) {
  return (
    <Select
      label="역할"
      value={value ?? "all"}
      onChange={(v) => onChange(v === "all" ? null : (v as Role))}
      options={[{ value: "all", label: "전체 포지션" }, ...ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))]}
    />
  );
}
