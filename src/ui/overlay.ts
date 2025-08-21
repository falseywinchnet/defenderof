export function showOverlay(message: string): void {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  overlay.style.color = 'white';
  overlay.style.fontFamily = 'monospace';
  overlay.style.whiteSpace = 'pre-wrap';
  overlay.style.padding = '20px';
  overlay.textContent = message;
  document.body.appendChild(overlay);
}
