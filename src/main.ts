function start(): void {
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

  let previous = performance.now();

  function update(delta: number): void {
    Math.sin(delta);
  }

  function draw(): void {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // draw game state
  }

  function loop(timestamp: number): void {
    const delta = (timestamp - previous) / 1000;
    previous = timestamp;
    update(delta);
    draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

start();
