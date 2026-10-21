import { Star } from "lucide-react";

export function DifficultyStars({ value }: { value: number | null }) {
  if (value === null) return <span className="text-secondary">위키 미기재</span>;
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`난이도 ${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={`size-3.5 ${n <= value ? "fill-meta text-meta" : "fill-track text-track"}`}
        />
      ))}
    </span>
  );
}
