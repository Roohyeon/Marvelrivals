import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Chip, PlaystyleBadge, RoleBadge, SourceNote, TierBadge } from "@/components/ui/Badges";
import { DifficultyStars } from "@/components/ui/DifficultyStars";
import { WinRateBar, WinRateText } from "@/components/ui/WinRateBar";
import { ROLE_LABEL } from "@/lib/labels";
import type { HeroListItem } from "@/lib/types";

/** "밴 해머 / 대시험 / 밴 해머 - 강화 / …" → 강화판 중복을 빼고, 3개를 넘으면 "밴 해머 외 5개" */
function ultimateLabel(text: string) {
  const names = [...new Set(text.split(" / ").map((n) => n.replace(/ - 강화$/, "").trim()))];
  return names.length > 3 ? `${names[0]} 외 ${names.length - 1}개` : names.join(" / ");
}

/** 미리보기 — 데스크톱 오른쪽 패널과 모바일 하단 시트가 같은 내용을 씀 */
export function HeroPreview({ hero, headingId }: { hero: HeroListItem; headingId?: string }) {
  const multi = hero.stats.length > 1;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative size-28 overflow-hidden rounded-full bg-linear-to-b from-portrait-from to-portrait-to xl:size-32">
        <Image
          src={`/images/heroes/${hero.slug}.png`}
          alt={`${hero.nameKo} 전신 이미지`}
          fill
          sizes="128px"
          className="object-cover object-[50%_10%]"
        />
      </div>

      <h2 id={headingId} className="mt-3 text-title-lg font-extrabold">
        {hero.nameKo}
      </h2>
      <p className="text-caption text-secondary">
        {hero.nameEn} · {hero.roles.map((r) => ROLE_LABEL[r]).join(" / ")}
      </p>

      <p className="mt-4 line-clamp-3 text-table text-secondary">
        <span className="font-semibold text-primary">궁극기 {ultimateLabel(hero.ultimateName)}</span>
        {hero.ultimateDescription && ` — ${hero.ultimateDescription}`}
      </p>

      <dl className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-table">
        <div className="flex items-center gap-1.5">
          <dt className="text-secondary">체력</dt>
          <dd className="tabular font-semibold">{hero.healthText.replace(" 재생 보호막", "")}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="text-secondary">난이도</dt>
          <dd>
            <DifficultyStars value={hero.difficulty} />
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {hero.roles.map((r) => (
          <RoleBadge key={r} role={r} />
        ))}
        {!multi && hero.stats[0].playstyles.map((p) => <PlaystyleBadge key={p} playstyle={p} />)}
        <Chip>{hero.forms.length ? `폼 ${hero.forms.length}개` : "폼 없음"}</Chip>
      </div>

      {/* 통계: 데드풀은 역할별 3줄 */}
      <ul className="mt-5 w-full space-y-3 text-left">
        {hero.stats.map((s) => (
          <li key={s.id}>
            <div className="flex items-center gap-2">
              <TierBadge tier={s.tier} size="sm" />
              <span className="text-table font-semibold">{multi ? s.label : `${s.tier}티어`}</span>
              {multi && s.playstyles.map((p) => <PlaystyleBadge key={p} playstyle={p} showLabel={false} />)}
              <WinRateText rate={s.winRate} className="ml-auto text-table" />
            </div>
            <WinRateBar rate={s.winRate} className="mt-2" />
          </li>
        ))}
      </ul>
      <div className="mt-2 self-start">
        <SourceNote />
      </div>

      <Link
        href={`/heroes/${hero.slug}`}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-table font-bold transition-colors hover:bg-elevated"
      >
        상세 보기
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
