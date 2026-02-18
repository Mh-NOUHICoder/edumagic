export const REWARDS = {
  LESSON_COMPLETE: 10,
  QUIZ_CORRECT: 5,
  STREAK_BONUS: (streak: number) => Math.min(streak * 2, 20),
};

export const BADGES = [
  { id: 'newbie', name: 'Newbie', icon: '🌱', xpRequired: 0 },
  { id: 'scholar', name: 'Scholar', icon: '📚', xpRequired: 100 },
  { id: 'wizard', name: 'Magic Wizard', icon: '🧙‍♂️', xpRequired: 500 },
  { id: 'daily-hero', name: 'Daily Hero', icon: '⚡', xpRequired: 1000 },
];
