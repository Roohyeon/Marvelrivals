import { Plus, X } from "lucide-react";
import Image from "next/image";
import { RoleIcon } from "@/components/ui/RoleIcon";
import { TEAM_SIZE } from "@/lib/team-analysis";
import type { TeamEntry } from "@/lib/team-types";

/**
 * 팀 슬롯 6칸 — 누르면 빼기
 * - 모바일: 정사각 48px 한 줄 / 데스크톱: 게임 픽 화면처럼 기울어진 미니 카드
 */
export function TeamSlots({
  title,
  team,
  active,
  tone,
  onRemove,
  onActivate,
}: {
  title: string;
  team: TeamEntry[];
  active: boolean;
  tone: "ally" | "enemy";
  onRemove: (statId: string) => void;
  onActivate: () => void;
}) {
  const ring = tone === "ally" ? "border-chart-ally" : "border-chart-enemy";
  return (
    <section aria-label={title}>
      <button
        type="button"
        onClick={onActivate}
        aria-pressed={active}
        className="mb-1.5 flex w-full items-center gap-2 text-left text-caption font-bold"
      >
        <span aria-hidden className={`size-2.5 rounded-full ${tone === "ally" ? "bg-chart-ally" : "bg-chart-enemy"}`} />
        <span className={active ? "text-primary" : "text-secondary"}>{title}</span>
        <span className="tabular text-secondary">
          {team.length}/{TEAM_SIZE}
        </span>
        {active && <span className="ml-auto rounded-full bg-elevated px-2 py-0.5 text-tiny font-semibold text-secondary">선택 중</span>}
      </button>
      <ol className="grid grid-cols-6 gap-1.5 xl:gap-2">
        {Array.from({ length: TEAM_SIZE }, (_, i) => {
          const e = team[i];
          return (
            <li key={e?.statId ?? `empty-${i}`}>
              {e ? (
                <button
                  type="button"
                  onClick={() => onRemove(e.statId)}
                  aria-label={`${e.label} 빼기`}
                  className={`group relative block aspect-square w-full overflow-hidden rounded-sm border-2 bg-linear-to-b from-portrait-from to-portrait-to xl:aspect-[3/4] xl:-skew-x-6 xl:rounded-none ${ring}`}
                >
                  <span className="absolute inset-0 xl:skew-x-6 xl:scale-110">
                    <Image src={`/images/heroes/${e.slug}.png`} alt="" fill sizes="80px" className="object-cover object-[50%_12%]" />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 hidden items-center gap-1 bg-card-label px-1.5 py-1 text-white xl:flex">
                    <RoleIcon role={e.role} className="size-2.5 shrink-0 skew-x-6" />
                    {/* 글자에도 띠와 같은 배경 — 기울인(transform) 부모 너머의 배경은 자동 대비 검사기가 못 읽음 */}
                    <span className="skew-x-6 truncate bg-card-label text-tiny font-bold">{e.label}</span>
                  </span>
                  <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-white group-hover:flex group-focus-visible:flex">
                    <X className="size-5" aria-hidden />
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onActivate}
                  aria-label={`${title} 빈 칸 ${i + 1}`}
                  className={`flex aspect-square w-full items-center justify-center rounded-sm border-2 border-dashed text-muted xl:aspect-[3/4] xl:-skew-x-6 xl:rounded-none ${
                    active ? "border-accent/60" : "border-line"
                  }`}
                >
                  <Plus className="size-4 xl:skew-x-6" aria-hidden />
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
