import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Chip, PlaystyleBadge, RoleBadge, SourceNote, TierBadge } from "@/components/ui/Badges";
import { getHero, stats } from "@/lib/data";
import { PLAYSTYLES, ROLES, TIERS } from "@/lib/labels";

// 3단계 임시 홈: 테마 토큰·공통 컴포넌트 점검용. 6단계에서 실제 홈(지금 메타·맵 메타)으로 바뀝니다.
export default function Home() {
  const top = stats.slice(0, 5);

  return (
    <>
      {/* 히어로 섹션: 라벤더(다크는 어두운 남색) 바탕 + 남색 사선 띠 */}
      <section className="relative overflow-hidden bg-hero">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/2 bg-hero-accent opacity-[var(--hero-accent-opacity)] [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)]"
        />
        <Container className="relative flex items-end gap-6 py-10">
          <div className="flex-1">
            <p className="text-caption font-bold text-secondary">3단계 점검 화면</p>
            <h1 className="mt-1 text-title-lg font-extrabold xl:text-display">테마 · 공통 레이아웃</h1>
            <p className="mt-2 max-w-md text-body text-secondary">
              오른쪽 위 해·달 버튼과 ⚙ 설정으로 테마를 바꿔 보세요. 새로고침해도 선택이 유지됩니다.
            </p>
          </div>
          <Image
            src="/images/heroes/iron-man.png"
            alt="아이언맨 전신 이미지"
            width={680}
            height={961}
            sizes="160px"
            fetchPriority="high"
            className="relative -mb-10 hidden h-auto w-40 md:block"
          />
        </Container>
      </section>

      <Container className="grid gap-6 py-8 xl:grid-cols-2">
        <section className="rounded-panel border border-line bg-surface p-6 shadow-panel">
          <h2 className="text-h2 font-bold">배지</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIERS.map((t) => (
              <TierBadge key={t} tier={t} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLAYSTYLES.map((p) => (
              <PlaystyleBadge key={p} playstyle={p} />
            ))}
            <Chip>폼 없음</Chip>
          </div>
          <button
            type="button"
            className="mt-5 inline-flex h-12 items-center rounded-full bg-brand px-6 text-table font-bold text-on-brand"
          >
            주요 버튼 (검정 글자)
          </button>
        </section>

        <section className="rounded-panel border border-line bg-surface p-6 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-h2 font-bold">승률 Top 5</h2>
            <SourceNote />
          </div>
          <ul className="mt-2">
            {top.map((s) => {
              const hero = getHero(s.heroSlug)!;
              const diff = Math.min(Math.abs(s.winRate - 50) * 10, 50);
              const up = s.winRate >= 50;
              return (
                <li key={s.id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-elevated">
                    <Image
                      src={`/images/heroes/${hero.slug}.png`}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover object-[50%_12%]"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-table font-bold">{s.label}</span>
                      <TierBadge tier={s.tier} size="sm" />
                    </div>
                    <div
                      className="relative mt-1.5 h-1 rounded-full bg-track"
                      role="img"
                      aria-label={`승률 ${s.winRate}% (50% ${up ? "이상" : "미만"})`}
                    >
                      <span className="absolute inset-y-0 left-1/2 w-px bg-muted" />
                      <span
                        className={`absolute inset-y-0 rounded-full ${up ? "left-1/2 bg-positive" : "right-1/2 bg-negative"}`}
                        style={{ width: `${diff}%` }}
                      />
                    </div>
                  </div>
                  <span className={`tabular text-table font-bold ${up ? "text-positive" : "text-negative"}`}>
                    {s.winRate.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </Container>
    </>
  );
}
