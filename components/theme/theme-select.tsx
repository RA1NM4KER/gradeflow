"use client";

import { Check, MonitorCog, Moon, Sun } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";
import { ThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const themeOptions: {
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

function ThemeOptionsList({ onSelect }: { onSelect?: () => void }) {
  const { setTheme, theme } = useTheme();

  return (
    <>
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
              onSelect?.();
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
    </>
  );
}

export function ThemeModePanel({
  className,
  heading = "Theme",
}: {
  className?: string;
  heading?: ReactNode;
}) {
  return (
    <section className={cn("grid gap-3", className)}>
      {heading ? (
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {heading}
        </p>
      ) : null}
      <div className="grid gap-1.5 rounded-[18px] border border-white/24 bg-white/44 p-2 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/6">
        <ThemeOptionsList />
      </div>
    </section>
  );
}

export function ThemeSelect() {
  const { theme } = useTheme();
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
      <Button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Theme: ${selectedOption.label}`}
        onClick={() => setOpen((current) => !current)}
        size="icon-responsive"
        type="button"
        variant="ghost"
      >
        <SelectedIcon className="h-4 w-4" />
      </Button>

      {open ? (
        <div
          className="absolute left-1/2 top-[calc(100%+0.5rem)] z-40 w-48 -translate-x-1/2 overflow-hidden rounded-[18px] border border-line-strong bg-surface p-1.5 shadow-[0_22px_60px_-30px_rgba(15,23,42,0.3)] backdrop-blur-md dark:border-white/12 dark:bg-[rgba(19,21,26,0.88)] dark:shadow-[0_24px_70px_-28px_rgba(0,0,0,0.62),0_1px_0_rgba(255,255,255,0.06)_inset]"
          role="menu"
        >
          <ThemeOptionsList onSelect={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
