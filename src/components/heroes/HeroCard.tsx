import { Star } from "lucide-react";
import Image from "next/image";
import { useCollectionStore } from "@/stores/collection-store";
import { PlaystyleBadge, TierBadge } from "@/components/ui/Badges";
import { RoleIcon } from "@/components/ui/RoleIcon";
import type { HeroListItem, HeroListStat, Role } from "@/lib/types";

// 배경: 위쪽은 기본 면, 아래로 역할색이 은은하게 섞임
const ROLE_GRADIENT: Record<Role, string> = {
  vanguard: "to-vanguard-soft",
  duelist: "to-duelist-soft",
  strategist: "to-strategist-soft",
};

interface HeroCardProps {
  hero: HeroListItem;
  stat: HeroListStat;
  selected: boolean;
  index: number;
  onSelect: (slug: string) => void;
}

/**
 * 영웅 카드 — 하나의 마크업이 화면 너비에 따라 모양을 바꿉니다.
 * - 모바일·태블릿: 정사각 얼굴 카드(이미지 상단만 잘라 보여줌) + 아래 이름
 * - 데스크톱(xl~): 오른쪽으로 기운 세로 카드(skewX -6°) + 이름 띠 + 아래 티어·성향 배지
 */
export function HeroCard({ hero, stat, selected, index, onSelect }: HeroCardProps) {
  const role = stat.variantRole ?? hero.roles[0];
  return (
    <li className="card-enter" style={{ "--enter-delay": `${Math.min(index * 40, 600)}ms` } as React.CSSProperties}>
      <button
        type="button"
        onClick={() => onSelect(hero.slug)}
        aria-label={`${hero.nameKo} 미리보기`}
        data-selected={selected || undefined}
        className="group block w-full text-left outline-none"
      >
        <div
          className={`relative aspect-square overflow-hidden rounded-sm bg-linear-to-b from-portrait-from ${ROLE_GRADIENT[role]} transition-[translate,scale,box-shadow] duration-200 ease-out group-focus-visible:shadow-selected group-active:scale-[0.97] xl:aspect-[3/4] xl:-skew-x-6 xl:rounded-none xl:group-hover:-translate-y-1 xl:group-data-selected:scale-[1.08] xl:group-data-selected:shadow-selected motion-reduce:transition-none motion-reduce:xl:group-data-selected:scale-100`}
        >
          <div className="absolute inset-0 xl:skew-x-6 xl:scale-110">
            <Image
              src={`/images/heroes/${hero.slug}.png`}
              alt={`${hero.nameKo} 전신 이미지`}
              fill
              loading={index < 8 ? "eager" : "lazy"}
              fetchPriority={index < 4 ? "high" : "auto"}
              sizes="(min-width: 1536px) 180px, (min-width: 1280px) 200px, (min-width: 768px) 16vw, 25vw"
              className="object-cover object-[50%_12%] transition-transform duration-200 ease-out xl:object-top xl:group-hover:scale-105 motion-reduce:transition-none"
            />
          </div>

          <FavoriteMark slug={hero.slug} />

          {/* 모바일: 오른쪽 아래 티어 미니 배지 */}
          <span className="absolute bottom-1 right-1 xl:hidden">
            <TierBadge tier={stat.tier} size="sm" />
          </span>

          {/* 데스크톱: 하단 이름 띠 + 역할 아이콘 */}
          <span className="absolute inset-x-0 bottom-0 hidden items-center justify-between gap-1 bg-card-label px-3 py-2 text-white xl:flex">
            <span className="skew-x-6 truncate text-label font-bold">{hero.nameKo}</span>
            <RoleIcon role={role} className="size-3.5 shrink-0 skew-x-6 opacity-90" />
          </span>

          {/* 선택됨: 오른쪽 위 노란 사선 장식 */}
          <span
            aria-hidden
            className="absolute right-0 top-0 hidden size-6 bg-selected [clip-path:polygon(0_0,100%_0,100%_100%)] xl:group-data-selected:block"
          />
        </div>

        {/* 모바일: 아래 이름 (최대 5자 정도, 넘치면 말줄임) */}
        <span className="mt-1 block truncate text-center text-tiny font-medium text-primary xl:hidden">{hero.nameKo}</span>

        {/* 데스크톱: 티어·성향 배지 */}
        <span className="mt-3 hidden items-center gap-1.5 pl-1 xl:flex">
          <TierBadge tier={stat.tier} size="sm" />
          {stat.playstyles.map((p) => (
            <PlaystyleBadge key={p} playstyle={p} showLabel={false} />
          ))}
        </span>
      </button>
    </li>
  );
}

export function HeroCardSkeleton() {
  return (
    <li aria-hidden>
      <div className="aspect-square animate-pulse rounded-sm bg-elevated xl:aspect-[3/4] xl:-skew-x-6 xl:rounded-none" />
      <div className="mx-auto mt-1 h-3 w-3/4 animate-pulse rounded bg-elevated xl:mt-3 xl:h-5 xl:w-1/2" />
    </li>
  );
}

/** 즐겨찾기한 영웅: 왼쪽 위 ★ 배지 */
function FavoriteMark({ slug }: { slug: string }) {
  const on = useCollectionStore((s) => s.favorites.includes(slug));
  if (!on) return null;
  return (
    <span className="absolute left-1 top-1 inline-flex size-5 items-center justify-center rounded-full bg-accent text-white xl:left-2 xl:top-2 xl:skew-x-6">
      <Star className="size-3 fill-current" aria-hidden />
      <span className="sr-only">즐겨찾기</span>
    </span>
  );
}
