/**
 * 승률 양방향 막대 — 가운데가 50%, 이상은 초록이 오른쪽 / 미만은 빨강이 왼쪽
 * 표시 배율: ±5%p = 막대 절반 (이 데이터의 승률 범위 약 45~58%에 맞춘 값)
 */
export function WinRateBar({ rate, className = "" }: { rate: number; className?: string }) {
  const diff = Math.min(Math.abs(rate - 50) * 10, 50);
  const up = rate >= 50;
  return (
    <div
      className={`relative h-1 rounded-full bg-track ${className}`}
      role="img"
      aria-label={`승률 ${rate.toFixed(1)}% (50% ${up ? "이상" : "미만"})`}
    >
      <span className="absolute inset-y-0 left-1/2 w-px bg-muted" />
      <span
        className={`bar-grow absolute inset-y-0 rounded-full ${up ? "left-1/2 bg-positive" : "right-1/2 bg-negative"}`}
        style={{ width: `${diff}%` }}
      />
    </div>
  );
}

export function WinRateText({ rate, className = "" }: { rate: number; className?: string }) {
  return (
    <span className={`tabular font-bold ${rate >= 50 ? "text-positive" : "text-negative"} ${className}`}>
      {rate.toFixed(1)}%
    </span>
  );
}
