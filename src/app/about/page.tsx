import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { heroes, maps, meta, skills, stats, teamups } from "@/lib/data";

export const metadata: Metadata = {
  title: "소개 · 데이터 출처",
  description: "Rivals Dex의 데이터 출처, 수집일, 알려진 한계와 저작권 안내.",
};

const LIMITS = [
  "스킬 이름·설명·맵 이름의 한글 표기는 위키 영어 원문을 옮긴 비공식 번역입니다. 원문을 함께 표시합니다.",
  "공식 한국어 영웅 목록에 없는 영웅(21명)은 국내에서 흔히 쓰는 표기로 적고 '통상 표기'로 구분했습니다.",
  "이동 속도는 영웅별 개별값이 확인되지 않았습니다 (블랙 팬서·울버린 7m/s, 그 외 일반값 6m/s).",
  "P/D/R 점수는 출처 사이트가 산정 방식을 공개하지 않았고, 일부 값은 이 프로젝트에서 직접 수정했습니다.",
  "티어·승률·카운터·맵 승률은 수집일 기준 커뮤니티 통계입니다. 게임 패치 후에는 달라질 수 있습니다.",
  "카운터 지수는 승률(%)이 아니라 킬 로그로 계산한 지수입니다. 0이 비등한 상성입니다.",
];

export default function AboutPage() {
  // 출처 시트를 구분(공식·위키·통계…)별로 묶음
  const groups = meta.sources.reduce<Record<string, typeof meta.sources>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const counts = [
    ["영웅", heroes.length],
    ["통계 항목", stats.length],
    ["스킬", skills.length],
    ["협공", teamups.length],
    ["맵", maps.length],
  ] as const;

  return (
    <Container className="max-w-3xl py-6 xl:py-10">
      <h1 className="text-title font-bold xl:text-h1">소개 · 데이터 출처</h1>
      <p className="mt-3 text-body text-secondary">
        Rivals Dex는 마블 라이벌즈 영웅의 스킬·상성·티어·조합 성향·맵 정보를 한글로 한 흐름 안에서 볼 수 있게 만든 비상업적
        포트폴리오 프로젝트입니다.
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-2 md:grid-cols-5">
        {counts.map(([label, n]) => (
          <div key={label} className="rounded-md border border-line bg-surface p-3 text-center shadow-panel">
            <dt className="text-caption text-secondary">{label}</dt>
            <dd className="tabular text-title font-bold">{n}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="text-h2 font-bold">수집 기준</h2>
        <ul className="mt-2 space-y-1 text-table">
          <li>· 데이터 수집일: {meta.collectedAt} ({meta.season})</li>
          <li>· 커뮤니티 통계 갱신일: {meta.statsUpdatedAt} (counterwatch.gg, 전 랭크·스탠다드 모드)</li>
          <li>· 영웅 이미지·스킬·협공·맵 목록: Marvel Rivals Wiki (Fandom)</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-h2 font-bold">알려진 한계</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-table">
          {LIMITS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-h2 font-bold">출처 {meta.sources.length}곳</h2>
        <div className="mt-3 space-y-2">
          {Object.entries(groups).map(([category, list]) => (
            <details key={category} className="group rounded-md border border-line bg-surface">
              <summary className="flex min-h-12 cursor-pointer items-center justify-between px-4 text-table font-semibold">
                {category} <span className="tabular text-caption text-secondary">{list.length}</span>
              </summary>
              <ul className="space-y-1 border-t border-line px-4 py-3 text-caption">
                {list.map((s) => (
                  <li key={s.url + s.usage}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-accent-text hover:underline">
                      {s.url.replace(/^https?:\/\//, "")}
                      <ExternalLink className="size-3 shrink-0" aria-hidden />
                    </a>
                    {s.usage && <span className="text-secondary"> — {s.usage}</span>}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-panel bg-elevated p-4 text-table">
        <h2 className="font-bold">저작권</h2>
        <p className="mt-1 text-secondary">
          Marvel Rivals 및 캐릭터·맵 이미지의 저작권은 NetEase Games / Marvel에 있습니다. 본 사이트는 비상업적 포트폴리오이며,
          게임 UI 그래픽(로고·아이콘)은 쓰지 않고 레이아웃만 참고해 새로 만들었습니다. 권리자의 요청이 있으면 즉시 내리겠습니다.
        </p>
      </section>
    </Container>
  );
}
