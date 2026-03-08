export function initBootSequences() {
  const groups = document.querySelectorAll<HTMLElement>("[data-boot-sequence]");

  groups.forEach((group) => {
    if (group.dataset.ready === "true") return;
    group.dataset.ready = "true";

    const lines = Array.from(group.querySelectorAll<HTMLElement>("[data-boot-line]"));
    const reduced = document.documentElement.classList.contains("reduced-motion");

    if (reduced) {
      lines.forEach((line) => line.classList.add("is-visible"));
      return;
    }

    lines.forEach((line) => line.classList.remove("is-visible"));
    const delay = Number(group.dataset.bootDelay || 150);
    lines.forEach((line, index) => {
      window.setTimeout(() => line.classList.add("is-visible"), 120 + index * delay);
    });
  });
}
