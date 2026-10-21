import type { Role } from "@/lib/types";

// 역할 아이콘 — 게임 아이콘 대신 직접 그린 단순한 도형 (뱅가드 방패 · 듀얼리스트 검 · 전략가 십자)
const PATHS: Record<Role, string> = {
  vanguard: "M12 2.5 4 5.5v6c0 4.9 3.4 8.6 8 10 4.6-1.4 8-5.1 8-10v-6l-8-3Z",
  duelist: "m14.5 3 6.5-.5-.5 6.5-9 9-2 2-2.5-2.5-2 2-1.5-1.5 2-2L3 13.5l2-2 9.5-8.5Z",
  strategist: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z",
};

export function RoleIcon({ role, className = "size-4" }: { role: Role; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d={PATHS[role]} />
    </svg>
  );
}
