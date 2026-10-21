import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PlaystyleBadge, RoleBadge, TierBadge } from "@/components/ui/Badges";
import { DifficultyStars } from "@/components/ui/DifficultyStars";
import { WinRateText } from "@/components/ui/WinRateBar";
import type { HeroDetail } from "@/lib/hero-detail";

/**
 * 상세 상단
 * - 모바일·태블릿: 전신 이미지(화면 높이 약 45%) → 아래로 페이지 배경색으로 사라짐 → 이름·태그 (세로)
 * - 데스크톱: 남색 → 라벤더 사선 분할 배경, 이미지 왼쪽 · 정보 오른쪽
 */
export function HeroHeader({ detail }: { detail: HeroDetail }) {
  const { hero, stats } = detail;
  const multi = stats.length > 1;

  return (
    <section className="relative overflow-hidden xl:bg-hero">
      {/* 데스크톱: 왼쪽 남색 사선 면 */}
      <div
        aria-hidden
        // 사선이 오른쪽 정보 영역(제목) 앞에서 끝나도록 — 제목 글자가 남색 위에 걸치면 대비가 떨어짐
        className="absolute inset-y-0 left-0 hidden w-[40%] bg-hero-accent opacity-[var(--hero-accent-opacity)] [clip-path:polygon(0_0,100%_0,78%_100%,0_100%)] xl:block"
      />

      <Container className="relative xl:grid xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:items-center xl:gap-12 xl:py-10">
        <Link
          href="/heroes"
          className="absolute left-4 top-3 z-10 inline-flex h-10 items-center gap-1 rounded-full bg-surface/80 px-3 text-label font-semibold text-primary backdrop-blur md:left-6 xl:left-8 xl:top-6 xl:bg-white/10 xl:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden />
          영웅 목록
        </Link>

        {/* 전신 이미지 */}
        <div className="relative -mx-4 h-[45vh] min-h-[320px] overflow-hidden bg-linear-to-b from-portrait-from to-portrait-to pt-12 md:-mx-6 xl:mx-0 xl:h-[560px] xl:bg-none xl:pt-0">
          {/* 이미지 상자 = 그림 비율(680×961) 그대로 → 마스크가 그림의 실제 가장자리에 걸림 */}
          <Image
            src={`/images/heroes/${hero.slug}.png`}
            alt={`${hero.nameKo} 전신 이미지`}
            width={680}
            height={961}
            fetchPriority="high"
            sizes="(min-width: 1280px) 400px, 60vw"
            // 원본 그림이 이미지 경계에서 잘려 있어(세로 직선이 보임) 좌우·아래 끝을 부드럽게 흐림
            className="relative mx-auto h-full w-auto max-w-none [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent),linear-gradient(to_top,transparent,black_12%)]"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-base to-transparent xl:hidden" />
        </div>

        {/* 이름·태그·핵심 수치 */}
        <div className="relative -mt-6 xl:mt-0">
          <h1 className="text-title-lg font-extrabold xl:text-display">{hero.nameKo}</h1>
          <p className="mt-0.5 text-caption text-secondary xl:text-body">
            {hero.nameEn}
            {hero.nameKoSource === "common" && " · 한글명 통상 표기"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {hero.roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
            {!multi && (
              <>
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface px-1 pr-2.5 text-caption font-semibold">
                  <TierBadge tier={stats[0].tier} size="sm" />
                  티어 <WinRateText rate={stats[0].winRate} />
                </span>
                {stats[0].playstyles.map((p) => (
                  <PlaystyleBadge key={p} playstyle={p} />
                ))}
              </>
            )}
          </div>

          {multi && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {stats.map((s) => (
                <li
                  key={s.id}
                  className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface px-1 pr-2.5 text-caption font-semibold"
                >
                  <TierBadge tier={s.tier} size="sm" />
                  {s.label.replace(hero.nameKo, "").replace(/[()]/g, "")} <WinRateText rate={s.winRate} />
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-5 grid grid-cols-3 gap-2 xl:max-w-xl xl:gap-3">
            <StatCard label="체력" value={hero.healthText.replace(/ 재생 보호막/g, "")} hint={hero.healthText.includes("재생 보호막") ? "+ 재생 보호막" : undefined} />
            <StatCard label="난이도" value={<DifficultyStars value={hero.difficulty} />} />
            <StatCard label="궁극기 비용" value={hero.ultimateCost?.toLocaleString("ko-KR") ?? hero.ultimateCostText} />
          </dl>

          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-caption text-secondary">
            <span>
              이동 속도 {hero.moveSpeed}m/s{!hero.moveSpeedVerified && " (일반값, 개별 미확인)"}
            </span>
            <a
              href={hero.wikiUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-primary"
            >
              위키 문서 <ExternalLink className="size-3" aria-hidden />
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}

function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  const long = typeof value === "string" && value.length > 10;
  // 폼별 값("200 (브루스 배너) / 400+300 (히어로 헐크) / …")은 한 줄에 하나씩
  const lines = typeof value === "string" && value.includes(" / ") ? value.split(" / ") : null;
  return (
    <div className="flex min-h-20 flex-col justify-center rounded-md border border-line bg-surface px-3 py-2.5 shadow-panel">
      <dt className="text-caption text-secondary">{label}</dt>
      <dd className={`tabular mt-1 font-bold ${long ? "text-caption" : "text-title"}`}>
        {lines ? lines.map((l) => <span key={l} className="block">{l}</span>) : value}
      </dd>
      {hint && <dd className="text-tiny text-secondary">{hint}</dd>}
    </div>
  );
}
