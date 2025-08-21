import type { GameState } from './types';

export const gameState: GameState = {
  player: {
    hp: 100,
    pennies: 0,
    inventory: [],
  },
  currentZone: 'picnic_table',
  flags: {
    flyKills: 0,
    zoneUnlocks: ['picnic_table'],
    bossUnlocked: [],
    bossDefeated: [],
    enragedUntil: 0,
  },
  pester: {
    pester_parents: { value: 0, unlocked: false },
  },
  cooldowns: {},
};
