import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "페이지를 찾을 수 없어요" };

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <p className="text-h1 font-extrabold text-muted">404</p>
      <h1 className="mt-2 text-title font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mt-1 text-body text-secondary">주소가 바뀌었거나 없는 영웅일 수 있어요.</p>
      <Link
        href="/heroes"
        className="mt-6 inline-flex h-12 items-center rounded-full bg-brand px-6 text-table font-bold text-on-brand"
      >
        영웅 목록으로 가기
      </Link>
    </Container>
  );
}
