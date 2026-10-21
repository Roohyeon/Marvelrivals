import { ArrowRight, ChevronRight, Search, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { MapArt } from "@/components/maps/MapArt";
import { SourceNote } from "@/components/ui/Badges";
import { HeroAvatar } from "@/components/ui/HeroAvatar";
import { RoleIcon } from "@/components/ui/RoleIcon";
import { StatRow } from "@/components/ui/StatRow";
import { WinRateText } from "@/components/ui/WinRateBar";
import { heroes } from "@/lib/data";
import { MAP_MODE_LABEL, ROLE_LABEL, ROLES } from "@/lib/labels";
import { getMapCards, getRoleTop } from "@/lib/meta";
import type { Role } from "@/lib/types";

const ROLE_TEXT: Record<Role, string> = {
  vanguard: "text-vanguard",
  duelist: "text-duelist",
  strategist: "text-strategist",
};

export default function Home() {
  const mapCards = getMapCards();
  const count = (role: Role) => heroes.filter((h) => h.roles.includes(role)).length;

  return (
    <>
      {/* 히어로: 라벤더(다크는 어두운 남색) + 남색 사선 띠 + 대표 영웅 3명 */}
      <section className="relative overflow-hidden bg-hero">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-[58%] bg-hero-accent opacity-[var(--hero-accent-opacity)] [clip-path:polygon(38%_0,100%_0,100%_100%,0_100%)] md:w-1/2"
        />
        <Container className="relative grid items-end gap-6 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:py-12 xl:py-16">
          <div className="max-w-xl">
            <p className="text-caption font-bold text-secondary">마블 라이벌즈 영웅 도감 · 시즌 10</p>
            <h1 className="mt-2 text-title-lg font-extrabold xl:text-display">
              영웅 54명의 스킬·상성·티어를
              <br className="hidden md:block" /> 한글로 한 번에
            </h1>
            <form action="/heroes" method="get" role="search" className="relative mt-5">
              <label htmlFor="home-search" className="sr-only">
                영웅 이름 검색
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-secondary" aria-hidden />
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="영웅 이름 (예: 울버린, Storm)"
                className="h-13 w-full rounded-full border border-line bg-surface pl-12 pr-28 text-body text-primary shadow-panel placeholder:text-secondary focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 h-10 -translate-y-1/2 rounded-full bg-brand px-5 text-table font-bold text-on-brand"
              >
                검색
              </button>
            </form>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {ROLES.map((r) => (
                <li key={r}>
                  <Link
                    href={`/heroes?role=${r}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface/80 px-3 text-label font-semibold hover:bg-surface"
                  >
                    <RoleIcon role={r} className={`size-3.5 ${ROLE_TEXT[r]}`} />
                    {ROLE_LABEL[r]} <span className="tabular text-secondary">{count(r)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div aria-hidden className="relative -mb-8 hidden h-64 w-[420px] md:block xl:-mb-16 xl:h-80 xl:w-[520px]">
            {["peni-parker", "ultron", "storm"].map((slug, i) => (
              <Image
                key={slug}
                src={`/images/heroes/${slug}.png`}
                alt=""
                width={680}
                height={961}
                sizes="220px"
                loading="eager"
                fetchPriority={i === 1 ? "high" : "auto"}
                className={`absolute bottom-0 h-full w-auto [mask-image:linear-gradient(to_top,transparent,black_18%)] ${
                  ["left-0 z-10 scale-90", "left-1/2 z-20 -translate-x-1/2", "right-0 z-10 scale-90"][i]
                } origin-bottom`}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* 지금 메타 — 역할별 Top 5 */}
      <Container className="py-8 xl:py-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-title font-bold xl:text-h2">지금 메타</h2>
            <p className="text-caption text-secondary">역할별 승률 Top 5</p>
          </div>
          <SourceNote>커뮤니티 · 10/15</SourceNote>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          {ROLES.map((role) => (
            <section key={role} aria-labelledby={`meta-${role}`} className="overflow-hidden rounded-panel border border-line bg-surface shadow-panel">
              <header className="flex h-11 items-center gap-2 bg-elevated px-4">
                <RoleIcon role={role} className={`size-4 ${ROLE_TEXT[role]}`} />
                <h3 id={`meta-${role}`} className="text-table font-bold">
                  {ROLE_LABEL[role]}
                </h3>
                <span className="text-caption text-secondary">{count(role)}명</span>
                <Link
                  href={`/tier?role=${role}`}
                  className="ml-auto inline-flex h-9 items-center text-caption font-semibold text-accent-text hover:underline"
                >
                  더 보기 <ChevronRight className="size-3.5" aria-hidden />
                </Link>
              </header>
              <ol className="px-3">
                {getRoleTop(role).map((row, i) => (
                  <StatRow key={row.statId} row={row} rank={i + 1} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      </Container>

      {/* 맵 메타 — 가로 스크롤 카드 */}
      <section aria-labelledby="map-meta" className="pb-8 xl:pb-12">
        <Container className="flex items-end justify-between">
          <div>
            <h2 id="map-meta" className="text-title font-bold xl:text-h2">
              맵 메타
            </h2>
            <p className="text-caption text-secondary">맵별 승률 1위 영웅</p>
          </div>
          <Link href="/maps" className="inline-flex h-9 items-center text-caption font-semibold text-accent-text hover:underline">
            전체 맵 <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </Container>
        <div className="mx-auto max-w-[1600px]">
          <ul className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] md:px-6 xl:px-8">
            {mapCards.map((m) => {
              const top = m.top5[0];
              return (
                <li key={m.id} className="w-60 shrink-0 snap-start">
                  <Link
                    href={`/maps?mode=${m.mode}#${m.id}`}
                    className="block overflow-hidden rounded-panel border border-line bg-surface shadow-panel hover:border-accent"
                  >
                    <MapArt map={m} sizes="240px" className="aspect-[16/9]" />
                    <div className="p-3">
                      <p className="truncate text-table font-bold">{m.nameKo}</p>
                      <p className="truncate text-caption text-secondary">
                        {MAP_MODE_LABEL[m.mode]} · {m.regionKo ?? m.nameEn}
                      </p>
                      {top && (
                        <p className="mt-2 flex items-center gap-2 text-caption">
                          <HeroAvatar slug={top.slug} size={24} />
                          <span className="truncate font-semibold">{top.label}</span>
                          <WinRateText rate={top.mapWinRate} className="ml-auto" />
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 팀 빌더 바로가기 */}
      <Container className="pb-4">
        <Link
          href="/team-builder"
          className="group relative flex items-center gap-4 overflow-hidden rounded-panel bg-hero-accent p-5 text-white xl:p-8"
        >
          <span aria-hidden className="absolute -right-10 top-0 h-full w-40 -skew-x-12 bg-selected/90" />
          <UsersRound className="relative size-10 shrink-0" aria-hidden />
          <span className="relative min-w-0 flex-1">
            <span className="block text-title font-bold xl:text-h2">팀 빌더</span>
            <span className="block text-table text-white/80">6명을 골라 팀 성향(P/D/R)·협공·카운터 추천을 확인하세요</span>
          </span>
          <ArrowRight className="relative size-6 shrink-0 text-on-brand transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </Container>
    </>
  );
}
