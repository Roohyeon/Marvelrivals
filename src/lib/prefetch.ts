import "server-only";

import { dehydrate, QueryClient, type DehydratedState } from "@tanstack/react-query";
import { cacheLife } from "next/cache";
import { getHeroList } from "./data";
import { heroListQuery } from "./queries";

/**
 * 서버 미리 채움 결과(dehydrated state)를 만들어 캐시합니다.
 *
 * TanStack Query 는 데이터를 넣을 때 Date.now()(받은 시각)를 기록하는데,
 * Cache Components 에서는 시간처럼 매번 바뀌는 값이 있으면 페이지를 미리 만들 수 없습니다.
 * "use cache" 로 감싸면 빌드 때 한 번 계산한 값이 고정되어 정적 페이지로 만들어집니다.
 */
export async function prefetchHeroList(): Promise<DehydratedState> {
  "use cache";
  cacheLife("max"); // 데이터는 다시 빌드할 때만 바뀜
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ ...heroListQuery, queryFn: getHeroList });
  return dehydrate(queryClient);
}
