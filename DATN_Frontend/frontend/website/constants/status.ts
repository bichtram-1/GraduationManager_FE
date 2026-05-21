export const ACHIEVEMENT_STATUS = {
  COMPLETED: 'completed',
  CURRENT:   'current',
  PENDING:   'pending',
} as const;

export type AchievementStatusType = typeof ACHIEVEMENT_STATUS[keyof typeof ACHIEVEMENT_STATUS];

export const LESSON_STATUS = {
  LOCKED:   'locked',
  UNLOCKED: 'unlocked',
} as const;
