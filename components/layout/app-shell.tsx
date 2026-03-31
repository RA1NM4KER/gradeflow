import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-[#f5f5f3] text-stone-950",
        "[background-position:center_top]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-gradient-to-b from-white/55 via-white/15 to-transparent" />
      {children}
    </main>
  );
}
