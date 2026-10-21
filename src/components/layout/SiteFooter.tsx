import Link from "next/link";
import { Container } from "./Container";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface py-8 text-caption text-secondary">
      <Container className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p>
          Marvel Rivals 및 캐릭터 이미지의 저작권은 NetEase Games / Marvel에 있으며, 본 사이트는 비상업적
          포트폴리오입니다.
        </p>
        <p className="flex shrink-0 gap-3">
          <span>데이터 수집 2026-10-15</span>
          <Link href="/about" className="underline underline-offset-2 hover:text-primary">
            데이터 출처
          </Link>
        </p>
      </Container>
    </footer>
  );
}
