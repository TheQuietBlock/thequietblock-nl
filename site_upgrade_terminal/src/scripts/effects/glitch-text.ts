export function initGlitchText() {
  const heading = document.querySelector("[data-glitch]") as HTMLElement | null;
  if (!heading || heading.dataset.ready === "true") return;

  heading.dataset.ready = "true";

  const reduced = document.documentElement.classList.contains("reduced-motion");
  if (reduced) return;

  const run = () => {
    heading.classList.add("is-glitching");
    window.setTimeout(() => {
      heading.classList.remove("is-glitching");
      window.setTimeout(run, 7000 + Math.random() * 6000);
    }, 500);
  };

  window.setTimeout(run, 1500);
}
