"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, NAV_ITEMS } from "./nav";

/** 모바일·태블릿 하단 탭바 5개 (엄지가 닿는 위치). 데스크톱(xl~)에서는 숨김 */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md xl:hidden"
    >
      <ul className="mx-auto grid h-tabbar max-w-xl grid-cols-5">
        {NAV_ITEMS.map(({ href, shortLabel, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 transition-[color,transform] duration-100 active:scale-[0.97] ${
                  active ? "text-accent-text" : "text-secondary hover:text-primary"
                }`}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                <span className={`text-tiny md:text-caption ${active ? "font-bold" : "font-medium"}`}>{shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
