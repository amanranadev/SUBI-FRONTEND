const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export function getWorkspaceSidebarTrialDaysRemaining(
  trialEndsAtInSeconds: number,
) {
  const trialEndDate = new Date(trialEndsAtInSeconds * 1000);
  const now = new Date();
  const trialEndMidnight = new Date(
    trialEndDate.getFullYear(),
    trialEndDate.getMonth(),
    trialEndDate.getDate(),
  );
  const nowMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  return Math.max(
    0,
    Math.ceil(
      (trialEndMidnight.getTime() - nowMidnight.getTime()) /
        MILLISECONDS_PER_DAY,
    ),
  );
}
