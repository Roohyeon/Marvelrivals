import { Info } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { MapBoard } from "@/components/maps/MapBoard";
import { getMapCards, getMapModes } from "@/lib/meta";

export const metadata: Metadata = {
  title: "맵",
  description: "마블 라이벌즈 일반 모드 맵 18개 — 경쟁(도미네이션)·호송(콘보이)·경쟁+호송(컨버전스) 규칙과 맵별 승률 TOP5 영웅.",
};

export default function MapsPage() {
  return (
    <Container className="py-6 xl:py-10">
      <h1 className="text-title font-bold xl:text-h1">맵</h1>
      <p className="mt-2 flex items-start gap-1.5 text-caption text-secondary">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        빠른 대전·경쟁전 일반 모드 맵 18개 (위키 기준). 한글 맵 이름은 원문을 옮긴 비공식 표기예요.
      </p>
      <div className="mt-5">
        <MapBoard maps={getMapCards()} modes={getMapModes()} />
      </div>
    </Container>
  );
}
