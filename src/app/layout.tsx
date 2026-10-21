import type { Metadata, Viewport } from "next";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Providers } from "@/components/Providers";
import { StoreHydrator } from "@/components/StoreHydrator";
import { ThemeController } from "@/components/theme/ThemeController";
import { themeInitScript } from "@/lib/theme";
// Pretendard 동적 서브셋: 글자 범위별로 92조각(unicode-range)으로 나눈 웹폰트 — 페이지에 쓰인 글자 조각만 내려받음.
// (한 파일 2MB 가변 폰트를 next/font 로 미리 불러오면 느린 모바일에서 글꼴 교체가 늦어 LCP 12초 → 교체)
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

// OG 이미지 등 절대 주소의 기준. Vercel 배포 시 자동 제공되는 운영 도메인을 쓰고, 없으면 로컬 주소
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rivals Dex — 마블 라이벌즈 도감",
    template: "%s | Rivals Dex",
  },
  description:
    "마블 라이벌즈 영웅 54명의 스킬·티어·카운터·조합 성향·맵 정보를 한글로 한 번에 보는 도감",
};

export const viewport: Viewport = {
  // iOS 홈 표시줄 영역(safe-area)까지 화면을 쓰고, 하단 탭바에 env(safe-area-inset-bottom) 여백을 둠
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafb" },
    { media: "(prefers-color-scheme: dark)", color: "#08090a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // 초기화 스크립트가 class="dark"를 미리 붙이므로, <html>의 속성 차이는 경고하지 않음
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeController />
        <StoreHydrator />
        <Providers>
          <SiteHeader />
          <div className="flex flex-1 flex-col pb-tabbar-safe xl:pb-0">
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <BottomTabBar />
        </Providers>
      </body>
    </html>
  );
}
