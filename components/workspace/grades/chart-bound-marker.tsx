"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Info } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/shared/utils";

type ChartBoundMarkerOrientation = "horizontal" | "vertical";

export function ChartBoundMarker({
  description,
  orientation,
  positionPercent,
  title,
}: {
  description: string;
  orientation: ChartBoundMarkerOrientation;
  positionPercent: number;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tooltipHovered, setTooltipHovered] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const tooltipVisible = open || hovered || tooltipHovered;

  const tooltipContent = useMemo(
    () => (
      <div
        className="fixed z-[80] w-56 rounded-2xl border border-line/80 bg-surface/96 p-3 text-left shadow-[0_18px_42px_-24px_rgba(15,23,42,0.3)] backdrop-blur-xl"
        onMouseEnter={() => setTooltipHovered(true)}
        onMouseLeave={() => setTooltipHovered(false)}
        style={
          tooltipStyle
            ? {
                top: tooltipStyle.top,
                left: tooltipStyle.left,
              }
            : undefined
        }
      >
        <p className="text-[0.76rem] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[0.72rem] leading-5 text-ink-soft">
          {description}
        </p>
      </div>
    ),
    [description, title, tooltipStyle],
  );

  useEffect(() => {
    if (!tooltipVisible) {
      return;
    }

    function updateTooltipPosition() {
      const button = buttonRef.current;

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 224;
      const tooltipHeight = 88;
      const gap = 10;
      const preferredLeft =
        orientation === "vertical"
          ? rect.left - tooltipWidth - gap
          : rect.left + rect.width / 2 - tooltipWidth / 2;
      const nextLeft = Math.min(
        Math.max(preferredLeft, 12),
        viewportWidth - tooltipWidth - 12,
      );
      const preferredTop =
        orientation === "vertical"
          ? rect.top + rect.height / 2 - tooltipHeight / 2
          : rect.bottom + gap;
      const nextTop =
        orientation === "vertical"
          ? Math.min(
              Math.max(preferredTop, 12),
              viewportHeight - tooltipHeight - 12,
            )
          : preferredTop + tooltipHeight > viewportHeight - 12
            ? Math.max(rect.top - tooltipHeight - gap, 12)
            : preferredTop;

      setTooltipStyle({
        left: nextLeft,
        top: nextTop,
      });
    }

    updateTooltipPosition();
    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition, true);

    return () => {
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition, true);
    };
  }, [orientation, tooltipVisible]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  return (
    <div
      className={cn(
        "group absolute z-20",
        orientation === "vertical"
          ? "right-2 translate-y-1/2"
          : "-translate-x-1/2 top-1/2 -translate-y-1/2",
      )}
      ref={containerRef}
      style={
        orientation === "vertical"
          ? { bottom: `${positionPercent}%`, right: 0 }
          : { left: `${positionPercent}%` }
      }
    >
      <Button
        aria-label={title}
        className="h-6 w-6 rounded-full border border-line-strong/70 bg-surface/92 p-0 text-ink-soft shadow-sm backdrop-blur-sm hover:bg-surface hover:text-foreground"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        ref={buttonRef}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Info className="pointer-events-none h-3.5 w-3.5" />
      </Button>

      {typeof document !== "undefined" && tooltipVisible && tooltipStyle
        ? createPortal(tooltipContent, document.body)
        : null}
    </div>
  );
}
