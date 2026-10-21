import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DARK_QUERY, resolveTheme, THEME_STORAGE_KEY, type ResolvedTheme, type ThemePreference } from "@/lib/theme";

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: "system",
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ preference: state.preference }),
      // 서버 렌더 결과("system")와 첫 클라이언트 렌더를 맞추기 위해, 저장값은 ThemeController 가 마운트 직후 읽습니다.
      skipHydration: true,
    },
  ),
);

function subscribeSystemDark(onChange: () => void) {
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** 기기 설정이 다크인지 (설정을 바꾸면 자동으로 다시 렌더링) */
export function useSystemDark(): boolean {
  return useSyncExternalStore(
    subscribeSystemDark,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
}

export function useResolvedTheme(): ResolvedTheme {
  const preference = useThemeStore((s) => s.preference);
  return resolveTheme(preference, useSystemDark());
}
