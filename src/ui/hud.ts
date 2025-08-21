import { drawText } from '../engine/render';
import { gameState } from '../state/gameState';

export function drawHud(context: CanvasRenderingContext2D): void {
  let line = 20;
  const hpText = 'HP: ' + gameState.player.hp;
  drawText(context, hpText, 20, line);
  line = line + 20;
  const pennyText = 'Pennies: ' + gameState.player.pennies;
  drawText(context, pennyText, 20, line);
  line = line + 20;
  const zoneText = 'Zone: ' + gameState.currentZone;
  drawText(context, zoneText, 20, line);
}

export function drawDebug(
  context: CanvasRenderingContext2D,
  fps: number
): void {
  let line = 80;
  const fpsText = 'FPS: ' + fps.toFixed(1);
  drawText(context, fpsText, 20, line);
  line = line + 20;
  const flagText = 'Flags: ' + JSON.stringify(gameState.flags);
  drawText(context, flagText, 20, line);
  line = line + 20;
  const now = performance.now();
  let enragedSeconds = 0;
  if (gameState.flags.enragedUntil > now) {
    const remaining = gameState.flags.enragedUntil - now;
    enragedSeconds = remaining / 1000;
  }
  const enragedText = 'Enraged: ' + enragedSeconds.toFixed(1);
  drawText(context, enragedText, 20, line);
}
