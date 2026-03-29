import {
  Assessment,
  Module,
  GradeBand,
  GroupedAssessment,
  RequiredScoreResult,
  Semester,
  SingleAssessment,
} from "@/lib/types";
import { getGroupedAssessmentDefinition } from "@/lib/grouped-assessment-utils";

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function isGroupedAssessment(
  assessment: Assessment,
): assessment is GroupedAssessment {
  return assessment.kind === "group";
}

export function isSingleAssessment(
  assessment: Assessment,
): assessment is SingleAssessment {
  return assessment.kind === "single";
}

function getSinglePercent(assessment: SingleAssessment) {
  if (assessment.scoreAchieved === null || assessment.totalPossible <= 0) {
    return null;
  }

  return (assessment.scoreAchieved / assessment.totalPossible) * 100;
}

export function getGroupedAssessmentMetrics(assessment: GroupedAssessment) {
  const gradedItems = assessment.items.filter(
    (item) => item.scoreAchieved !== null,
  );
  const sorted = [...gradedItems].sort((left, right) => {
    const leftPercent = (left.scoreAchieved ?? 0) / left.totalPossible;
    const rightPercent = (right.scoreAchieved ?? 0) / right.totalPossible;
    return leftPercent - rightPercent;
  });

  const appliedDropCount =
    gradedItems.length > assessment.dropLowest
      ? assessment.dropLowest
      : Math.max(gradedItems.length - 1, 0);
  const keptItems = sorted.slice(appliedDropCount);
  const keptAverage =
    keptItems.length > 0
      ? keptItems.reduce(
          (sum, item) => sum + (item.scoreAchieved ?? 0) / item.totalPossible,
          0,
        ) / keptItems.length
      : null;

  const effectiveItemCount = Math.max(
    assessment.items.length - assessment.dropLowest,
    1,
  );
  const currentWeight =
    (assessment.weight * keptItems.length) / effectiveItemCount;
  const weightedContribution = (keptAverage ?? 0) * currentWeight;
  const progressLabel = `${gradedItems.length}/${assessment.items.length} graded`;

  return {
    currentPercent: keptAverage === null ? null : round(keptAverage * 100),
    currentWeight: round(currentWeight, 2),
    weightedContribution: round(weightedContribution, 2),
    progressLabel,
    keptCount: keptItems.length,
    gradedCount: gradedItems.length,
    totalCount: assessment.items.length,
    dropCount: assessment.dropLowest,
    appliedDropCount,
    status:
      gradedItems.length >= assessment.items.length ? "completed" : "ongoing",
  };
}

export function getAssessmentCategoryLabel(assessment: Assessment) {
  if (isSingleAssessment(assessment)) {
    return assessment.category;
  }

  return getGroupedAssessmentDefinition(assessment.category).label;
}

export function getAssessmentPercent(assessment: Assessment) {
  if (isSingleAssessment(assessment)) {
    const percent = getSinglePercent(assessment);
    return percent === null ? null : round(percent);
  }

  return getGroupedAssessmentMetrics(assessment).currentPercent;
}

export function getAssessmentCurrentWeight(assessment: Assessment) {
  if (isSingleAssessment(assessment)) {
    return assessment.scoreAchieved === null ? 0 : assessment.weight;
  }

  return getGroupedAssessmentMetrics(assessment).currentWeight;
}

export function getAssessmentWeightedContribution(assessment: Assessment) {
  if (isSingleAssessment(assessment)) {
    const percent = getSinglePercent(assessment);
    return percent === null ? 0 : (percent / 100) * assessment.weight;
  }

  return getGroupedAssessmentMetrics(assessment).weightedContribution;
}

export function getAssessmentRemainingWeight(assessment: Assessment) {
  return round(
    Math.max(assessment.weight - getAssessmentCurrentWeight(assessment), 0),
    2,
  );
}

export function getAssessmentStatus(assessment: Assessment) {
  if (isSingleAssessment(assessment)) {
    return assessment.scoreAchieved === null ? "ongoing" : assessment.status;
  }

  return getGroupedAssessmentMetrics(assessment).status;
}

export function getCompletedWeight(module: Module) {
  return module.assessments.reduce((sum, assessment) => {
    return sum + getAssessmentCurrentWeight(assessment);
  }, 0);
}

export function getSecuredContribution(module: Module) {
  return module.assessments.reduce((sum, assessment) => {
    return sum + getAssessmentWeightedContribution(assessment);
  }, 0);
}

