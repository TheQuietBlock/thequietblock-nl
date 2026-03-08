export function initMatrixRain() {
  const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement | null;
  if (!canvas || canvas.dataset.ready === "true") return;

  const reduced = document.documentElement.classList.contains("reduced-motion");
  if (reduced) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.dataset.ready = "true";

  const chars = "01<>[]{}#?%$ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const fontSize = 14;
  let width = 0;
  let height = 0;
  let columns = 0;
  let drops: number[] = [];
  let animationFrame = 0;

  const setup = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
    columns = Math.max(1, Math.floor(width / fontSize));
    drops = Array.from({ length: columns }, () => Math.floor((Math.random() * -height) / fontSize));
  };

  const draw = () => {
    ctx.fillStyle = "rgba(4, 7, 13, 0.08)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#baf7d5";
    ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

    for (let index = 0; index < columns; index += 1) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = index * fontSize;
      const y = drops[index] * fontSize;
      ctx.fillText(text, x, y);
      if (y > height && Math.random() > 0.98) {
        drops[index] = 0;
      } else {
        drops[index] += 1;
      }
    }

    animationFrame = window.requestAnimationFrame(draw);
  };

  setup();
  draw();

  const observer = new ResizeObserver(setup);
  if (canvas.parentElement) observer.observe(canvas.parentElement);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      return;
    }
    animationFrame = window.requestAnimationFrame(draw);
  });
}
