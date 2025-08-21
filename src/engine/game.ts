import { Rng } from './rng';
import { clear } from './render';
import { updateCooldowns } from '../systems/cooldown';

export interface Scene {
  update(delta: number, rng: Rng): void;
  draw(context: CanvasRenderingContext2D): void;
}

export class Game {
  private context: CanvasRenderingContext2D;
  private current: Scene;
  private previous: number;
  readonly rng: Rng;

  constructor(context: CanvasRenderingContext2D, initial: Scene, seed: number) {
    this.context = context;
    this.current = initial;
    this.previous = performance.now();
    this.rng = new Rng(seed);
    this.loop = this.loop.bind(this);
  }

  start(): void {
    requestAnimationFrame(this.loop);
  }

  switchScene(scene: Scene): void {
    this.current = scene;
  }

  private loop(timestamp: number): void {
    const delta = (timestamp - this.previous) / 1000;
    this.previous = timestamp;
    updateCooldowns(delta * 1000);
    this.current.update(delta, this.rng);
    clear(this.context);
    this.current.draw(this.context);
    requestAnimationFrame(this.loop);
  }
}
