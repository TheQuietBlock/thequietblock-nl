export function initTerminalTyping() {
  const targets = document.querySelectorAll<HTMLElement>("[data-type]");

  targets.forEach((target) => {
    if (target.dataset.ready === "true") return;
    target.dataset.ready = "true";

    const fullText = target.textContent?.trim() ?? "";
    const reduced = document.documentElement.classList.contains("reduced-motion");

    if (!fullText || reduced) {
      target.classList.add("is-typed");
      return;
    }

    target.textContent = "";
    target.classList.add("is-typed");

    let index = 0;
    const tick = () => {
      index += 1;
      target.textContent = fullText.slice(0, index);
      if (index < fullText.length) {
        window.setTimeout(tick, 16 + Math.random() * 18);
      }
    };

    window.setTimeout(tick, 220);
  });
}
