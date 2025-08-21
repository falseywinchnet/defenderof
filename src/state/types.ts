export interface ItemInstance {
  id: string;
  quantity: number;
  durability?: number;
}

export interface PlayerState {
  hp: number;
  pennies: number;
  inventory: ItemInstance[];
}

export interface GameFlags {
  flyKills: number;
  zoneUnlocks: string[];
  bossUnlocked: string[];
  bossDefeated: string[];
}

export interface PesterEntry {
  value: number;
  unlocked: boolean;
}

export interface GameState {
  player: PlayerState;
  currentZone: string;
  flags: GameFlags;
  pester: Record<string, PesterEntry>;
  cooldowns: Record<string, number>;
}
