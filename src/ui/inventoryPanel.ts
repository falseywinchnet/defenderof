import { gameState } from '../state/gameState';
import type { GameContent } from '../content/load';

let panel: HTMLDivElement | undefined;
let contentRef: GameContent | undefined;

export function setupInventoryPanel(content: GameContent): void {
  contentRef = content;
  panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.right = '10px';
  panel.style.bottom = '10px';
  panel.style.border = '1px solid white';
  panel.style.padding = '10px';
  panel.style.background = 'rgba(0, 0, 0, 0.5)';
  document.body.appendChild(panel);
  refreshInventoryPanel();
}

export function refreshInventoryPanel(): void {
  if (panel === undefined) {
    return;
  }
  panel.innerHTML = '';
  const header = document.createElement('div');
  header.textContent = 'Inventory';
  panel.appendChild(header);
  const inventory = gameState.player.inventory;
  for (let i = 0; i < inventory.length; i = i + 1) {
    const entry = inventory[i];
    let name = entry.id;
    if (contentRef !== undefined) {
      const info = contentRef.items[entry.id];
      if (info !== undefined) {
        name = info.name;
      }
    }
    let text = name + ' x' + entry.quantity;
    if (entry.durability !== undefined) {
      text = text + ' (' + entry.durability + ')';
    }
    const row = document.createElement('div');
    row.textContent = text;
    panel.appendChild(row);
  }
}
