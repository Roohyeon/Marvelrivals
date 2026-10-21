import type { ReactNode } from "react";

/** 페이지 좌우 여백: 모바일 16px · 태블릿 24px · 데스크톱 32px */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1600px] px-4 md:px-6 xl:px-8 ${className}`}>{children}</div>;
}
