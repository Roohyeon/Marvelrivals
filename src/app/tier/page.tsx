import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "티어" };

export default function Page() {
  return <PagePlaceholder title="티어" stage="6단계" />;
}
