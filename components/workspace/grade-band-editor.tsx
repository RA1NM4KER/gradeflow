"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizePlainNumberInput } from "@/lib/numeric-input";
import { GradeBand } from "@/lib/types";

export const GRADE_BAND_PRESETS = [
  { label: "A+", threshold: 90 },
  { label: "A", threshold: 80 },
  { label: "A-", threshold: 75 },
  { label: "B+", threshold: 70 },
  { label: "B", threshold: 65 },
  { label: "B-", threshold: 60 },
  { label: "C+", threshold: 55 },
  { label: "C", threshold: 50 },
  { label: "C-", threshold: 45 },
  { label: "D+", threshold: 40 },
  { label: "D", threshold: 35 },
  { label: "D-", threshold: 30 },
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
        id: `grade-band-${label.toLowerCase().replace(/[^a-z0-9+-]/g, "")}`,
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
          <p className="text-sm font-semibold text-stone-950">
            Pick the grade bands you care about
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Choose only the cutoffs you want to track in the needed view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {GRADE_BAND_PRESETS.map((preset) => {
            const selected = bands.some((band) => band.label === preset.label);

            return (
              <button
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  selected
                    ? "border-stone-950 bg-stone-950 text-stone-50"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"
                }`}
                key={preset.label}
                onClick={() => toggleBand(preset.label)}
                type="button"
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-950">Set cutoffs</p>
          <p className="mt-1 text-sm text-stone-500">
            Default values are filled in. Adjust anything you want.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {orderedBands.map((band) => (
            <div
              className="rounded-[20px] border border-stone-200 bg-white p-3.5"
              key={band.id}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-950">
                    {band.label}
                  </p>
                  <p className="text-xs text-stone-500">Minimum percent</p>
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
