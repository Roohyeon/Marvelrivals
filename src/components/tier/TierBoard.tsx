"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { TierBadge } from "@/components/ui/Badges";
import { RoleIcon } from "@/components/ui/RoleIcon";
import { StatChip, StatRow } from "@/components/ui/StatRow";
import { ROLE_LABEL, ROLES, TIERS } from "@/lib/labels";
import type { StatRowData } from "@/lib/meta";
import type { Role, Tier } from "@/lib/types";

interface Props {
  rows: StatRowData[];
  rules: Partial<Record<Tier, string>>;
}

/** ?role= 를 읽는 부분은 Suspense 로 감싸고, fallback 으로 "전체" 표를 그려 정적 HTML에도 모두 담음 */
export function TierBoard(props: Props) {
  return (
    <Suspense fallback={<TierBoardView {...props} role={null} onRole={() => {}} />}>
      <TierBoardFromUrl {...props} />
    </Suspense>
  );
}

function TierBoardFromUrl(props: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("role") as Role | null;
  const role = raw && ROLES.includes(raw) ? raw : null;
  return (
    <TierBoardView
      {...props}
      role={role}
      onRole={(r) => router.replace(r ? `${pathname}?role=${r}` : pathname, { scroll: false })}
    />
  );
}

function TierBoardView({ rows, rules, role, onRole }: Props & { role: Role | null; onRole: (r: Role | null) => void }) {
  const visible = role ? rows.filter((r) => r.role === role) : rows;
  const tabs: { id: Role | null; label: string }[] = [{ id: null, label: "전체" }, ...ROLES.map((r) => ({ id: r, label: ROLE_LABEL[r] }))];

  return (
    <>
      <div role="tablist" aria-label="역할" className="flex gap-1 overflow-x-auto rounded-full bg-elevated p-1 [scrollbar-width:none] xl:inline-flex">
        {tabs.map((t) => {
          const active = t.id === role;
          return (
            <button
              key={t.id ?? "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onRole(t.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-label transition-colors ${
                active ? "bg-surface font-bold text-primary shadow-panel" : "font-medium text-secondary hover:text-primary"
              }`}
            >
              {t.id && <RoleIcon role={t.id} className="size-3.5" />}
              {t.label}
              <span className="tabular text-caption text-secondary">
                {t.id ? rows.filter((r) => r.role === t.id).length : rows.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 overflow-hidden rounded-panel border border-line bg-surface shadow-panel">
        {TIERS.map((tier) => {
          const list = visible.filter((r) => r.tier === tier);
          return (
            <section key={tier} aria-label={`${tier} 티어`} className="border-b border-line last:border-0 xl:flex">
              {/* 모바일: 그룹 헤더 / 데스크톱: 왼쪽 큰 배지 칸 */}
              <header className="flex h-11 items-center gap-2 bg-elevated px-4 xl:h-auto xl:w-40 xl:shrink-0 xl:flex-col xl:items-center xl:justify-center xl:gap-1 xl:py-5">
                <span className="xl:hidden">
                  <TierBadge tier={tier} size="md" />
                </span>
                <span className="hidden xl:block">
                  <TierBadge tier={tier} size="lg" />
                </span>
                <span className="text-table font-bold xl:text-caption xl:font-semibold xl:text-secondary">
                  <span className="xl:hidden">{tier} 티어 · </span>
                  {list.length}명
                </span>
                {rules[tier] && <span className="ml-auto text-caption text-secondary xl:ml-0">{rules[tier]}</span>}
              </header>
              {list.length === 0 ? (
                <p className="px-4 py-4 text-table text-secondary xl:flex xl:items-center">해당 영웅 없음</p>
              ) : (
                <>
                  <ol className="px-3 xl:hidden">
                    {list.map((row) => (
                      <StatRow key={row.statId} row={row} rank={row.rank} />
                    ))}
                  </ol>
                  <ul className="hidden flex-1 flex-wrap gap-2 p-4 xl:flex">
                    {list.map((row) => (
                      <StatChip key={row.statId} row={row} />
                    ))}
                  </ul>
                </>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
