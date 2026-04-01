"use client";

import { Check, MonitorCog, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { ThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";

const themeOptions: {
  icon: typeof MonitorCog;
  label: string;
  value: ThemeMode;
}[] = [
  {
    icon: MonitorCog,
    label: "System",
    value: "system",
  },
  {
    icon: Sun,
    label: "Light",
    value: "light",
  },
  {
    icon: Moon,
    label: "Dark",
    value: "dark",
  },
];

export function ThemeSelect() {
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption =
    themeOptions.find((option) => option.value === theme) ?? themeOptions[0];
  const SelectedIcon = selectedOption.icon;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Theme: ${selectedOption.label}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/28 bg-white/52 text-foreground shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm transition hover:bg-white/72 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14 sm:h-10 sm:w-10"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <SelectedIcon className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className="absolute left-1/2 top-[calc(100%+0.5rem)] z-40 w-48 -translate-x-1/2 overflow-hidden rounded-[18px] border border-line-strong bg-surface p-1.5 shadow-[0_22px_60px_-30px_rgba(15,23,42,0.3)] backdrop-blur-md dark:border-white/12 dark:bg-[rgba(19,21,26,0.88)] dark:shadow-[0_24px_70px_-28px_rgba(0,0,0,0.62),0_1px_0_rgba(255,255,255,0.06)_inset]"
          role="menu"
        >
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            const isActive = option.value === theme;

            return (
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2 text-left text-sm transition",
                  isActive
                    ? "bg-surface-muted text-foreground dark:bg-white/12 dark:text-white"
                    : "text-ink-soft hover:bg-surface-muted hover:text-foreground dark:text-ink-strong dark:hover:bg-white/8 dark:hover:text-white",
                )}
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                role="menuitemradio"
                type="button"
              >
                <OptionIcon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1">{option.label}</span>
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive
                      ? "opacity-100 text-foreground dark:text-white"
                      : "opacity-0",
                  )}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
