"use client";

import { ReactNode } from "react";

export function CoursesBootState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-5xl items-center justify-center px-5 py-8 sm:px-8">
      <div className="w-full max-w-xl">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
            <span className="absolute inset-[5px] rounded-full border-[3px] border-[#E8DBC3]/28" />
            <span className="absolute inset-[5px] rounded-full border-[3px] border-transparent border-t-[#E8DBC3] border-r-[#E8DBC3]/80 animate-[spin_2.8s_linear_infinite]" />
            <span className="absolute inset-[19px] rounded-full border-[3px] border-[#E8DBC3]/20" />
            <span className="absolute inset-[19px] rounded-full border-[3px] border-transparent border-b-[#E8DBC3]/95 border-l-[#E8DBC3]/70 animate-[spin_2.2s_linear_infinite_reverse]" />
            <span className="absolute inset-[33px] rounded-full border-[3px] border-[#FF6B6B]/18" />
            <span className="absolute inset-[33px] rounded-full border-[3px] border-transparent border-t-[#FF6B6B] border-l-[#FF6B6B]/75 shadow-[0_0_24px_rgba(255,107,107,0.28)] animate-[spin_1.6s_linear_infinite,pulse_2.2s_ease-in-out_infinite]" />
            <span className="absolute inset-[1px] rounded-full border border-white/30 dark:border-white/8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-[1.02rem] font-semibold tracking-tight text-foreground sm:text-lg">
              {title}
            </h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-ink-soft">
              {description}
            </p>
          </div>
          {!action ? null : (
            <div className="mt-6 flex justify-center">{action}</div>
          )}
        </div>
        <div className="mx-auto mt-8 h-px w-full max-w-sm bg-gradient-to-r from-transparent via-line to-transparent" />
        <div className="mx-auto mt-3 flex justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-line-strong animate-pulse" />
          <span
            className="h-1.5 w-1.5 rounded-full bg-ink-subtle animate-pulse"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-line-strong animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
