import { Game, Scene } from './engine/game';
import type { Rng } from './engine/rng';
import { drawText } from './engine/render';
import { gameState } from './state/gameState';
import { loadContent, type GameContent } from './content/load';
import { showOverlay } from './ui/overlay';
import { drawHud, drawDebug } from './ui/hud';
import { setupActionBar } from './ui/actionBar';
import { getKillFeed } from './systems/combat';
import { addPennies } from './systems/economy';

class DemoScene implements Scene {
  private x: number;
  private fps: number;

  constructor() {
    this.x = 20;
    this.fps = 0;
  }

  update(delta: number, rng: Rng): void {
    const step = rng.next() * 60;
    this.x = this.x + step * delta;
    if (this.x > 100) {
      this.x = 20;
    }
    if (delta > 0) {
      this.fps = 1 / delta;
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = 'white';
    context.fillRect(this.x, 20, 20, 20);
    drawText(context, 'Demo', 20, 60);
    const feed = getKillFeed();
    let lineY = 160;
    for (let i = 0; i < feed.length; i = i + 1) {
      drawText(context, feed[i], 20, lineY);
      lineY = lineY + 20;
    }
    const inventory = gameState.player.inventory;
    for (let i = 0; i < inventory.length; i = i + 1) {
      const item = inventory[i];
      const itemText = item.id + ' x' + item.quantity;
      drawText(context, itemText, 20, lineY);
      if (item.durability !== undefined) {
        const durText = 'Durability: ' + item.durability;
        drawText(context, durText, 160, lineY);
      }
      lineY = lineY + 20;
    }
    drawHud(context);
    drawDebug(context, this.fps);
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

  gameState.player.inventory.push({
    id: 'flyswatter',
    quantity: 1,
    durability: 50,
  });
  addPennies(100);

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
  setupActionBar(content, game);
  game.start();
}

start();
