export function initGlitch(): void {
  const h1 = document.querySelector("h1");
  if (!h1) return;

  function glitch(): void {
    h1!.classList.add("is-glitching");
    h1!.addEventListener("animationend", () => h1!.classList.remove("is-glitching"), { once: true });
    setTimeout(glitch, 8000 + Math.random() * 12000);
  }

  setTimeout(glitch, 1500);
}

export function initTypingEffect(): void {
  const subtitle = document.querySelector(".hero .subtitle") as HTMLElement | null;
  if (!subtitle) return;

  const fullText = subtitle.textContent!.trim();
  subtitle.textContent = "";
  subtitle.classList.add("has-cursor");

  let i = 0;
  const BASE_SPEED = 26;

  function type(): void {
    if (i < fullText.length) {
      subtitle!.textContent = fullText.slice(0, ++i);
      setTimeout(type, BASE_SPEED + Math.random() * 18);
    }
  }

  setTimeout(type, 420);
}
