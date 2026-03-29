"use client";

import Link from "next/link";
import { Calculator } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { AssessmentTable } from "@/components/workspace/assessment-table";
import { ExperimentModePill } from "@/components/workspace/experiment-mode-pill";
import { GradeBandPanel } from "@/components/workspace/grade-band-panel";
import { ModuleHeader } from "@/components/workspace/module-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Assessment } from "@/lib/types";

export function ModuleScreen({ moduleId }: { moduleId: string }) {
  const {
    semester,
    addAssessment,
    isExperimenting,
    reorderAssessments,
    startExperiment,
    stopExperiment,
    updateAssessment,
    updateModule,
  } = useWorkspace();
  const module = semester.modules.find((item) => item.id === moduleId) ?? null;

  function saveAssessment(nextModuleId: string, assessment: Assessment) {
    const exists = module?.assessments.some(
      (item) => item.id === assessment.id,
    );

    if (exists) {
      updateAssessment(nextModuleId, assessment);
      return;
    }

    addAssessment(nextModuleId, assessment);
  }

  function updateGradeBand(bandId: string, threshold: number) {
    if (!module) {
      return;
    }

    updateModule(module.id, {
      gradeBands: module.gradeBands.map((band) =>
        band.id === bandId
          ? { ...band, threshold: Math.min(Math.max(threshold || 0, 0), 100) }
          : band,
      ),
    });
  }

  if (!module) {
    return (
      <div className="mx-auto max-w-5xl px-5 pb-10 pt-6 sm:px-8">
        <EmptyState
          action={
            <Link
              className="inline-flex h-11 items-center rounded-full bg-stone-950 px-5 text-sm font-semibold text-stone-50"
              href="/workspace"
            >
              Back to semester
            </Link>
          }
          description="The selected module could not be found."
          icon={<Calculator className="h-5 w-5" />}
          title="Module unavailable"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto h-[calc(100vh-5.5rem)] max-w-7xl overflow-hidden px-5 py-4 sm:px-8">
      <div className="mb-4">
        <ModuleHeader
          module={module}
          onSaveModule={(nextModule) =>
            updateModule(module.id, {
              accent: nextModule.accent,
              code: nextModule.code,
              credits: nextModule.credits,
              gradeBands: module.gradeBands,
              instructor: nextModule.instructor,
              name: nextModule.name,
            })
          }
        />
      </div>

      {isExperimenting ? (
        <div className="mb-4">
          <ExperimentModePill onStop={stopExperiment} />
        </div>
      ) : null}

      <div className="grid h-[calc(100%-5.5rem)] min-h-0 gap-3 min-[900px]:grid-cols-[minmax(0,1fr)_560px] lg:gap-4">
        <div className="mt-7 grid min-h-0">
          <AssessmentTable
            module={module}
            isExperimenting={isExperimenting}
            onStartExperiment={startExperiment}
            onReorderAssessments={reorderAssessments}
            onSaveAssessment={saveAssessment}
          />
        </div>

        <div className="grid min-h-0 content-start gap-4 overflow-y-auto pr-1">
          <GradeBandPanel module={module} onUpdateGradeBand={updateGradeBand} />
        </div>
      </div>
    </div>
  );
}
