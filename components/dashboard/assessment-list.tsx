"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CheckCircle2, CircleDashed, Dot } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPercent } from "@/lib/grade-utils";
import { Assessment } from "@/lib/types";

interface AssessmentListProps {
  assessments: Assessment[];
}

export function AssessmentList({ assessments }: AssessmentListProps) {
  const columns = useMemo<ColumnDef<Assessment>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Assessment",
        cell: ({ row }) => {
          const assessment = row.original;
          const statusIcon =
            assessment.status === "completed" ? (
              <CheckCircle2 className="h-4 w-4 text-stone-900" />
            ) : (
              <CircleDashed className="h-4 w-4 text-stone-500" />
            );

          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-100">
                {statusIcon}
              </div>
              <div>
                <p className="font-medium text-stone-900">{assessment.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  {assessment.category}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "dueDate",
        header: "Due",
      },
      {
        accessorKey: "weight",
        header: "Weight",
        cell: ({ row }) => <span>{formatPercent(row.original.weight)}</span>,
      },
      {
        id: "score",
        header: "Result",
        cell: ({ row }) => {
          const assessment = row.original;
          if (assessment.scoreAchieved === null) {
            return <span className="text-stone-400">Awaiting mark</span>;
          }

          const percent =
            (assessment.scoreAchieved / assessment.totalPossible) * 100;
          return (
            <div>
              <p className="font-medium text-stone-900">
                {assessment.scoreAchieved}/{assessment.totalPossible}
              </p>
              <p className="text-xs text-stone-500">{formatPercent(percent)}</p>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100/80 px-3 py-1 text-xs font-semibold capitalize text-stone-700">
            <Dot className="-ml-1 h-4 w-4" />
            {row.original.status}
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: assessments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Assessment breakdown</CardTitle>
          <CardDescription>
            Each weighting is explicit, so your progress stays auditable.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden pt-0">
        <div className="hidden overflow-hidden rounded-[24px] border border-stone-200 md:block">
          <table className="w-full text-left">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-[0.2em] text-stone-500">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-4 font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-stone-200/80 bg-white/75"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-5 py-4 text-sm text-stone-600"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="rounded-[24px] border border-stone-200 bg-white/80 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-stone-900">
                    {assessment.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                    {assessment.category}
                  </p>
                </div>
                <div className="rounded-full border border-stone-200 bg-stone-100/80 px-3 py-1 text-xs font-semibold capitalize text-stone-700">
                  {assessment.status}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-stone-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                    Due
                  </p>
                  <p className="mt-1">{assessment.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                    Weight
                  </p>
                  <p className="mt-1">{formatPercent(assessment.weight)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                    Result
                  </p>
                  <p className="mt-1">
                    {assessment.scoreAchieved === null
                      ? "Pending"
                      : `${assessment.scoreAchieved}/${assessment.totalPossible}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
