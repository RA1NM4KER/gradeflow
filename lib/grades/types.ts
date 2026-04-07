export interface GradeBand {
  id: string;
  label: string;
  threshold: number;
}

export const SUBMINIMUM_STATUS_FAILED = "failed";
export const SUBMINIMUM_STATUS_MET = "met";
export const SUBMINIMUM_STATUS_PENDING = "pending";

export const SUBMINIMUM_STATUSES = [
  SUBMINIMUM_STATUS_FAILED,
  SUBMINIMUM_STATUS_MET,
  SUBMINIMUM_STATUS_PENDING,
] as const;
export type SubminimumStatus = (typeof SUBMINIMUM_STATUSES)[number];

export const GRADE_BAND_STATE_GUARANTEED = "guaranteed";
export const GRADE_BAND_STATE_REACHABLE = "reachable";
export const GRADE_BAND_STATE_UNREACHABLE = "unreachable";

export const GRADE_BAND_STATES = [
  GRADE_BAND_STATE_GUARANTEED,
  GRADE_BAND_STATE_REACHABLE,
  GRADE_BAND_STATE_UNREACHABLE,
] as const;
export type GradeBandState = (typeof GRADE_BAND_STATES)[number];

export interface SubminimumRequirement {
  achievedPercent: number | null;
  assessmentId: string;
  assessmentName: string;
  minimumPercent: number;
  status: SubminimumStatus;
}

export interface RequiredScoreResult {
  achievable: boolean;
  hasFailedSubminimums: boolean;
  hasPendingSubminimums: boolean;
  neededAverage: number;
  neededPoints: number;
  remainingWeight: number;
  subminimumRequirements: SubminimumRequirement[];
  message: string;
}
