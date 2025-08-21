import { gameState } from '../state/gameState';

export function startCooldown(id: string, durationMs: number): void {
  gameState.cooldowns[id] = durationMs;
}

export function updateCooldowns(deltaMs: number): void {
  const entries = Object.keys(gameState.cooldowns);
  for (let i = 0; i < entries.length; i = i + 1) {
    const key = entries[i];
    let remaining = gameState.cooldowns[key];
    remaining = remaining - deltaMs;
    if (remaining <= 0) {
      delete gameState.cooldowns[key];
    } else {
      gameState.cooldowns[key] = remaining;
    }
  }
}

export function isOnCooldown(id: string): boolean {
  const remaining = gameState.cooldowns[id];
  if (remaining === undefined) {
    return false;
  }
  if (remaining > 0) {
    return true;
  }
  return false;
}

export function getCooldownRatio(id: string, totalMs: number): number {
  const remaining = gameState.cooldowns[id];
  if (remaining === undefined) {
    return 0;
  }
  if (totalMs <= 0) {
    return 0;
  }
  return remaining / totalMs;
}
