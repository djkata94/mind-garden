// Automatic growth rule (improvement #4), pure module safe for both
// server routes and client components. Source of truth for thresholds:
// <300 chars seed, <1500 growing, else mature.
export const STAGE_SEED_MAX = 300;
export const STAGE_GROWING_MAX = 1500;

export function stageFor(content) {
  const len = String(content ?? "").length;
  if (len < STAGE_SEED_MAX) return "seed";
  if (len < STAGE_GROWING_MAX) return "growing";
  return "mature";
}
