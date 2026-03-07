export function initMatrixRain(): void {
  const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext("2d")!;
  const CHARS = "0123456789ABCDEF!?/#@%&*[]<>{}\\|^~";
  const SIZE = 13;
  let w: number, h: number, cols: number, drops: number[], animId: number;

  function setup(): void {
    const parent = canvas!.parentElement!;
    w = canvas!.width = parent.offsetWidth || 800;
    h = canvas!.height = parent.offsetHeight || 300;
    ctx.clearRect(0, 0, w, h);
    cols = Math.max(1, Math.floor(w / SIZE));
    drops = Array.from({ length: cols }, () => ((Math.random() * -h) / SIZE) | 0);
  }

  function tick(): void {
    ctx.fillStyle = "rgba(2, 5, 8, 0.055)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${SIZE}px "Share Tech Mono",monospace`;

    for (let i = 0; i < cols; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * SIZE;
      const y = drops[i] * SIZE;
      ctx.fillStyle = "#b0ffe0";
      ctx.fillText(char, x, y);
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      else drops[i]++;
    }

    animId = requestAnimationFrame(tick);
  }

  setup();

  if (window.ResizeObserver) {
    new ResizeObserver(setup).observe(canvas.parentElement!);
  } else {
    window.addEventListener("resize", setup, { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(animId); animId = 0; }
    else if (!animId) { animId = requestAnimationFrame(tick); }
  });

  animId = requestAnimationFrame(tick);
}
