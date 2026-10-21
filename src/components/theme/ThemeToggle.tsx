"use client";

import { Moon, Sun } from "lucide-react";
import { useResolvedTheme, useThemeStore } from "@/stores/theme-store";

/** 해·달 버튼: 누를 때마다 라이트 ↔ 다크 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const resolved = useResolvedTheme();
  const setPreference = useThemeStore((s) => s.setPreference);
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      aria-label={next === "dark" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      className={`inline-flex size-11 items-center justify-center rounded-full transition-colors ${className}`}
    >
      {/* 아이콘은 상태가 아니라 .dark 클래스로 전환 → 첫 페인트부터 맞는 아이콘, 하이드레이션 불일치 없음 */}
      <Moon className="size-5 dark:hidden" aria-hidden />
      <Sun className="hidden size-5 dark:block" aria-hidden />
    </button>
  );
}
