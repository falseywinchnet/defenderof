export function clear(context: CanvasRenderingContext2D): void {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

export function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
): void {
  context.fillStyle = 'white';
  context.fillText(text, x, y);
}
