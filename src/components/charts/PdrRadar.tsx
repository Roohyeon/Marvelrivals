"use client";

import { useState } from "react";
import { PLAYSTYLE_LABEL } from "@/lib/labels";
import type { Pdr } from "./PdrBars";

export interface RadarSeries {
  label: string;
  value: Pdr;
  /** CSS 색 값 — 테마 토큰 변수를 넘김. 예: "var(--chart-ally)" */
  color: string;
}

const AXES: { key: keyof Pdr; angle: number }[] = [
  { key: "p", angle: -90 }, // 위
  { key: "d", angle: 30 }, // 오른쪽 아래
  { key: "r", angle: 150 }, // 왼쪽 아래
];

const SIZE = 240;
const C = SIZE / 2;
const R = 82;

const point = (angle: number, ratio: number) => {
  const rad = (angle * Math.PI) / 180;
  return [C + Math.cos(rad) * R * ratio, C + Math.sin(rad) * R * ratio] as const;
};

/**
 * P/D/R 레이더 (데스크톱). 직접 그린 SVG — 테마 색은 CSS 변수로 받아 다크/라이트 자동 전환
 * - 선 2px · 면 10% · 격자는 가는 실선 · 꼭짓점 r=4 + 2px 표면색 링 (dataviz 표식 규칙)
 * - 꼭짓점에 마우스를 올리거나 키보드로 포커스하면 값 표시, 숫자는 옆의 칩에도 항상 표시
 * - 계열이 2개 이상이면 범례 표시 (팀 빌더: 내 팀 / 상대 팀)
 */
export function PdrRadar({ series, title }: { series: RadarSeries[]; title: string }) {
  const [hover, setHover] = useState<{ s: number; key: keyof Pdr } | null>(null);

  return (
    <figure className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[280px] overflow-visible"
        role="img"
        aria-label={`${title}: ${series
          .map((s) => `${s.label} ${AXES.map((a) => `${PLAYSTYLE_LABEL[a.key.toUpperCase() as "P"]} ${Math.round(s.value[a.key] * 100)}%`).join(", ")}`)
          .join(" / ")}`}
      >
        {/* 격자: 25% 단위 삼각형 + 축 */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <polygon
            key={ratio}
            points={AXES.map((a) => point(a.angle, ratio).join(",")).join(" ")}
            fill="none"
            stroke="var(--line)"
            strokeWidth={1}
          />
        ))}
        {AXES.map((a) => {
          const [x, y] = point(a.angle, 1);
          return <line key={a.key} x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" strokeWidth={1} />;
        })}

        {/* 축 이름 */}
        {AXES.map((a) => {
          const [x, y] = point(a.angle, 1.28);
          const style = a.key.toUpperCase() as "P" | "D" | "R";
          return (
            <text
              key={a.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-secondary text-[12px] font-semibold"
            >
              {style} {PLAYSTYLE_LABEL[style]}
            </text>
          );
        })}

        {/* 계열 */}
        {series.map((s, si) => {
          const pts = AXES.map((a) => point(a.angle, s.value[a.key]));
          return (
            <g key={s.label}>
              <polygon
                points={pts.map((p) => p.join(",")).join(" ")}
                fill={s.color}
                fillOpacity={0.1}
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {AXES.map((a, ai) => {
                const [x, y] = pts[ai];
                const active = hover?.s === si && hover.key === a.key;
                return (
                  <g key={a.key}>
                    {/* 보이는 점보다 넓은 히트 영역 */}
                    <circle
                      cx={x}
                      cy={y}
                      r={12}
                      fill="transparent"
                      tabIndex={0}
                      aria-label={`${s.label} ${PLAYSTYLE_LABEL[a.key.toUpperCase() as "P"]} ${Math.round(s.value[a.key] * 100)}%`}
                      onMouseEnter={() => setHover({ s: si, key: a.key })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ s: si, key: a.key })}
                      onBlur={() => setHover(null)}
                      className="cursor-default outline-none"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 5.5 : 4}
                      fill={s.color}
                      stroke="var(--surface)"
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* 툴팁 */}
        {hover &&
          (() => {
            const s = series[hover.s];
            const axis = AXES.find((a) => a.key === hover.key)!;
            const [x, y] = point(axis.angle, s.value[hover.key]);
            const text = `${series.length > 1 ? `${s.label} · ` : ""}${hover.key.toUpperCase()} ${Math.round(s.value[hover.key] * 100)}%`;
            // 글자 폭 추정: 한글 12px · 그 외 7px (12px 글꼴 기준)
            const w = [...text].reduce((n, ch) => n + (/[가-힣]/.test(ch) ? 12 : 7), 16);
            return (
              <g pointerEvents="none">
                <rect x={x - w / 2} y={y - 34} width={w} height={24} rx={6} fill="var(--primary)" />
                <text x={x} y={y - 22} textAnchor="middle" dominantBaseline="middle" className="fill-surface text-[12px] font-bold">
                  {text}
                </text>
              </g>
            );
          })()}
      </svg>

      {series.length > 1 && (
        <figcaption className="mt-2 flex gap-4 text-caption text-secondary">
          {series.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
