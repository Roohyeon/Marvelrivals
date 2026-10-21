"use client";

import { Columns3, Star } from "lucide-react";
import Link from "next/link";
import { COMPARE_MAX, useCollectionStore } from "@/stores/collection-store";

/** 즐겨찾기 ★ 토글 */
export function FavoriteButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const on = useCollectionStore((s) => s.favorites.includes(slug));
  const toggle = useCollectionStore((s) => s.toggleFavorite);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={on}
      aria-label={on ? `${name} 즐겨찾기 해제` : `${name} 즐겨찾기`}
      className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-label font-semibold transition-colors ${
        on ? "border-meta bg-meta/10 text-meta" : "border-line bg-surface text-primary hover:bg-elevated"
      } ${className}`}
    >
      <Star className={`size-4 ${on ? "fill-current" : ""}`} aria-hidden />
      즐겨찾기
    </button>
  );
}

/** 비교에 추가/빼기 + 비교 화면 바로가기 */
export function CompareButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const list = useCollectionStore((s) => s.compare);
  const toggle = useCollectionStore((s) => s.toggleCompare);
  const on = list.includes(slug);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => toggle(slug)}
        aria-pressed={on}
        aria-label={on ? `${name} 비교에서 빼기` : `${name} 비교에 추가`}
        className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-label font-semibold transition-colors ${
          on ? "border-accent bg-accent/10 text-accent-text" : "border-line bg-surface text-primary hover:bg-elevated"
        }`}
      >
        <Columns3 className="size-4" aria-hidden />
        {on ? "비교 중" : "비교에 추가"}
      </button>
      {list.length > 0 && (
        <Link href="/compare" className="inline-flex h-10 items-center rounded-full px-2 text-label font-semibold text-accent-text hover:underline">
          비교 보기 {list.length}/{COMPARE_MAX}
        </Link>
      )}
    </span>
  );
}
