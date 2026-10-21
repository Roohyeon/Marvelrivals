import Link from "next/link";

/** 텍스트 로고 — 게임 공식 로고는 저작권 때문에 쓰지 않고 직접 만든 표기 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span aria-hidden className="inline-block h-5 w-2.5 -skew-x-12 bg-brand" />
      <span className="text-[17px] leading-none">
        RIVALS <span className="text-brand-text xl:text-brand">DEX</span>
      </span>
    </Link>
  );
}
