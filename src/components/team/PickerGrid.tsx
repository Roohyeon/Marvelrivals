import { Check } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { HeroSearch } from "@/components/heroes/HeroFilters";
import { TierBadge } from "@/components/ui/Badges";
import { RoleIcon } from "@/components/ui/RoleIcon";
import { matchesSearch } from "@/lib/hero-filters";
import { ROLE_LABEL, ROLES } from "@/lib/labels";
import type { TeamEntry } from "@/lib/team-types";
import type { Role } from "@/lib/types";

const ROLE_GRADIENT: Record<Role, string> = {
  vanguard: "to-vanguard-soft",
  duelist: "to-duelist-soft",
  strategist: "to-strategist-soft",
};

/** 영웅 선택 그리드 — 이미 고른 영웅은 흐리게 + ✓ 배지, 다시 누르면 빼기 */
export function PickerGrid({
  entries,
  picked,
  otherPicked,
  blocked,
  onToggle,
}: {
  entries: TeamEntry[];
  /** 지금 고르는 팀에 들어간 통계 ID */
  picked: Set<string>;
  /** 반대편 팀에 들어간 통계 ID (표시만) */
  otherPicked: Set<string>;
  /** 팀이 꽉 차서 더 넣을 수 없는 통계 ID */
  blocked: Set<string>;
  onToggle: (statId: string) => void;
}) {
  const [role, setRole] = useState<Role | null>(null);
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      entries.filter(
        (e) => (!role || e.role === role) && matchesSearch({ nameKo: e.label, nameEn: e.nameEn, slug: e.slug }, q),
      ),
    [entries, role, q],
  );

  return (
    <div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <HeroSearch value={q} onChange={setQ} className="md:w-64" />
        <div role="group" aria-label="역할" className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {[null, ...ROLES].map((r) => (
            <button
              key={r ?? "all"}
              type="button"
              aria-pressed={role === r}
              onClick={() => setRole(r)}
              className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-label xl:h-9 ${
                role === r ? "border-accent bg-accent/10 font-bold text-accent" : "border-line bg-surface text-secondary"
              }`}
            >
              {r && <RoleIcon role={r} className="size-3.5" />}
              {r ? ROLE_LABEL[r] : "전체"}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-3 grid grid-cols-4 gap-x-2 gap-y-3 md:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8">
        {list.map((e) => {
          const selected = picked.has(e.statId);
          const disabled = blocked.has(e.statId);
          return (
            <li key={e.statId}>
              <button
                type="button"
                onClick={() => onToggle(e.statId)}
                disabled={disabled}
                aria-pressed={selected}
                aria-label={`${e.label}${selected ? " (선택됨, 누르면 빼기)" : ""}`}
                className="group block w-full text-left disabled:cursor-not-allowed"
              >
                <span
                  className={`relative block aspect-square overflow-hidden rounded-sm bg-linear-to-b from-portrait-from ${ROLE_GRADIENT[e.role]} transition-[scale] duration-100 group-active:scale-[0.97] group-disabled:opacity-40`}
                >
                  <Image
                    src={`/images/heroes/${e.slug}.png`}
                    alt=""
                    fill
                    sizes="(min-width: 1536px) 9vw, (min-width: 768px) 14vw, 25vw"
                    className={`object-cover object-[50%_12%] ${selected ? "opacity-40 grayscale" : ""}`}
                  />
                  <span className="absolute bottom-1 right-1">
                    <TierBadge tier={e.tier} size="sm" />
                  </span>
                  {selected && (
                    <span className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded-full bg-accent text-white">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                  )}
                  {otherPicked.has(e.statId) && !selected && (
                    <span className="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 text-[10px] font-bold text-white">상대</span>
                  )}
                </span>
                <span className="mt-1 block truncate text-center text-tiny font-medium">{e.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {list.length === 0 && <p className="py-10 text-center text-table text-secondary">조건에 맞는 영웅이 없어요</p>}
    </div>
  );
}
