"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { isActive, NAV_ITEMS } from "./nav";
import { SettingsMenu } from "./SettingsMenu";

// 모바일·태블릿: 반투명 상단 바(로고 + 검색·테마·설정)
// 데스크톱(xl~): 짙은 회색 게임 헤더 + 메뉴, 활성 메뉴는 흰 글자 + 아래 노란 막대 3px
const iconButton = "text-primary hover:bg-elevated xl:text-white xl:hover:bg-white/10";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur-md xl:border-transparent xl:bg-header xl:backdrop-blur-none">
      <Container className="flex h-14 items-center gap-6">
        <Logo className="text-primary xl:text-white" />

        <nav aria-label="주 메뉴" className="hidden h-full xl:block">
          <ul className="flex h-full items-stretch gap-1">
            {NAV_ITEMS.filter((item) => item.inHeader).map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-full items-center px-4 text-[15px] font-semibold transition-colors ${
                      active ? "text-white" : "text-white/65 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-[3px] bg-selected" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/heroes?focus=search"
            aria-label="영웅 검색"
            className={`inline-flex size-11 items-center justify-center rounded-full transition-colors ${iconButton}`}
          >
            <Search className="size-5" aria-hidden />
          </Link>
          <ThemeToggle className={iconButton} />
          <SettingsMenu buttonClassName={iconButton} />
        </div>
      </Container>
    </header>
  );
}
