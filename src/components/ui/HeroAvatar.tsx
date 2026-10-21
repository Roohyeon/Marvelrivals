import Image from "next/image";

/** 원형 영웅 아바타 (얼굴 부분만) */
export function HeroAvatar({ slug, size = 36, alt = "" }: { slug: string; size?: number; alt?: string }) {
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden rounded-full bg-elevated"
      style={{ width: size, height: size }}
    >
      <Image
        src={`/images/heroes/${slug}.png`}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover object-[50%_12%]"
      />
    </span>
  );
}
