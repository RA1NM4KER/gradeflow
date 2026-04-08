"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizePlainNumberInput } from "@/lib/assessments/numeric-input";
import { GradeBand } from "@/lib/shared/types";
import { createUuid } from "@/lib/shared/uuid";

export const GRADE_BAND_PRESETS = [
  { label: "A+", threshold: 90 },
  { label: "A", threshold: 80 },
  { label: "A-", threshold: 75 },
  { label: "B+", threshold: 75 },
  { label: "B", threshold: 70 },
  { label: "B-", threshold: 65 },
  { label: "C+", threshold: 65 },
  { label: "C", threshold: 60 },
  { label: "C-", threshold: 55 },
  { label: "D+", threshold: 55 },
  { label: "D", threshold: 50 },
  { label: "D-", threshold: 45 },
  { label: "F", threshold: 0 },
] as const;

interface GradeBandEditorProps {
  bands: GradeBand[];
  onChange: (bands: GradeBand[]) => void;
}

export function GradeBandEditor({ bands, onChange }: GradeBandEditorProps) {
  const orderedBands = bands
    .slice()
    .sort(
      (left, right) => getPresetIndex(left.label) - getPresetIndex(right.label),
    );

  function toggleBand(label: string) {
    const existing = bands.find((band) => band.label === label);

    if (existing) {
      onChange(bands.filter((band) => band.label !== label));
      return;
    }

    const preset =
      GRADE_BAND_PRESETS.find((band) => band.label === label) ??
      GRADE_BAND_PRESETS[0];

    onChange([
      ...bands,
      {
        id: createUuid(),
        label: preset.label,
        threshold: preset.threshold,
      },
    ]);
  }

  function updateThreshold(label: string, value: string) {
    onChange(
      bands.map((band) =>
        band.label !== label
          ? band
          : {
              ...band,
              threshold: Number(sanitizePlainNumberInput(value) || 0),
            },
      ),
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Pick the grade bands you care about
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Choose only the cutoffs you want to track in the needed view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {GRADE_BAND_PRESETS.map((preset) => {
            const selected = bands.some((band) => band.label === preset.label);

            return (
              <Button
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/24 bg-white/28 text-ink-soft hover:border-white/35 hover:bg-white/42 hover:text-foreground dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/8"
                }`}
                key={preset.label}
                onClick={() => toggleBand(preset.label)}
                size={null}
                type="button"
                variant="ghost"
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Set cutoffs</p>
          <p className="mt-1 text-sm text-ink-soft">
            Default values are filled in. Adjust anything you want.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {orderedBands.map((band) => (
            <div
              className="rounded-[20px] border border-white/24 bg-white/34 p-3.5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
              key={band.id}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {band.label}
                  </p>
                  <p className="text-xs text-ink-soft">Minimum percent</p>
                </div>
                <div className="w-24 space-y-2">
                  <Label className="sr-only" htmlFor={`grade-band-${band.id}`}>
                    {band.label} cutoff
                  </Label>
                  <Input
                    className="text-center"
                    id={`grade-band-${band.id}`}
                    inputMode="decimal"
                    onChange={(event) =>
                      updateThreshold(band.label, event.target.value)
                    }
                    type="text"
                    value={String(band.threshold)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getPresetIndex(label: string) {
  const index = GRADE_BAND_PRESETS.findIndex(
    (preset) => preset.label === label,
  );
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
