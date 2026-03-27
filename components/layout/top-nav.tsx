import { BookOpenText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#f6f2ea]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-stone-50 shadow-card">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Gradeflow
            </p>
            <p className="text-sm text-stone-700">
              Clear academic progress, without the clutter.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full border border-stone-200 bg-white/70 px-4 py-2 text-sm text-stone-600">
            Spring planning, minus the spreadsheet fatigue
          </div>
          <Button size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            View live workspace
          </Button>
        </div>
      </div>
    </header>
  );
}
