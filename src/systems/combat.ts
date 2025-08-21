import type { GameContent } from '../content/load';
import type { Enemy } from '../content/schema';
import { gameState } from '../state/gameState';

interface EnemyInstance {
  id: string;
  hp: number;
}

const activeEnemies: EnemyInstance[] = [];
const killFeed: string[] = [];

export function spawnEnemy(enemyId: string, content: GameContent): void {
  const template = content.enemies[enemyId];
  if (template === undefined) {
    throw new Error('Unknown enemy: ' + enemyId);
  }
  const instance: EnemyInstance = { id: enemyId, hp: template.hp };
  activeEnemies.push(instance);
}

function rewardKill(enemy: Enemy): void {
  const pennies = enemy.bounty.pennies;
  if (pennies !== undefined) {
    gameState.player.pennies = gameState.player.pennies + pennies;
  }
  killFeed.push('Defeated ' + enemy.name);
  if (enemy.id === 'fly') {
    gameState.flags.flyKills = gameState.flags.flyKills + 1;
  }
}

export function attackSingle(
  enemyId: string,
  damage: number,
  content: GameContent
): void {
  for (let i = 0; i < activeEnemies.length; i = i + 1) {
    const instance = activeEnemies[i];
    if (instance.id === enemyId) {
      instance.hp = instance.hp - damage;
      if (instance.hp <= 0) {
        activeEnemies.splice(i, 1);
        const enemy = content.enemies[enemyId];
        rewardKill(enemy);
      }
      return;
    }
  }
}

export function attackGroup(
  enemyId: string,
  damage: number,
  content: GameContent
): void {
  for (let i = activeEnemies.length - 1; i >= 0; i = i - 1) {
    const instance = activeEnemies[i];
    if (instance.id === enemyId) {
      instance.hp = instance.hp - damage;
      if (instance.hp <= 0) {
        activeEnemies.splice(i, 1);
        const enemy = content.enemies[enemyId];
        rewardKill(enemy);
      }
    }
  }
}

export function getKillFeed(): readonly string[] {
  return killFeed;
}
