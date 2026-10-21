import { getHeroList } from "@/lib/data";

// 요청 정보를 쓰지 않으므로 빌드 때 미리 만들어지는 정적 응답 (Cache Components)
export async function GET() {
  return Response.json(getHeroList());
}
