import { gameState } from '../state/gameState';
import type { GameState } from '../state/types';

const SAVE_VERSION = 1;

interface SaveSlot {
  version: number;
  state: GameState;
}

function saveKey(slot: number): string {
  return 'save:slot:' + String(slot);
}

export function saveGame(slot: number, state: GameState): void {
  const data: SaveSlot = { version: SAVE_VERSION, state: state };
  const json = JSON.stringify(data);
  localStorage.setItem(saveKey(slot), json);
}

function migrate(data: unknown): SaveSlot {
  return data as SaveSlot;
}

export function loadGame(slot: number): GameState | null {
  const key = saveKey(slot);
  const raw = localStorage.getItem(key);
  if (raw === null) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as SaveSlot;
    if (parsed.version !== SAVE_VERSION) {
      const migrated = migrate(parsed);
      return migrated.state;
    }
    return parsed.state;
  } catch {
    return null;
  }
}

export function autoSave(slot: number, intervalMs: number): void {
  function tick(): void {
    saveGame(slot, gameState);
  }
  setInterval(tick, intervalMs);
}
