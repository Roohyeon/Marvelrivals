import { Info, Link2, Sparkles, Swords } from "lucide-react";
import Link from "next/link";
import { PdrBars, PDR_KEYS } from "@/components/charts/PdrBars";
import { PdrRadar, type RadarSeries } from "@/components/charts/PdrRadar";
import { SourceNote } from "@/components/ui/Badges";
import { HeroAvatar } from "@/components/ui/HeroAvatar";
import { RoleIcon } from "@/components/ui/RoleIcon";
import { PLAYSTYLE_LABEL, ROLE_LABEL, ROLES } from "@/lib/labels";
import {
  activeTeamUps,
  averagePdr,
  counterPicks,
  nearTeamUps,
  roleCounts,
  styleSummary,
} from "@/lib/team-analysis";
import type { TeamData, TeamEntry } from "@/lib/team-types";

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <h3 className="mb-3 flex items-center gap-1.5 text-table font-bold">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

/** 분석 패널: 역할 구성 · 팀 성향(P/D/R) · 협공 · 카운터 추천 */
export function TeamAnalysis({ ally, enemy, data }: { ally: TeamEntry[]; enemy: TeamEntry[]; data: TeamData }) {
  const slugName = new Map(data.entries.map((e) => [e.slug, e.label.replace(/\(.+\)$/, "")]));
  const allyPdr = averagePdr(ally);
  const enemyPdr = averagePdr(enemy);
  const summary = allyPdr && styleSummary(allyPdr);
  const roles = roleCounts(ally);
  const active = activeTeamUps(ally, data);
  const near = nearTeamUps(ally, data);
  const picks = counterPicks(ally, enemy, data);

  if (!ally.length && !enemy.length) {
    return (
      <div className="rounded-panel border border-dashed border-line p-6 text-center">
        <p className="text-table font-semibold">영웅을 골라 팀을 만들어 보세요</p>
        <p className="mt-1 text-caption text-secondary">우리 팀 6명을 고르면 성향·협공을, 상대 팀을 넣으면 카운터 추천을 보여줘요.</p>
      </div>
    );
  }

  const series: RadarSeries[] = [];
  if (allyPdr) series.push({ label: "우리 팀", value: allyPdr, color: "var(--chart-ally)" });
  if (enemyPdr) series.push({ label: "상대 팀", value: enemyPdr, color: "var(--chart-enemy)" });

  return (
    <div className="space-y-3">
      {allyPdr && summary && (
        <Card title="팀 성향">
          <p className="text-title font-extrabold">{summary.sentence}</p>
          {summary.strongVs && (
            <p className="mt-1 text-caption text-secondary">
              {summary.strongVs} 조합에 강하고, {summary.weakVs} 조합에 약해요 (포킹 &gt; 러쉬 &gt; 다이브 &gt; 포킹)
            </p>
          )}

          {/* 역할 구성 */}
          <ul className="mt-3 flex gap-2">
            {ROLES.map((r) => (
              <li key={r} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-elevated px-3 text-caption font-semibold">
                <RoleIcon role={r} className="size-3.5" />
                {ROLE_LABEL[r]} <span className="tabular">{roles[r]}</span>
              </li>
            ))}
          </ul>
          {ally.length >= 3 && roles.strategist === 0 && (
            <p className="mt-2 flex items-center gap-1 text-caption text-negative">
              <Info className="size-3.5" aria-hidden />
              전략가(힐러)가 없어요
            </p>
          )}

          {/* 모바일: 막대 / 데스크톱: 레이더(상대 팀 겹쳐 보기) */}
          <div className="mt-4 xl:hidden">
            <PdrBars value={allyPdr} />
            {enemyPdr && (
              <p className="mt-2 text-caption text-secondary">
                상대 팀:{" "}
                {PDR_KEYS.map(({ key, style }) => `${PLAYSTYLE_LABEL[style]} ${Math.round(enemyPdr[key] * 100)}%`).join(" · ")}
              </p>
            )}
          </div>
          <div className="mt-2 hidden xl:block">
            <PdrRadar title="팀 성향 평균" series={series} />
            <table className="mx-auto mt-3 text-caption">
              <thead>
                <tr className="text-secondary">
                  <th scope="col" className="px-2 text-left font-medium" />
                  {PDR_KEYS.map(({ style }) => (
                    <th key={style} scope="col" className="px-2 font-medium">
                      {style} {PLAYSTYLE_LABEL[style]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="tabular">
                {series.map((s) => (
                  <tr key={s.label}>
                    <th scope="row" className="px-2 text-left font-semibold">
                      {s.label}
                    </th>
                    {PDR_KEYS.map(({ key }) => (
                      <td key={key} className="px-2 text-center font-bold">
                        {Math.round(s.value[key] * 100)}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {ally.length > 0 && (
        <Card title={`발동되는 협공 ${active.length}`} icon={<Link2 className="size-4 text-accent" aria-hidden />}>
          {active.length ? (
            <ul className="space-y-2">
              {active.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <HeroAvatar slug={t.heroSlug} size={28} />
                  <span className="text-caption text-secondary">+</span>
                  <HeroAvatar slug={t.partnerSlug} size={28} />
                  <span className="min-w-0">
                    <span className="block truncate text-table font-semibold">{t.name}</span>
                    <span className="block text-caption text-secondary">
                      {slugName.get(t.heroSlug)} + {slugName.get(t.partnerSlug)} · {t.key}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-caption text-secondary">아직 팀 안에서 발동되는 협공이 없어요.</p>
          )}
          {near.length > 0 && (
            <div className="mt-3 border-t border-line pt-3">
              <p className="mb-2 text-caption font-semibold text-secondary">한 명만 더하면 발동</p>
              <ul className="flex flex-wrap gap-1.5">
                {near.map((t) => (
                  <li key={t.id} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-elevated pl-1 pr-3 text-caption">
                    <HeroAvatar slug={t.missing} size={24} />
                    <span className="font-semibold">{slugName.get(t.missing)}</span>
                    <span className="text-secondary">· {t.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card title="카운터 추천" icon={<Swords className="size-4 text-positive" aria-hidden />}>
        {!enemy.length ? (
          <p className="text-caption text-secondary">상대 팀 영웅을 넣으면, 상대를 가장 잘 잡는 영웅 3명을 추천해요.</p>
        ) : picks.length ? (
          <ol className="space-y-2.5">
            {picks.map((p, i) => (
              <li key={p.entry.statId}>
                <Link href={`/heroes/${p.entry.slug}`} className="flex items-center gap-3 rounded-md p-1 hover:bg-elevated">
                  <span className="tabular w-4 text-caption font-bold text-secondary">{i + 1}</span>
                  <HeroAvatar slug={p.entry.slug} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-table font-bold">{p.entry.label}</span>
                    <span className="block truncate text-caption text-secondary">
                      {p.against.map((a) => `${a.entry.label} +${a.score.toFixed(1)}`).join(" · ")}
                    </span>
                  </span>
                  <span className="tabular text-table font-bold text-positive">+{p.total.toFixed(1)}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-caption text-secondary">추천할 영웅이 없어요 (카운터 후보가 모두 우리 팀에 있어요).</p>
        )}
        <p className="mt-3 flex items-start gap-1 text-caption text-secondary">
          <Sparkles className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          점수는 상대 영웅별 카운터 지수의 합이에요. 승률(%)이 아니라 0이 비등한 상성인 지수입니다.
        </p>
      </Card>

      <SourceNote>커뮤니티 통계 · counterwatch.gg 팀 빌더·카운터 · 2026-10-15 기준</SourceNote>
    </div>
  );
}
