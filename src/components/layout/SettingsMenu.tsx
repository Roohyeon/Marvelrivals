"use client";

import { Info, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ThemeSelect } from "@/components/theme/ThemeSelect";

/** 상단 바 ⚙ → 테마(시스템·라이트·다크) + 소개 링크 */
export function SettingsMenu({ buttonClassName = "" }: { buttonClassName?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="설정"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex size-11 items-center justify-center rounded-full transition-colors ${buttonClassName}`}
      >
        <Settings className="size-5" aria-hidden />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-panel border border-line bg-surface p-4 text-primary shadow-panel"
        >
          <p className="mb-2 text-caption font-bold text-secondary">테마</p>
          <ThemeSelect />
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="mt-4 flex min-h-11 items-center gap-2 rounded-md px-2 text-table hover:bg-elevated"
          >
            <Info className="size-4 text-secondary" aria-hidden />
            소개 · 데이터 출처
          </Link>
        </div>
      )}
    </div>
  );
}
