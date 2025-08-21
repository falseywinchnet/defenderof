import { gameState } from '../state/gameState';
import type { GameContent } from '../content/load';

interface BossRewards {
  unlock?: string[];
}

interface BossData {
  rewards?: BossRewards;
}

export function checkBossUnlock(): void {
  const flags = gameState.flags;
  if (flags.flyKills >= 100) {
    const index = flags.bossUnlocked.indexOf('tick_boss');
    if (index === -1) {
      flags.bossUnlocked.push('tick_boss');
    }
  }
}

export function markBossDefeated(bossId: string, content: GameContent): void {
  const defeated = gameState.flags.bossDefeated;
  if (defeated.indexOf(bossId) === -1) {
    defeated.push(bossId);
  }
  const unlocked = gameState.flags.bossUnlocked;
  const unlockIndex = unlocked.indexOf(bossId);
  if (unlockIndex !== -1) {
    unlocked.splice(unlockIndex, 1);
  }
  const boss = content.bosses[bossId] as BossData | undefined;
  if (boss === undefined) {
    return;
  }
  const rewards = boss.rewards;
  if (rewards === undefined) {
    return;
  }
  const unlocks = rewards.unlock;
  if (unlocks === undefined) {
    return;
  }
  for (let i = 0; i < unlocks.length; i = i + 1) {
    const token = unlocks[i];
    if (token.startsWith('zone:')) {
      const zoneId = token.slice(5);
      const zones = gameState.flags.zoneUnlocks;
      if (zones.indexOf(zoneId) === -1) {
        zones.push(zoneId);
      }
    }
  }
}
