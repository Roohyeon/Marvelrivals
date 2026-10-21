// 테마 규칙 — <head> 초기화 스크립트와 Zustand 스토어가 같은 값을 읽도록 한 곳에 둡니다.

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

/** Zustand persist 가 쓰는 localStorage 키 (값 형태: {"state":{"preference":"dark"},"version":0}) */
export const THEME_STORAGE_KEY = "rivals-dex-theme";

export const DARK_QUERY = "(prefers-color-scheme: dark)";

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (preference === "system") return systemDark ? "dark" : "light";
  return preference;
}

export function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * 화면이 그려지기 전에 실행되는 초기화 스크립트 (FOUC 방지).
 * HTML을 읽는 도중 동기로 실행되므로 첫 페인트부터 올바른 테마가 적용됩니다.
 * localStorage 를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 try/catch 로 기본값(시스템)을 따릅니다.
 */
export const themeInitScript = `(function(){try{var p="system";var raw=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(raw){var s=JSON.parse(raw);if(s&&s.state&&(s.state.preference==="light"||s.state.preference==="dark"))p=s.state.preference}var d=p==="dark"||(p==="system"&&window.matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
