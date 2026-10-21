import Link from "next/link";
import { Chip } from "@/components/ui/Badges";
import { HeroAvatar } from "@/components/ui/HeroAvatar";
import type { TeamUpWithPartner } from "@/lib/hero-detail";

function TeamUpCard({ t, mode }: { t: TeamUpWithPartner; mode: "own" | "joined" }) {
  return (
    <li className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <Link href={`/heroes/${t.other.slug}`} className="shrink-0" aria-label={`${t.other.nameKo} 상세 보기`}>
          <HeroAvatar slug={t.other.slug} size={40} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-table font-bold">{t.name}</p>
          <p className="text-caption text-secondary">
            {mode === "own" ? "파트너 " : "발동 영웅 "}
            <Link href={`/heroes/${t.other.slug}`} className="font-semibold text-accent-text hover:underline">
              {t.other.nameKo}
            </Link>
          </p>
        </div>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <Chip>{t.key}</Chip>
          {t.cooldown && <span className="tabular text-caption text-secondary">쿨타임 {t.cooldown}</span>}
        </span>
      </div>
      <p className="mt-3 text-table">{t.effect.replace(/^기본 효과 - /, "")}</p>
      {t.details.length > 0 && (
        <p className="mt-2 text-caption text-secondary">
          {t.details.map((d) => (d.label ? `${d.label} ${d.value}` : d.value)).join(" · ")}
        </p>
      )}
    </li>
  );
}

/** 협공 스킬: 이 영웅이 발동하는 것 + 다른 영웅의 협공에 파트너로 참여하는 것 */
export function TeamUpList({ own, joined }: { own: TeamUpWithPartner[]; joined: TeamUpWithPartner[] }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-label font-bold text-secondary">이 영웅의 협공 {own.length}</h3>
        {own.length ? (
          <ul className="grid gap-2 xl:grid-cols-2">
            {own.map((t) => (
              <TeamUpCard key={t.id} t={t} mode="own" />
            ))}
          </ul>
        ) : (
          <p className="text-table text-secondary">직접 발동하는 협공 스킬이 없어요.</p>
        )}
      </section>
      {joined.length > 0 && (
        <section>
          <h3 className="mb-2 text-label font-bold text-secondary">파트너로 참여하는 협공 {joined.length}</h3>
          <ul className="grid gap-2 xl:grid-cols-2">
            {joined.map((t) => (
              <TeamUpCard key={t.id} t={t} mode="joined" />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
