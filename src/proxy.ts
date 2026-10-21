import { NextResponse, type NextRequest } from "next/server";
import heroes from "@/data/heroes.json";

// 없는 영웅 주소(/heroes/없는-영웅)에 진짜 404 상태 코드를 돌려주기 위한 Proxy.
// 상세 페이지는 Cache Components 에서 요청 시점에 notFound()를 부르면 이미 스트리밍이 시작돼 200이 되므로,
// 렌더링 전에 slug 를 확인해 존재하지 않는 경로로 rewrite → 정적 404 페이지가 404 상태로 응답됨.
const SLUGS = new Set(heroes.map((h) => h.slug));

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !SLUGS.has(decodeURIComponent(slug))) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }
}

export const config = {
  // 영웅 상세만 (목록 /heroes, 이미지, _next 정적 파일 등은 거치지 않음)
  matcher: "/heroes/:slug",
};
