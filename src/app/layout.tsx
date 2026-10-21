import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rivals Dex — 마블 라이벌즈 도감",
    template: "%s | Rivals Dex",
  },
  description:
    "마블 라이벌즈 영웅 54명의 스킬·티어·카운터·조합 성향·맵 정보를 한글로 한 번에 보는 도감",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
