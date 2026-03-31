const PLAIN_NUMBER_ALLOWED = /[0-9.]/g;
const SCORE_EXPRESSION_ALLOWED = /[0-9./%()*^\s]/g;

export function sanitizePlainNumberInput(value: string) {
  return Array.from(value.match(PLAIN_NUMBER_ALLOWED) ?? []).join("");
}

export function sanitizeIntegerInput(value: string) {
  return Array.from(value.match(/[0-9]/g) ?? []).join("");
}

export function sanitizeScoreExpressionInput(value: string) {
  return Array.from(value.match(SCORE_EXPRESSION_ALLOWED) ?? []).join("");
}
