import { gameState } from '../state/gameState';
import type { Rng } from '../engine/rng';
import tuning from '../../tuning.json';

interface PesterConfig {
  threshold: number;
  increments: { '1': number; '2': number; '3': number; '0'?: number };
  reward?: { grantItem?: string };
}

const configs: Record<string, PesterConfig> = {
  pester_parents: {
    threshold: tuning.pester.pester_parents.threshold,
    increments: { '1': 0.5, '2': 0.25, '3': 0.125, '0': 0.125 },
    reward: { grantItem: 'flyswatter' },
  },
};

function grantItem(id: string): void {
  const inventory = gameState.player.inventory;
  for (let i = 0; i < inventory.length; i = i + 1) {
    const item = inventory[i];
    if (item.id === id) {
      item.quantity = item.quantity + 1;
      return;
    }
  }
  inventory.push({ id, quantity: 1 });
}

function chooseIncrement(
  weights: { '1': number; '2': number; '3': number; '0'?: number },
  rng: Rng
): number {
  const roll = rng.next();
  let cumulative = 0;
  cumulative = cumulative + weights['1'];
  if (roll < cumulative) {
    return 1;
  }
  cumulative = cumulative + weights['2'];
  if (roll < cumulative) {
    return 2;
  }
  cumulative = cumulative + weights['3'];
  if (roll < cumulative) {
    return 3;
  }
  return 0;
}

export function pester(id: string, rng: Rng): boolean {
  const config = configs[id];
  if (config === undefined) {
    return false;
  }
  let entry = gameState.pester[id];
  if (entry === undefined) {
    entry = { value: 0, unlocked: false };
    gameState.pester[id] = entry;
  }
  if (entry.unlocked) {
    return true;
  }
  const amount = chooseIncrement(config.increments, rng);
  entry.value = entry.value + amount;
  if (entry.value >= config.threshold) {
    entry.unlocked = true;
    const rewardItem = config.reward?.grantItem;
    if (rewardItem !== undefined) {
      grantItem(rewardItem);
    }
  }
  return entry.unlocked;
}
