import type { GameContent } from '../content/load';
import { purchaseItem } from '../systems/economy';
import { gameState } from '../state/gameState';
import { refreshInventoryPanel } from './inventoryPanel';

interface StoreButton {
  itemId: string;
  cost: number;
  element: HTMLButtonElement;
}

export function setupStorePanel(content: GameContent): void {
  const store = content.stores['zone1_store'];
  if (store === undefined) {
    return;
  }
  const panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.left = '10px';
  panel.style.top = '10px';
  panel.style.border = '1px solid white';
  panel.style.padding = '10px';
  panel.style.background = 'rgba(0, 0, 0, 0.5)';
  const header = document.createElement('div');
  header.textContent = 'Store';
  panel.appendChild(header);
  const buttons: StoreButton[] = [];
  for (let i = 0; i < store.items.length; i = i + 1) {
    const entry = store.items[i];
    const itemId = entry.itemId;
    let cost = 0;
    if (entry.cost !== undefined) {
      if (entry.cost.pennies !== undefined) {
        cost = entry.cost.pennies;
      }
    }
    let name = itemId;
    const info = content.items[itemId];
    if (info !== undefined) {
      name = info.name;
    }
    const button = document.createElement('button');
    button.textContent = name + ' - ' + cost + 'c';
    button.onclick = () => {
      const message = 'Buy ' + name + ' for ' + cost + ' pennies?';
      const confirmed = window.confirm(message);
      if (!confirmed) {
        return;
      }
      const success = purchaseItem('zone1_store', itemId, content);
      if (!success) {
        window.alert('Purchase failed');
        return;
      }
      refreshInventoryPanel();
    };
    panel.appendChild(button);
    buttons.push({ itemId, cost, element: button });
  }
  document.body.appendChild(panel);
  function update(): void {
    for (let i = 0; i < buttons.length; i = i + 1) {
      const entry = buttons[i];
      if (gameState.player.pennies < entry.cost) {
        entry.element.disabled = true;
      } else {
        entry.element.disabled = false;
      }
    }
    requestAnimationFrame(update);
  }
  update();
}
