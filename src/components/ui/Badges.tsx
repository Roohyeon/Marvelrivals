import { ArrowDownToLine, Crosshair, Info, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { PLAYSTYLE_LABEL, ROLE_LABEL } from "@/lib/labels";
import type { Playstyle, Role, Tier } from "@/lib/types";
import { RoleIcon } from "./RoleIcon";

// 색만으로 의미를 전하지 않음: 역할은 아이콘+글자, 티어는 글자, 성향은 아이콘+글자를 항상 함께 표시

const ROLE_CLASS: Record<Role, string> = {
  vanguard: "bg-vanguard-soft text-vanguard",
  duelist: "bg-duelist-soft text-duelist",
  strategist: "bg-strategist-soft text-strategist",
};

export const ROLE_TEXT_CLASS: Record<Role, string> = {
  vanguard: "text-vanguard",
  duelist: "text-duelist",
  strategist: "text-strategist",
};

export function RoleBadge({ role, compact = false }: { role: Role; compact?: boolean }) {
  return (
    <span
      className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-caption font-semibold ${ROLE_CLASS[role]}`}
    >
      <RoleIcon role={role} className="size-3.5" />
      {compact ? <span className="sr-only">{ROLE_LABEL[role]}</span> : ROLE_LABEL[role]}
    </span>
  );
}

const TIER_CLASS: Record<Tier, string> = {
  S: "bg-tier-s",
  A: "bg-tier-a",
  B: "bg-tier-b",
  C: "bg-tier-c",
  D: "bg-tier-d",
  F: "bg-tier-f",
};

const TIER_SIZE = {
  sm: "size-5 text-tiny",
  md: "size-7 text-label",
  lg: "size-12 text-h2",
} as const;

export function TierBadge({ tier, size = "md" }: { tier: Tier; size?: keyof typeof TIER_SIZE }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-sm font-extrabold text-on-brand ${TIER_CLASS[tier]} ${TIER_SIZE[size]}`}
      aria-label={`${tier} 티어`}
      role="img"
    >
      {tier}
    </span>
  );
}

const PLAYSTYLE_CLASS: Record<Playstyle, string> = {
  P: "bg-poke-soft text-poke",
  D: "bg-dive-soft text-dive",
  R: "bg-rush-soft text-rush",
};

const PLAYSTYLE_ICON = { P: Crosshair, D: ArrowDownToLine, R: Shield } as const;

export function PlaystyleBadge({ playstyle, showLabel = true }: { playstyle: Playstyle; showLabel?: boolean }) {
  const Icon = PLAYSTYLE_ICON[playstyle];
  return (
    <span
      className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-caption font-semibold ${PLAYSTYLE_CLASS[playstyle]}`}
    >
      <Icon className="size-3.5" aria-hidden />
      {playstyle}
      {showLabel ? ` ${PLAYSTYLE_LABEL[playstyle]}` : <span className="sr-only">{PLAYSTYLE_LABEL[playstyle]}</span>}
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center rounded-full bg-elevated px-2.5 text-caption font-medium text-secondary">
      {children}
    </span>
  );
}

/** 커뮤니티 통계 옆에 항상 붙이는 출처 문구 (text-muted 는 출처·범례에만 사용) */
export function SourceNote({ children = "커뮤니티 통계 · counterwatch.gg · 2026-10-15 기준" }: { children?: ReactNode }) {
  return (
    <p className="flex items-center gap-1 text-caption text-muted">
      <Info className="size-3.5 shrink-0" aria-hidden />
      {children}
    </p>
  );
}
