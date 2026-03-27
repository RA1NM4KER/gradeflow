import { Course, RequiredScoreResult, Semester } from "@/lib/types";

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function getCompletedWeight(course: Course) {
  return course.assessments
    .filter((assessment) => assessment.status === "completed")
    .reduce((sum, assessment) => sum + assessment.weight, 0);
}

export function getSecuredContribution(course: Course) {
  return course.assessments
    .filter(
      (assessment) =>
        assessment.status === "completed" && assessment.scoreAchieved !== null,
    )
    .reduce((sum, assessment) => {
      const scoreAchieved = assessment.scoreAchieved ?? 0;
      return (
        sum + (scoreAchieved / assessment.totalPossible) * assessment.weight
      );
    }, 0);
}

export function getCourseCurrentGrade(course: Course) {
  const completedWeight = getCompletedWeight(course);
  if (completedWeight === 0) {
    return 0;
  }

  return round((getSecuredContribution(course) / completedWeight) * 100);
}

export function getCourseFinalGrade(course: Course) {
  const securedContribution = getSecuredContribution(course);
  const remainingWeight = getRemainingWeight(course);

  if (remainingWeight > 0) {
    return round((securedContribution / (100 - remainingWeight)) * 100);
  }

  return round(securedContribution);
}

export function getRemainingWeight(course: Course) {
  return course.assessments
    .filter((assessment) => assessment.status === "ongoing")
    .reduce((sum, assessment) => sum + assessment.weight, 0);
}

export function calculateRequiredScore(
  course: Course,
  targetGrade: number,
): RequiredScoreResult {
  const securedContribution = getSecuredContribution(course);
  const remainingWeight = getRemainingWeight(course);
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
          ? `This course is already closed above your ${targetGrade}% target.`
          : `This course is complete at ${achieved}%, below the ${targetGrade}% target.`,
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
    message: `You need an average of ${neededAverage}% across the remaining ${remainingWeight}% of the course.`,
  };
}

export function getSemesterAverage(semester: Semester) {
  const totalCredits = semester.courses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  if (totalCredits === 0) {
    return 0;
  }

  const weighted = semester.courses.reduce((sum, course) => {
    return sum + getCourseCurrentGrade(course) * course.credits;
  }, 0);

  return round(weighted / totalCredits);
}

export function getSemesterGpa(semester: Semester) {
  const totalCredits = semester.courses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  if (totalCredits === 0) {
    return 0;
  }

  const weightedPoints = semester.courses.reduce((sum, course) => {
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

export function getSemesterCreditsCompleted(semester: Semester) {
  return semester.courses.reduce((sum, course) => {
    return sum + (getCompletedWeight(course) >= 100 ? course.credits : 0);
  }, 0);
}

export function formatPercent(value: number) {
  return `${round(value)}%`;
}

export function getAssessmentPace(course: Course) {
  const completed = course.assessments.filter(
    (assessment) => assessment.status === "completed",
  ).length;
  return `${completed}/${course.assessments.length} done`;
}
