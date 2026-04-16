import {
  ASSESSMENT_KIND_SINGLE,
  ASSESSMENT_STATUS_COMPLETED,
  ASSESSMENT_STATUS_ONGOING,
  Assessment,
  Course,
  GRADE_BAND_STATE_GUARANTEED,
  GRADE_BAND_STATE_REACHABLE,
  GRADE_BAND_STATE_UNREACHABLE,
  GradeBand,
  GradeBandState,
  GroupedAssessment,
  RequiredScoreResult,
  Semester,
  SingleAssessment,
  SUBMINIMUM_STATUS_FAILED,
  SUBMINIMUM_STATUS_MET,
  SUBMINIMUM_STATUS_PENDING,
  SubminimumRequirement,
} from "@/lib/shared/types";

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function parsePercentInput(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  if (trimmed.includes("/")) {
    const [left, right] = trimmed
      .split("/")
      .map((part) => Number(normalizeDecimalPart(part)));

    if (Number.isFinite(left) && Number.isFinite(right) && right > 0) {
      return round((left / right) * 100);
    }

    return null;
  }

  const numeric = Number(normalizeDecimalPart(trimmed.replace("%", "")));
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric;
}

function normalizeDecimalPart(value: string) {
  return value.trim().replace(/,/g, ".");
}

export function formatEditablePercent(
  scoreAchieved: number,
  totalPossible: number,
) {
  if (totalPossible <= 0) {
    return String(scoreAchieved);
  }

  return String(round((scoreAchieved / totalPossible) * 100));
}

export function isSingleAssessment(
  assessment: Assessment,
): assessment is SingleAssessment {
  return assessment.kind === ASSESSMENT_KIND_SINGLE;
}

function getSinglePercent(assessment: SingleAssessment) {
  if (assessment.scoreAchieved === null || assessment.totalPossible <= 0) {
    return null;
  }

  return (assessment.scoreAchieved / assessment.totalPossible) * 100;
}

function getSingleSubminimumRequirement(
  assessment: SingleAssessment,
): SubminimumRequirement | null {
  if (
    assessment.subminimumPercent === null ||
    assessment.subminimumPercent <= 0
  ) {
    return null;
  }

  const achievedPercent = getSinglePercent(assessment);

  return {
    achievedPercent: achievedPercent === null ? null : round(achievedPercent),
    assessmentId: assessment.id,
    assessmentName: assessment.name,
    minimumPercent: round(assessment.subminimumPercent),
    status:
      achievedPercent === null
        ? SUBMINIMUM_STATUS_PENDING
        : achievedPercent >= assessment.subminimumPercent
          ? SUBMINIMUM_STATUS_MET
          : SUBMINIMUM_STATUS_FAILED,
  };
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
      gradedItems.length >= assessment.items.length
        ? ASSESSMENT_STATUS_COMPLETED
        : ASSESSMENT_STATUS_ONGOING,
  };
}
export function getAssessmentPercent(assessment: Assessment) {
  if (isSingleAssessment(assessment)) {
    const percent = getSinglePercent(assessment);
    return percent === null ? null : round(percent);
  }

  return getGroupedAssessmentMetrics(assessment).currentPercent;
}

export function getCourseSubminimumRequirements(course: Course) {
  return course.assessments.flatMap((assessment) => {
    if (!isSingleAssessment(assessment)) {
      return [];
    }

    const requirement = getSingleSubminimumRequirement(assessment);
    return requirement ? [requirement] : [];
  });
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
    return assessment.scoreAchieved === null
      ? ASSESSMENT_STATUS_ONGOING
      : assessment.status;
  }

  return getGroupedAssessmentMetrics(assessment).status;
}

export function getCompletedWeight(course: Course) {
  return course.assessments.reduce((sum, assessment) => {
    return sum + getAssessmentCurrentWeight(assessment);
  }, 0);
}

export function getAssignedWeight(course: Course) {
  return round(
    course.assessments.reduce((sum, assessment) => {
      return sum + assessment.weight;
    }, 0),
    2,
  );
}

export function getSecuredContribution(course: Course) {
  return course.assessments.reduce((sum, assessment) => {
    return sum + getAssessmentWeightedContribution(assessment);
  }, 0);
}

export function hasRecordedCourseGrade(course: Course) {
  return getCompletedWeight(course) > 0;
}

export function getCourseCurrentGrade(course: Course) {
  const completedWeight = getCompletedWeight(course);
  if (completedWeight === 0) {
    return 0;
  }

  return round((getSecuredContribution(course) / completedWeight) * 100);
}
export function getCourseGuaranteedGrade(course: Course) {
  return round(getSecuredContribution(course));
}

export function getRemainingWeight(course: Course) {
  return round(
    course.assessments.reduce((sum, assessment) => {
      return sum + getAssessmentRemainingWeight(assessment);
    }, 0),
    2,
  );
}

export function getSortedGradeBands(course: Course) {
  return [...course.gradeBands].sort(
    (left, right) => right.threshold - left.threshold,
  );
}

