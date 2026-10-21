import { ChevronDown } from "lucide-react";
import { Chip } from "@/components/ui/Badges";
import type { Skill, SkillDetail } from "@/lib/types";

function Details({ items }: { items: SkillDetail[] }) {
  if (!items.length) return null;
  return (
    <dl className="grid gap-x-3 gap-y-1 text-caption [grid-template-columns:auto_1fr]">
      {items.map((d, i) =>
        d.label ? (
          <div key={i} className="contents">
            <dt className="text-secondary">{d.label}</dt>
            <dd className="tabular text-primary">{d.value}</dd>
          </div>
        ) : (
          <dd key={i} className="col-span-2 text-primary">
            {d.value}
          </dd>
        ),
      )}
    </dl>
  );
}

function costLabel(s: Skill) {
  if (s.cooldown) return `쿨타임 ${s.cooldown}`;
  if (s.ultimateCost) return `에너지 ${s.ultimateCost.toLocaleString("ko-KR")}`;
  return null;
}

/**
 * 스킬 목록 — 모바일은 카드(누르면 세부 수치 펼침), 데스크톱은 다열 표
 * 두 형태를 모두 그려 두고 화면 너비로 하나만 보여줍니다 (display:none 쪽은 스크린 리더도 읽지 않음)
 */
export function SkillList({ skills, showForm }: { skills: Skill[]; showForm: boolean }) {
  if (!skills.length) return <p className="py-10 text-center text-table text-secondary">이 항목에 해당하는 스킬이 없어요.</p>;

  return (
    <>
      <ul className="space-y-2 xl:hidden">
        {skills.map((s) => {
          const cost = costLabel(s);
          return (
            <li key={s.id}>
              <details className="group rounded-md border border-line bg-surface">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">
                    <span className="block text-table font-bold">{s.name}</span>
                    <span className="block truncate text-caption text-secondary">
                      {s.nameEn}
                      {showForm && s.form && ` · ${s.form}`}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <Chip>{s.key}</Chip>
                    {cost && <span className="tabular text-caption text-secondary">{cost}</span>}
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-secondary transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="space-y-3 border-t border-line px-4 py-3">
                  <p className="text-body">{s.description}</p>
                  <Details items={s.details} />
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-hidden rounded-panel border border-line bg-surface xl:block">
        <table className="w-full text-left text-table">
          <thead>
            <tr className="border-b border-line text-caption text-secondary">
              <th scope="col" className="w-[34%] px-5 py-3 font-medium">
                스킬
              </th>
              <th scope="col" className="w-24 px-3 py-3 font-medium">
                키
              </th>
              <th scope="col" className="w-32 px-3 py-3 font-medium">
                쿨타임 · 비용
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                세부 수치
              </th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.id} className="border-b border-line align-top last:border-0 hover:bg-base">
                <td className="px-5 py-4">
                  <p className="font-bold">{s.name}</p>
                  <p className="text-caption text-secondary">
                    {s.nameEn}
                    {showForm && s.form && ` · ${s.form}`}
                  </p>
                  <p className="mt-2 text-table text-secondary">{s.description}</p>
                </td>
                <td className="px-3 py-4">
                  <Chip>{s.key}</Chip>
                </td>
                <td className="tabular px-3 py-4">
                  {s.cooldown ?? (s.ultimateCost ? `${s.ultimateCost.toLocaleString("ko-KR")} 에너지` : "—")}
                </td>
                <td className="px-5 py-4">
                  <Details items={s.details} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
