import type { GameContent } from '../content/load';
import { gameState } from '../state/gameState';

interface ZoneButton {
  id: string;
  element: HTMLButtonElement;
}

export function setupZoneMap(content: GameContent): void {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.right = '10px';
  container.style.top = '10px';
  container.style.border = '1px solid white';
  container.style.padding = '10px';
  container.style.background = 'rgba(0, 0, 0, 0.5)';
  const header = document.createElement('div');
  header.textContent = 'Zones';
  container.appendChild(header);

  const ids = ['picnic_table', 'kitchen'];
  const buttons: ZoneButton[] = [];

  for (let i = 0; i < ids.length; i = i + 1) {
    const id = ids[i];
    const info = content.zones[id];
    const button = document.createElement('button');
    let name = id;
    if (info !== undefined) {
      name = info.name;
    }
    button.textContent = name;
    button.onclick = () => {
      const unlocked = gameState.flags.zoneUnlocks.indexOf(id);
      if (unlocked !== -1) {
        gameState.currentZone = id;
      }
    };
    container.appendChild(button);
    buttons.push({ id, element: button });
  }

  document.body.appendChild(container);

  function update(): void {
    for (let i = 0; i < buttons.length; i = i + 1) {
      const entry = buttons[i];
      const unlocked = gameState.flags.zoneUnlocks.indexOf(entry.id);
      if (unlocked === -1) {
        entry.element.disabled = true;
      } else {
        entry.element.disabled = false;
      }
      if (gameState.currentZone === entry.id) {
        entry.element.style.fontWeight = 'bold';
      } else {
        entry.element.style.fontWeight = 'normal';
      }
    }
    requestAnimationFrame(update);
  }

  update();
}
