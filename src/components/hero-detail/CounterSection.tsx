import { ArrowRight, Info, TrendingUp } from "lucide-react";
import Link from "next/link";
import { SourceNote } from "@/components/ui/Badges";
import { HeroAvatar } from "@/components/ui/HeroAvatar";
import { RoleIcon } from "@/components/ui/RoleIcon";
import type { DetailStat } from "@/lib/hero-detail";
import { COUNTER_TYPE_LABEL, ROLE_LABEL } from "@/lib/labels";

// 지수 막대 배율: 이 데이터의 최대 카운터 지수(약 +22)를 막대 전체로
const MAX_SCORE = 25;

/**
 * 상성
 * - "이 영웅을 잡는 영웅" TOP5: 모바일은 DeltaBar 목록, 데스크톱은 다열 표 (같은 마크업, 열만 늘어남)
 * - "이 영웅이 강한 상대" TOP3: 아바타 나열
 * 누르면 그 영웅 상세로 이동 → 상성을 따라 계속 탐색
 */
export function CounterSection({ stat, heroName }: { stat: DetailStat; heroName: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-panel border border-line bg-surface p-4 shadow-panel xl:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex items-center gap-1.5 text-title font-bold">
            <TrendingUp className="size-5 text-positive" aria-hidden />
            이 영웅을 잡는 영웅
          </h3>
        </div>

        <div className="mt-1 hidden grid-cols-[28px_minmax(0,1.2fr)_minmax(0,1fr)_120px_96px] gap-4 border-b border-line pb-2 text-caption text-secondary xl:mt-3 xl:grid">
          <span>#</span>
          <span>영웅</span>
          <span>카운터 지수</span>
          <span>유형</span>
          <span />
        </div>

        <ol>
          {stat.counters.map((c, i) => (
            <li key={c.statId} className="border-b border-line last:border-0">
              <Link
                href={`/heroes/${c.slug}`}
                className="grid min-h-14 grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 py-2.5 hover:bg-base xl:grid-cols-[28px_minmax(0,1.2fr)_minmax(0,1fr)_120px_96px] xl:gap-4 xl:py-3"
              >
                <span className="tabular text-table font-bold text-secondary">{i + 1}</span>

                <span className="flex min-w-0 items-center gap-3">
                  <HeroAvatar slug={c.slug} size={36} />
                  <span className="min-w-0">
                    <span className="block truncate text-table font-bold">{c.label}</span>
                    <span className="flex items-center gap-1 text-caption text-secondary">
                      <RoleIcon role={c.role} className="size-3" />
                      {ROLE_LABEL[c.role]}
                      {c.type && <span className="xl:hidden">· {COUNTER_TYPE_LABEL[c.type]}</span>}
                    </span>
                  </span>
                </span>

                {/* 지수: 모바일은 숫자만 오른쪽, 데스크톱은 막대 + 숫자 */}
                <span className="flex items-center gap-3">
                  <span className="hidden h-1.5 flex-1 rounded-full bg-track xl:block">
                    <span
                      className="bar-grow block h-full rounded-full bg-positive"
                      style={{ width: `${Math.min((c.score / MAX_SCORE) * 100, 100)}%` }}
                    />
                  </span>
                  <span className="tabular w-12 text-right text-table font-bold text-positive">+{c.score.toFixed(1)}</span>
                </span>

                <span className="hidden text-caption text-secondary xl:block">{c.type ? COUNTER_TYPE_LABEL[c.type] : "—"}</span>
                <span className="hidden h-9 items-center justify-center gap-1 rounded-full border border-line text-caption font-semibold xl:inline-flex">
                  상세 보기 <ArrowRight className="size-3.5" aria-hidden />
                </span>

                {/* 모바일 DeltaBar: 두 번째 줄 전체 폭 */}
                <span className="col-span-3 -mt-1 block h-1 rounded-full bg-track xl:hidden" aria-hidden>
                  <span
                    className="bar-grow block h-full rounded-full bg-positive"
                    style={{ width: `${Math.min((c.score / MAX_SCORE) * 100, 100)}%` }}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <details className="mt-3 text-caption text-secondary">
          <summary className="inline-flex cursor-pointer items-center gap-1 font-semibold">
            <Info className="size-3.5" aria-hidden />
            카운터 지수는 승률(%)이 아니에요
          </summary>
          <p className="mt-1.5">
            0이 비등한 상성이고, 클수록 {heroName}을(를) 더 확실히 잡아내는 영웅입니다. 매치 승률이 아니라 킬 로그(1:1 결투
            승패, 한타에서 어느 쪽이 더 많이 쓰러졌는지)로 계산해서, 보호막·치유처럼 막아 주는 카운터는 낮게 잡힐 수 있어요.
          </p>
        </details>
      </div>

      <div className="rounded-panel border border-line bg-surface p-4 shadow-panel xl:p-6">
        <h3 className="text-title font-bold">이 영웅이 강한 상대</h3>
        <ul className="mt-3 flex gap-4">
          {stat.strongAgainst.map((r) => (
            <li key={r.statId}>
              <Link href={`/heroes/${r.slug}`} className="flex w-16 flex-col items-center gap-1.5 text-center hover:opacity-80">
                <HeroAvatar slug={r.slug} size={52} />
                <span className="text-caption font-semibold leading-tight">{r.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <SourceNote />
    </div>
  );
}