export function hasRecordedModuleGrade(module: Module) {
  return getCompletedWeight(module) > 0;
}

export function getModuleCurrentGrade(module: Module) {
  const completedWeight = getCompletedWeight(module);
  if (completedWeight === 0) {
    return 0;
  }

  return round((getSecuredContribution(module) / completedWeight) * 100);
}
export function getModuleGuaranteedGrade(module: Module) {
  return round(getSecuredContribution(module));
}

export function getRemainingWeight(module: Module) {
  return round(
    module.assessments.reduce((sum, assessment) => {
      return sum + getAssessmentRemainingWeight(assessment);
    }, 0),
    2,
  );
}

export function getSortedGradeBands(module: Module) {
  return [...module.gradeBands].sort(
    (left, right) => right.threshold - left.threshold,
  );
}

export function getGradeBandState(
  module: Module,
  band: GradeBand,
): "guaranteed" | "reachable" | "unreachable" {
  if (getModuleGuaranteedGrade(module) >= band.threshold) {
    return "guaranteed";
  }

  return calculateRequiredScore(module, band.threshold).achievable
    ? "reachable"
    : "unreachable";
}

export function calculateRequiredScore(
  module: Module,
  targetGrade: number,
): RequiredScoreResult {
  const securedContribution = getSecuredContribution(module);
  const remainingWeight = getRemainingWeight(module);
  const neededPoints = targetGrade - securedContribution;

  if (remainingWeight <= 0) {
    const achieved = round(securedContribution);
    return {
      achievable: achieved >= targetGrade,
      neededAverage: 0,
      neededPoints: 0,
      remainingWeight: 0,
      message:
        achieved >= targetGrade
          ? `This module is already closed above your ${targetGrade}% target.`
          : `This module is complete at ${achieved}%, below the ${targetGrade}% target.`,
    };
  }

  const neededAverage = round((neededPoints / remainingWeight) * 100);

  if (neededAverage <= 0) {
    return {
      achievable: true,
      neededAverage: 0,
      neededPoints: round(Math.max(neededPoints, 0)),
      remainingWeight,
      message: "You have already secured enough to finish above this target.",
    };
  }

  if (neededAverage > 100) {
    return {
      achievable: false,
      neededAverage,
      neededPoints: round(neededPoints),
      remainingWeight,
      message: `You would need ${neededAverage}% across the remaining work, which is not feasible.`,
    };
  }

  return {
    achievable: true,
    neededAverage,
    neededPoints: round(neededPoints),
    remainingWeight,
    message: `You need an average of ${neededAverage}% across the remaining ${remainingWeight}% of the module.`,
  };
}

export function getSemesterAverage(semester: Semester) {
  const gradedModules = semester.modules.filter(hasRecordedModuleGrade);
  const totalCredits = gradedModules.reduce(
    (sum, module) => sum + module.credits,
    0,
  );
  if (totalCredits === 0) {
    return 0;
  }

  const weighted = gradedModules.reduce((sum, module) => {
    return sum + getModuleCurrentGrade(module) * module.credits;
  }, 0);

  return round(weighted / totalCredits);
}

export function getSemesterGpa(semester: Semester) {
  const gradedModules = semester.modules.filter(hasRecordedModuleGrade);
  const totalCredits = gradedModules.reduce(
    (sum, module) => sum + module.credits,
    0,
  );
  if (totalCredits === 0) {
    return 0;
  }

  const weightedPoints = gradedModules.reduce((sum, module) => {
    return sum + gradeToGpa(getModuleCurrentGrade(module)) * module.credits;
  }, 0);

  return round(weightedPoints / totalCredits, 2);
}

export function gradeToGpa(grade: number) {
  if (grade >= 85) return 4;
  if (grade >= 80) return 3.7;
  if (grade >= 75) return 3.3;
  if (grade >= 70) return 3;
  if (grade >= 65) return 2.7;
  if (grade >= 60) return 2.3;
  if (grade >= 55) return 2;
  if (grade >= 50) return 1.7;
  return 0;
}
export function formatPercent(value: number) {
  return `${round(value)}%`;
}

export function getAssessmentPace(module: Module) {
  const completed = module.assessments.reduce((sum, assessment) => {
    return sum + (getAssessmentStatus(assessment) === "completed" ? 1 : 0);
  }, 0);

  return `${completed}/${module.assessments.length} done`;
}
