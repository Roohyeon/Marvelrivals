"use client";

import { useEffect } from "react";
import { useCollectionStore } from "@/stores/collection-store";

/** 기기에 저장된 즐겨찾기·비교 목록을 첫 렌더 뒤에 불러옴 (하이드레이션 불일치 방지) */
export function StoreHydrator() {
  useEffect(() => {
    void useCollectionStore.persist.rehydrate();
  }, []);
  return null;
}
