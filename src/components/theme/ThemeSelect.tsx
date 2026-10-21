"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import type { ThemePreference } from "@/lib/theme";
import { useThemeStore } from "@/stores/theme-store";

const OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: "system", label: "시스템", icon: Monitor },
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon },
];

/** 설정 메뉴의 "시스템 / 라이트 / 다크" 3단 선택 */
export function ThemeSelect() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <div role="radiogroup" aria-label="테마" className="grid grid-cols-3 gap-1 rounded-md bg-elevated p-1">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const checked = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => setPreference(value)}
            className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-sm text-caption transition-colors ${
              checked ? "bg-surface font-bold text-primary shadow-panel" : "text-secondary hover:text-primary"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
