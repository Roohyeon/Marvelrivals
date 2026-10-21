import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "맵" };

export default function Page() {
  return <PagePlaceholder title="맵" stage="6단계" />;
}
