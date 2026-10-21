import { Info } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SourceNote } from "@/components/ui/Badges";
import { TierBoard } from "@/components/tier/TierBoard";
import { getStatRows, TIER_RULE } from "@/lib/meta";

export const metadata: Metadata = {
  title: "티어 리스트",
  description: "마블 라이벌즈 영웅 승률 기반 S~F 티어 (커뮤니티 통계, 시즌 10). 역할별로 걸러 보세요.",
};

export default function TierPage() {
  return (
    <Container className="py-6 xl:py-10">
      <h1 className="text-title font-bold xl:text-h1">티어 리스트</h1>
      <p className="mt-2 flex items-start gap-1.5 rounded-md bg-elevated px-3 py-2.5 text-caption text-secondary">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        승률 기반 커뮤니티 통계예요. 표본이 적은 영웅이 우연히 위로 오르지 않도록 보정한 승률이고, 랭크·모드에 따라 달라질 수
        있어요. 데드풀은 역할별로, 헐크는 사이트 표기상 브루스 배너로 집계됩니다.
      </p>
      <div className="mt-5">
        <TierBoard rows={getStatRows()} rules={TIER_RULE} />
      </div>
      <div className="mt-3">
        <SourceNote>커뮤니티 통계 · counterwatch.gg · 전 랭크·스탠다드 모드 · 2026-10-15 기준</SourceNote>
      </div>
    </Container>
  );
}
