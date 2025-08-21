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
}

export interface GameState {
  player: PlayerState;
  currentZone: string;
  flags: GameFlags;
}
