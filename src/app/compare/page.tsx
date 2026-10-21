import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { CompareBoard } from "@/components/compare/CompareBoard";
import { Container } from "@/components/layout/Container";
import { prefetchCompareData } from "@/lib/prefetch";

export const metadata: Metadata = {
  title: "영웅 비교",
  description: "마블 라이벌즈 영웅 2~3명을 나란히 놓고 체력·궁극기 비용·주요 쿨타임·티어·조합 성향을 비교하세요.",
};

export default async function ComparePage() {
  const state = await prefetchCompareData();
  return (
    <Container className="py-6 xl:py-10">
      <h1 className="text-title font-bold xl:text-h1">영웅 비교</h1>
      <p className="mb-4 mt-1 text-caption text-secondary">2~3명을 나란히 놓고 수치를 비교해요</p>
      <HydrationBoundary state={state}>
        <CompareBoard />
      </HydrationBoundary>
    </Container>
  );
}
