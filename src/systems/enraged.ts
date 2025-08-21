import { gameState } from '../state/gameState';

const killTimestamps: number[] = [];

export function recordFlyKill(): void {
  const now = Date.now();
  killTimestamps.push(now);
  while (killTimestamps.length > 0) {
    const first = killTimestamps[0];
    if (now - first > 1000) {
      killTimestamps.shift();
    } else {
      break;
    }
  }
  if (killTimestamps.length > 6) {
    gameState.flags.enragedUntil = now + 5000;
  }
}

export function isEnraged(): boolean {
  const now = Date.now();
  if (now >= gameState.flags.enragedUntil) {
    return false;
  }
  return true;
}
