import { Game, Scene } from './engine/game';
import type { Rng } from './engine/rng';
import { drawText } from './engine/render';
import { gameState } from './state/gameState';
import { loadContent, type GameContent } from './content/load';
import { showOverlay } from './ui/overlay';
import {
  spawnEnemy,
  attackSingle,
  attackGroup,
  getKillFeed,
} from './systems/combat';
import { pester } from './systems/pester';

class DemoScene implements Scene {
  private x: number;

  constructor() {
    this.x = 20;
  }

  update(delta: number, rng: Rng): void {
    const step = rng.next() * 60;
    this.x = this.x + step * delta;
    if (this.x > 100) {
      this.x = 20;
    }
    pester('pester_parents', rng);
  }

  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = 'white';
    context.fillRect(this.x, 20, 20, 20);
    drawText(context, 'Demo', 20, 60);
    const zoneText = 'Zone: ' + gameState.currentZone;
    drawText(context, zoneText, 20, 80);
    const penniesText = 'Pennies: ' + gameState.player.pennies;
    drawText(context, penniesText, 20, 100);
    const pesterEntry = gameState.pester['pester_parents'];
    const pesterText = 'Pester: ' + pesterEntry.value;
    drawText(context, pesterText, 20, 120);
    if (pesterEntry.unlocked) {
      drawText(context, 'Pester Unlocked', 20, 140);
    }
    const feed = getKillFeed();
    for (let i = 0; i < feed.length; i = i + 1) {
      const lineY = 160 + i * 20;
      drawText(context, feed[i], 20, lineY);
    }
  }
}

async function start(): Promise<void> {
  let content: GameContent;
  try {
    content = await loadContent();
  } catch (e) {
    let message: string;
    if (e instanceof Error) {
      message = e.message;
    } else {
      message = String(e);
    }
    showOverlay(message);
    return;
  }

  spawnEnemy('fly', content);
  attackSingle('fly', 8, content);
  spawnEnemy('fly', content);
  spawnEnemy('fly', content);
  attackGroup('fly', 8, content);

  const element = document.getElementById('game');
  if (element === null) {
    throw new Error('Canvas element not found');
  }

  const canvas = element as HTMLCanvasElement;
  const maybeContext = canvas.getContext('2d');
  if (maybeContext === null) {
    throw new Error('2D context unavailable');
  }
  const context: CanvasRenderingContext2D = maybeContext;

  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const scene = new DemoScene();
  const game = new Game(context, scene, 1);
  game.start();
}

start();
