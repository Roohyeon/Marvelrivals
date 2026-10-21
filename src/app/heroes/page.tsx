import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { HeroBrowserWithParams } from "@/components/heroes/HeroBrowser";
import { prefetchHeroList } from "@/lib/prefetch";

export const metadata: Metadata = {
  title: "영웅 목록",
  description: "마블 라이벌즈 영웅 54명을 역할·티어·성향·난이도로 찾아보세요. 한글·영문 이름 검색, 승률·체력·난이도 정렬.",
};

export default async function HeroesPage() {
  // 빌드 때 서버에서 미리 채워 HTML에 담음 → 브라우저는 /api/heroes 를 다시 요청하지 않고 같은 캐시를 씀
  const state = await prefetchHeroList();

  return (
    <HydrationBoundary state={state}>
      <HeroBrowserWithParams />
    </HydrationBoundary>
  );
}
