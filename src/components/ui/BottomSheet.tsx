"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** 스크린 리더용 제목 */
  label: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * 하단 시트 (모바일·태블릿 미리보기·필터)
 * - 네이티브 <dialog>.showModal(): 포커스 가두기, Esc 닫기, 닫으면 원래 버튼으로 포커스 복귀를 브라우저가 처리
 * - 손잡이를 아래로 끌면 닫힘, 위로 끌면 전체 높이로 펼침 (기본 60%)
 */
export function BottomSheet({ open, onClose, label, children, footer }: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);
  const drag = useRef<{ startY: number; pointerId: number } | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { startY: e.clientY, pointerId: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setDragY(e.clientY - drag.current.startY);
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    if (dragY > 80) {
      setExpanded(false);
      onClose();
    } else if (dragY < -60) {
      setExpanded(true);
    }
    setDragY(0);
  };

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={() => {
        setExpanded(false);
        onClose();
      }}
      // 어두운 배경(시트 바깥)을 누르면 닫기
      onClick={(e) => e.target === ref.current && onClose()}
      // 닫힌 <dialog>는 브라우저 기본값(display:none)으로 숨겨야 함 — 그냥 flex 를 주면 닫혀도 화면·키보드 탐색에 남음
      className={`sheet fixed inset-x-0 bottom-0 top-auto m-0 mx-auto w-full max-w-xl flex-col open:flex rounded-t-sheet bg-surface p-0 text-primary ${
        expanded ? "h-[92dvh]" : "h-[60dvh]"
      }`}
      style={dragY > 0 ? { translate: `0 ${dragY}px`, transition: "none" } : undefined}
    >
      <div
        className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span aria-hidden className="h-1.5 w-10 rounded-full bg-line" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>
      {footer && <div className="shrink-0 border-t border-line px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">{footer}</div>}
    </dialog>
  );
}
