"use client";

import { ReactNode } from "react";

export function WorkspaceBootState({
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
          <div className="relative mb-5 flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-stone-200 bg-white/80" />
            <span className="absolute inset-[7px] rounded-full border-2 border-stone-200 border-t-stone-700 animate-spin" />
            <span className="absolute h-1.5 w-1.5 rounded-full bg-stone-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-[1.02rem] font-semibold tracking-tight text-stone-900 sm:text-lg">
              {title}
            </h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-stone-500">
              {description}
            </p>
          </div>
          {!action ? null : (
            <div className="mt-6 flex justify-center">{action}</div>
          )}
        </div>
        <div className="mx-auto mt-8 h-px w-full max-w-sm bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
        <div className="mx-auto mt-3 flex justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-stone-300 animate-pulse" />
          <span
            className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-pulse"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-stone-300 animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
