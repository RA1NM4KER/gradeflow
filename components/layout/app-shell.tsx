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
        "min-h-screen bg-[#f6f2ea] bg-paper-grid bg-[size:34px_34px] text-stone-950",
        "[background-position:center_top]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_56%)]" />
      {children}
    </main>
  );
}
