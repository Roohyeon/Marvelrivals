import { queryOptions } from "@tanstack/react-query";
import type { HeroListItem } from "./types";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} 요청 실패 (${res.status})`);
  return res.json() as Promise<T>;
}

// 데이터는 빌드 때 고정 → staleTime: "static" (Infinity 와 달리 "남은 시간" 계산에 Date.now()를 부르지 않아
// Cache Components 의 정적 미리 렌더링을 막지 않음)
export const heroListQuery = queryOptions({
  queryKey: ["heroes", "list"],
  queryFn: () => getJson<HeroListItem[]>("/api/heroes"),
  staleTime: "static",
});
