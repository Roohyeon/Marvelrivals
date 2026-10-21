import { PLAYSTYLE_LABEL } from "@/lib/labels";
import type { Playstyle } from "@/lib/types";

export type Pdr = { p: number; d: number; r: number };

export const PDR_KEYS: { key: keyof Pdr; style: Playstyle; fill: string }[] = [
  { key: "p", style: "P", fill: "bg-chart-p" },
  { key: "d", style: "D", fill: "bg-chart-d" },
  { key: "r", style: "R", fill: "bg-chart-r" },
];

/**
 * P/D/R 가로 막대 3개 (모바일·태블릿 — 작은 화면에서는 레이더보다 막대가 읽기 쉬움)
 * 값은 항상 글자로 함께 표시 → 색만으로 의미를 전하지 않음
 */
export function PdrBars({ value }: { value: Pdr }) {
  return (
    <ul className="space-y-3">
      {PDR_KEYS.map(({ key, style, fill }) => {
        const pct = Math.round(value[key] * 100);
        return (
          <li key={key} className="grid grid-cols-[72px_1fr_44px] items-center gap-3">
            <span className="text-table font-semibold">
              {style} <span className="font-medium text-secondary">{PLAYSTYLE_LABEL[style]}</span>
            </span>
            <div className="h-2 rounded-full bg-track" role="img" aria-label={`${PLAYSTYLE_LABEL[style]} ${pct}%`}>
              <div className={`bar-grow h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="tabular text-right text-table font-bold">{pct}%</span>
          </li>
        );
      })}
    </ul>
  );
}
