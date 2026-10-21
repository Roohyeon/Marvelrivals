"use client";

import { useLayoutEffect } from "react";
import { applyTheme, DARK_QUERY, resolveTheme } from "@/lib/theme";
import { useSystemDark, useThemeStore } from "@/stores/theme-store";

/**
 * 테마 클래스를 <html>에 적용하는 컴포넌트 (화면에는 아무것도 그리지 않음)
 *
 * - 첫 페인트 전 적용은 layout.tsx 의 초기화 스크립트가 담당
 * - 여기서는 ① 저장값을 스토어로 불러오고 ② 이후 변경(버튼·설정·기기 설정)을 반영
 * - 개발 모드 Strict Mode 재마운트 때 React가 <html> 속성을 지우는 문제도 이 effect 가 다시 적용해 해결
 */
export function ThemeController() {
  const preference = useThemeStore((s) => s.preference);
  const systemDark = useSystemDark();

  useLayoutEffect(() => {
    void useThemeStore.persist.rehydrate();
  }, []);

  useLayoutEffect(() => {
    if (!useThemeStore.persist.hasHydrated()) return;
    // 렌더 시점 값 대신 최신 값을 직접 읽음 — 하이드레이션 직후 한 번은 렌더 값이 서버 기본값이기 때문
    const latest = useThemeStore.getState().preference;
    applyTheme(resolveTheme(latest, window.matchMedia(DARK_QUERY).matches));
  }, [preference, systemDark]);

  return null;
}
