import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "팀 빌더" };

export default function Page() {
  return <PagePlaceholder title="팀 빌더" stage="7단계" />;
}
