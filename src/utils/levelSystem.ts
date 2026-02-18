export const XP_PER_LEVEL = 100;

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXPProgress(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function checkLevelUp(oldXP: number, newXP: number): boolean {
  return calculateLevel(newXP) > calculateLevel(oldXP);
}