export function getGradeBandState(
  course: Course,
  band: GradeBand,
): GradeBandState {
  const result = calculateRequiredScore(course, band.threshold);

  if (!result.achievable) {
    return GRADE_BAND_STATE_UNREACHABLE;
  }

  if (
    getCourseGuaranteedGrade(course) >= band.threshold &&
    !result.hasPendingSubminimums
  ) {
    return GRADE_BAND_STATE_GUARANTEED;
  }

  return GRADE_BAND_STATE_REACHABLE;
}

export function calculateRequiredScore(
  course: Course,
  targetGrade: number,
): RequiredScoreResult {
  const subminimumRequirements = getCourseSubminimumRequirements(course);
  const hasFailedSubminimums = subminimumRequirements.some(
    (requirement) => requirement.status === SUBMINIMUM_STATUS_FAILED,
  );
  const hasPendingSubminimums = subminimumRequirements.some(
    (requirement) => requirement.status === SUBMINIMUM_STATUS_PENDING,
  );
  const securedContribution = getSecuredContribution(course);
  const remainingWeight = getRemainingWeight(course);
  const neededPoints = targetGrade - securedContribution;

  if (hasFailedSubminimums) {
    const failedRequirements = subminimumRequirements.filter(
      (requirement) => requirement.status === SUBMINIMUM_STATUS_FAILED,
    );
    const failedLabel = failedRequirements
      .map(
        (requirement) =>
          `${requirement.assessmentName} needs ${requirement.minimumPercent}%`,
      )
      .join("; ");

    return {
      achievable: false,
      hasFailedSubminimums,
      hasPendingSubminimums,
      neededAverage: 0,
      neededPoints: round(Math.max(neededPoints, 0)),
      remainingWeight,
      subminimumRequirements,
      message: `This target is blocked by subminimum rules: ${failedLabel}.`,
    };
  }

  if (remainingWeight <= 0) {
    const achieved = round(securedContribution);
    return {
      achievable: achieved >= targetGrade && !hasFailedSubminimums,
      hasFailedSubminimums,
      hasPendingSubminimums,
      neededAverage: 0,
      neededPoints: 0,
      remainingWeight: 0,
      subminimumRequirements,
      message:
        achieved >= targetGrade
          ? `This course is already closed above your ${targetGrade}% target.`
          : `This course is complete at ${achieved}%, below the ${targetGrade}% target.`,
    };
  }

  const neededAverage = round((neededPoints / remainingWeight) * 100);

  if (neededAverage <= 0) {
    return {
      achievable: true,
      hasFailedSubminimums,
      hasPendingSubminimums,
      neededAverage: 0,
      neededPoints: round(Math.max(neededPoints, 0)),
      remainingWeight,
      subminimumRequirements,
      message: hasPendingSubminimums
        ? "You have already secured enough on average, but you still need to satisfy the remaining subminimums."
        : "You have already secured enough to finish above this target.",
    };
  }

  if (neededAverage > 100) {
    return {
      achievable: false,
      hasFailedSubminimums,
      hasPendingSubminimums,
      neededAverage,
      neededPoints: round(neededPoints),
      remainingWeight,
      subminimumRequirements,
      message: `You would need ${neededAverage}% across the remaining work, which is not feasible.`,
    };
  }

  return {
    achievable: true,
    hasFailedSubminimums,
    hasPendingSubminimums,
    neededAverage,
    neededPoints: round(neededPoints),
    remainingWeight,
    subminimumRequirements,
    message: hasPendingSubminimums
      ? `You need an average of ${neededAverage}% across the remaining ${remainingWeight}% of the course, while still meeting the subminimum rules.`
      : `You need an average of ${neededAverage}% across the remaining ${remainingWeight}% of the course.`,
  };
}

export function getSemesterAverage(semester: Semester) {
  const gradedCourses = semester.courses.filter(hasRecordedCourseGrade);
  const totalCredits = gradedCourses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  if (totalCredits === 0) {
    return 0;
  }

  const weighted = gradedCourses.reduce((sum, course) => {
    return sum + getCourseCurrentGrade(course) * course.credits;
  }, 0);

  return round(weighted / totalCredits);
}

export function getSemesterGpa(semester: Semester) {
  const gradedCourses = semester.courses.filter(hasRecordedCourseGrade);
  const totalCredits = gradedCourses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  if (totalCredits === 0) {
    return 0;
  }

  const weightedPoints = gradedCourses.reduce((sum, course) => {
    return sum + gradeToGpa(getCourseCurrentGrade(course)) * course.credits;
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

export function getAssessmentPace(course: Course) {
  const completed = course.assessments.reduce((sum, assessment) => {
    return (
      sum +
      (getAssessmentStatus(assessment) === ASSESSMENT_STATUS_COMPLETED ? 1 : 0)
    );
  }, 0);

  return `${completed}/${course.assessments.length} done`;
}

export const hasRecordedModuleGrade = hasRecordedCourseGrade;
export const getModuleCurrentGrade = getCourseCurrentGrade;
export const getModuleGuaranteedGrade = getCourseGuaranteedGrade;
