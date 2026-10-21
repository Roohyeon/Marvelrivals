import Link from "next/link";
import { TierBadge } from "@/components/ui/Badges";
import { HeroAvatar } from "@/components/ui/HeroAvatar";
import { RoleIcon } from "@/components/ui/RoleIcon";
import { WinRateBar, WinRateText } from "@/components/ui/WinRateBar";
import { ROLE_LABEL } from "@/lib/labels";
import type { StatRowData } from "@/lib/meta";

/**
 * 표의 한 행을 2단으로 (모바일 문서 5-3)
 * 1단: 아바타 · 이름 · 티어 · 핵심 수치 / 2단: 50% 기준 양방향 승률 막대
 * rate 를 주면 그 값을 표시 (맵별 승률 등), 없으면 전체 승률
 */
export function StatRow({ row, rate, rank }: { row: StatRowData; rate?: number; rank?: number }) {
  const value = rate ?? row.winRate;
  return (
    <li className="border-b border-line last:border-0">
      <Link href={`/heroes/${row.slug}`} className="flex min-h-14 items-center gap-3 px-1 py-2.5 hover:bg-base">
        {rank !== undefined && <span className="tabular w-5 shrink-0 text-center text-caption font-bold text-secondary">{rank}</span>}
        <HeroAvatar slug={row.slug} size={36} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-table font-bold">{row.label}</span>
            <TierBadge tier={row.tier} size="sm" />
            <span className="ml-auto shrink-0">
              <WinRateText rate={value} className="text-table" />
            </span>
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-caption text-secondary">
            <RoleIcon role={row.role} className="size-3" />
            {ROLE_LABEL[row.role]}
            <span aria-hidden>·</span>
            {row.playstyles.join("/")}
          </span>
          <WinRateBar rate={value} className="mt-1.5" />
        </span>
      </Link>
    </li>
  );
}

/** 데스크톱 티어 표용: 아바타 + 이름 + 승률 칩 */
export function StatChip({ row }: { row: StatRowData }) {
  return (
    <li>
      <Link
        href={`/heroes/${row.slug}`}
        className="flex w-[168px] items-center gap-2.5 rounded-md border border-line bg-surface p-2 hover:bg-elevated"
      >
        <HeroAvatar slug={row.slug} size={36} />
        <span className="min-w-0">
          <span className="block truncate text-label font-bold">{row.label}</span>
          {/* 성향이 2개(P/D)인 영웅도 칩 폭을 넘지 않도록 배지 대신 짧은 글자 */}
          <span className="flex items-center gap-1.5 text-caption">
            <WinRateText rate={row.winRate} />
            <span className="text-secondary">{row.playstyles.join("/")}</span>
          </span>
        </span>
      </Link>
    </li>
  );
}
