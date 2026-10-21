import { PdrBars, PDR_KEYS } from "@/components/charts/PdrBars";
import { PdrRadar } from "@/components/charts/PdrRadar";
import { SourceNote } from "@/components/ui/Badges";
import type { DetailStat } from "@/lib/hero-detail";
import { PLAYSTYLE_LABEL } from "@/lib/labels";

/** 조합 성향 — 모바일·태블릿은 가로 막대 3개, 데스크톱은 레이더 + 숫자 칩 */
export function PdrSection({ stat }: { stat: DetailStat }) {
  return (
    <div className="rounded-panel border border-line bg-surface p-4 shadow-panel xl:p-6">
      <h3 className="text-title font-bold">조합 성향</h3>
      <p className="mt-0.5 text-table text-secondary">{stat.pdrNote}</p>

      <div className="mt-4 xl:hidden">
        <PdrBars value={stat.pdr} />
      </div>

      <div className="mt-2 hidden xl:block">
        <PdrRadar title={`${stat.label} 조합 성향`} series={[{ label: stat.label, value: stat.pdr, color: "var(--chart-ally)" }]} />
        <ul className="mt-3 flex justify-center gap-2">
          {PDR_KEYS.map(({ key, style, fill }) => (
            <li key={key} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-elevated px-3 text-label font-semibold">
              <span aria-hidden className={`size-2 rounded-full ${fill}`} />
              {style} {PLAYSTYLE_LABEL[style]}
              <span className="tabular font-bold">{Math.round(stat.pdr[key] * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 rounded-md bg-elevated px-3 py-2 text-caption text-secondary">
        상성 순환: 포킹 &gt; 러쉬 &gt; 다이브 &gt; 포킹
      </p>
      <div className="mt-3">
        <SourceNote>커뮤니티 통계 · counterwatch.gg 팀 빌더 · 일부 값은 직접 수정</SourceNote>
      </div>
    </div>
  );
}
