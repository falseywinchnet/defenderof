import { spawnEnemy, attackGroup, attackSingle } from '../systems/combat';
import { pester } from '../systems/pester';
import { startCooldown, isOnCooldown } from '../systems/cooldown';
import { gameState } from '../state/gameState';
import type { Game } from '../engine/game';
import type { GameContent } from '../content/load';

interface ButtonConfig {
  id: string;
  label: string;
  total: number;
  onClick: () => void;
}

export function setupActionBar(content: GameContent, game: Game): void {
  const bar = document.createElement('div');
  bar.style.position = 'fixed';
  bar.style.bottom = '10px';
  bar.style.left = '50%';
  bar.style.transform = 'translateX(-50%)';
  bar.style.display = 'flex';
  bar.style.gap = '10px';

  const buttons: ButtonConfig[] = [];

  const attackButton: ButtonConfig = {
    id: 'attack_flies',
    label: 'Attack Flies',
    total: 8000,
    onClick: () => {
      const hasSwatter = gameState.player.inventory.some((item) => {
        if (item.id === 'flyswatter') {
          return true;
        }
        return false;
      });
      let duration = 8000;
      if (hasSwatter) {
        duration = 100;
      }
      spawnEnemy('fly', content);
      attackSingle('fly', 8, content);
      startCooldown('attack_flies', duration);
    },
  };
  buttons.push(attackButton);

  const pesterButton: ButtonConfig = {
    id: 'pester_parents',
    label: 'Pester Parents',
    total: 1000,
    onClick: () => {
      pester('pester_parents', game.rng);
      startCooldown('pester_parents', 1000);
    },
  };
  buttons.push(pesterButton);

  const tickButton: ButtonConfig = {
    id: 'fight_tick',
    label: 'Fight Tick',
    total: 1000,
    onClick: () => {
      spawnEnemy('tick_boss', content);
      attackGroup('tick_boss', 250, content);
      startCooldown('fight_tick', 1000);
    },
  };
  buttons.push(tickButton);

  const elements: { [key: string]: HTMLButtonElement } = {};

  for (let i = 0; i < buttons.length; i = i + 1) {
    const config = buttons[i];
    const button = document.createElement('button');
    button.textContent = config.label;
    button.onclick = () => {
      const active = isOnCooldown(config.id);
      if (active) {
        return;
      }
      config.onClick();
    };
    bar.appendChild(button);
    elements[config.id] = button;
  }

  document.body.appendChild(bar);

  function update(): void {
    for (let i = 0; i < buttons.length; i = i + 1) {
      const config = buttons[i];
      const button = elements[config.id];
      const remaining = gameState.cooldowns[config.id];
      if (remaining === undefined) {
        button.disabled = false;
        button.textContent = config.label;
      } else {
        button.disabled = true;
        const seconds = remaining / 1000;
        const text = config.label + ' (' + seconds.toFixed(1) + 's)';
        button.textContent = text;
      }
    }
    requestAnimationFrame(update);
  }

  update();
}
