import type { GameContent } from '../content/load';
import { gameState } from '../state/gameState';
import type { Store } from '../content/schema';
import type { ItemInstance } from '../state/types';

export function addPennies(amount: number): void {
  gameState.player.pennies = gameState.player.pennies + amount;
}

function findStoreItem(
  store: Store,
  itemId: string
): { cost: number } | undefined {
  for (let i = 0; i < store.items.length; i = i + 1) {
    const entry = store.items[i];
    if (entry.itemId === itemId) {
      let cost = 0;
      const pennies = entry.cost.pennies;
      if (pennies !== undefined) {
        cost = pennies;
      }
      return { cost };
    }
  }
  return undefined;
}

function addToInventory(itemId: string, content: GameContent): void {
  const template = content.items[itemId];
  if (template === undefined) {
    throw new Error('Unknown item: ' + itemId);
  }
  const inventory = gameState.player.inventory;
  for (let i = 0; i < inventory.length; i = i + 1) {
    const entry = inventory[i];
    if (entry.id === itemId) {
      entry.quantity = entry.quantity + 1;
      return;
    }
  }
  const newEntry: ItemInstance = { id: itemId, quantity: 1 };
  if (template.durability !== undefined) {
    newEntry.durability = template.durability;
  }
  inventory.push(newEntry);
}

export function purchaseItem(
  storeId: string,
  itemId: string,
  content: GameContent
): boolean {
  const store = content.stores[storeId];
  if (store === undefined) {
    return false;
  }
  const info = findStoreItem(store, itemId);
  if (info === undefined) {
    return false;
  }
  if (gameState.player.pennies < info.cost) {
    return false;
  }
  gameState.player.pennies = gameState.player.pennies - info.cost;
  addToInventory(itemId, content);
  return true;
}

function repairItem(
  targetItemId: string,
  amount: number,
  content: GameContent
): void {
  const inventory = gameState.player.inventory;
  for (let i = 0; i < inventory.length; i = i + 1) {
    const entry = inventory[i];
    if (entry.id === targetItemId) {
      const template = content.items[targetItemId];
      if (template === undefined) {
        return;
      }
      let current = entry.durability;
      if (current === undefined) {
        current = 0;
      }
      let max = template.durability;
      if (max === undefined) {
        max = current + amount;
      }
      let next = current + amount;
      if (next > max) {
        next = max;
      }
      entry.durability = next;
      return;
    }
  }
}

interface RepairEffect {
  itemId: string;
  amount: number;
}

export function useItem(itemId: string, content: GameContent): boolean {
  const inventory = gameState.player.inventory;
  for (let i = 0; i < inventory.length; i = i + 1) {
    const entry = inventory[i];
    if (entry.id === itemId) {
      const template = content.items[itemId];
      if (template === undefined) {
        return false;
      }
      const effects = template.effects as { repair?: RepairEffect } | undefined;
      if (effects !== undefined) {
        const repair = effects.repair;
        if (repair !== undefined) {
          repairItem(repair.itemId, repair.amount, content);
        }
      }
      entry.quantity = entry.quantity - 1;
      if (entry.quantity <= 0) {
        inventory.splice(i, 1);
      }
      return true;
    }
  }
  return false;
}
