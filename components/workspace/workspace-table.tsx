"use client";

import {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export function WorkspaceTableFrame({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-auto rounded-[18px] bg-[#fbfbfa] shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function WorkspaceTable({
  children,
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cn("w-full table-fixed text-left", className)} {...props}>
      {children}
    </table>
  );
}

export function WorkspaceTableHeader({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "sticky top-0 bg-[#f7f7f5] text-xs uppercase tracking-[0.14em] text-stone-500",
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function WorkspaceTableHeaderCell({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("px-3 py-3 font-semibold lg:px-5 lg:py-4", className)}
      {...props}
    />
  );
}

export function WorkspaceTableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-t border-stone-100 bg-[#fbfbfa]", className)}
      {...props}
    />
  );
}

export function WorkspaceTableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-3 py-3 lg:px-5 lg:py-4", className)} {...props} />
  );
}
