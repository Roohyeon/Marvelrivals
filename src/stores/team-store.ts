import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Side = "ally" | "enemy";

interface TeamState {
  ally: string[];
  enemy: string[];
  side: Side;
  setTeam: (side: Side, ids: string[]) => void;
  setSide: (side: Side) => void;
  reset: () => void;
}

/** 팀 구성은 기기에 저장되어 다시 들어와도 남아 있음 (기획서 6-5) */
export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      ally: [],
      enemy: [],
      side: "ally",
      setTeam: (side, ids) => set(side === "ally" ? { ally: ids } : { enemy: ids }),
      setSide: (side) => set({ side }),
      reset: () => set({ ally: [], enemy: [], side: "ally" }),
    }),
    {
      name: "rivals-dex-team",
      partialize: ({ ally, enemy }) => ({ ally, enemy }),
      // 서버 렌더(빈 팀)와 첫 화면을 맞추고, URL 공유 링크가 있으면 그쪽을 우선하기 위해 직접 불러옴
      skipHydration: true,
    },
  ),
);
