import { create } from "zustand";
import { persist } from "zustand/middleware";

export const COMPARE_MAX = 3;

interface CollectionState {
  /** 즐겨찾기한 영웅 slug */
  favorites: string[];
  /** 비교 목록 영웅 slug (최대 3명) */
  compare: string[];
  toggleFavorite: (slug: string) => void;
  toggleCompare: (slug: string) => void;
  setCompare: (slugs: string[]) => void;
}

/** 즐겨찾기·비교 목록 — 기기에 저장 (기획서 F-09, F-10) */
export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      favorites: [],
      compare: [],
      toggleFavorite: (slug) =>
        set((s) => ({
          favorites: s.favorites.includes(slug) ? s.favorites.filter((v) => v !== slug) : [...s.favorites, slug],
        })),
      toggleCompare: (slug) =>
        set((s) => ({
          compare: s.compare.includes(slug)
            ? s.compare.filter((v) => v !== slug)
            : // 가득 차면 가장 먼저 넣은 영웅을 빼고 추가
              [...s.compare, slug].slice(-COMPARE_MAX),
        })),
      setCompare: (slugs) => set({ compare: slugs.slice(0, COMPARE_MAX) }),
    }),
    {
      name: "rivals-dex-collection",
      partialize: ({ favorites, compare }) => ({ favorites, compare }),
      // 서버 렌더(빈 목록)와 첫 화면을 맞추기 위해 StoreHydrator 가 마운트 직후 불러옴
      skipHydration: true,
    },
  ),
);
