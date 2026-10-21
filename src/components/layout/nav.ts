import { Home, LayoutGrid, ListOrdered, Map, UsersRound, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** 하단 탭바용 짧은 라벨 */
  shortLabel: string;
  icon: LucideIcon;
  /** 데스크톱 상단 메뉴에 표시 (홈은 로고로 대신) */
  inHeader: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", shortLabel: "홈", icon: Home, inHeader: false },
  { href: "/heroes", label: "영웅", shortLabel: "영웅", icon: LayoutGrid, inHeader: true },
  { href: "/tier", label: "티어", shortLabel: "티어", icon: ListOrdered, inHeader: true },
  { href: "/maps", label: "맵", shortLabel: "맵", icon: Map, inHeader: true },
  { href: "/team-builder", label: "팀 빌더", shortLabel: "팀", icon: UsersRound, inHeader: true },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
