import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { TeamBuilder } from "@/components/team/TeamBuilder";
import { prefetchTeamData } from "@/lib/prefetch";

export const metadata: Metadata = {
  title: "팀 빌더",
  description: "영웅 6명을 골라 팀 성향(포킹·다이브·러쉬), 발동되는 협공, 상대 팀에 맞는 카운터 추천을 확인하세요.",
};

export default async function TeamBuilderPage() {
  const state = await prefetchTeamData();
  return (
    <HydrationBoundary state={state}>
      <TeamBuilder />
    </HydrationBoundary>
  );
}
