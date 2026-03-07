function typeLine(container: HTMLElement, text: string, speed: number): Promise<void> {
  return new Promise(resolve => {
    const span = document.createElement("span");
    span.className = "crt-line";
    container.appendChild(span);

    if (!text) { span.textContent = "\u00A0"; resolve(); return; }

    let i = 0;
    (function next() {
      if (i < text.length) {
        span.textContent = text.slice(0, ++i);
        setTimeout(next, speed + Math.random() * speed * 0.5);
      } else resolve();
    })();
  });
}

function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function initCrtBoot(): void {
  const bootEl = document.getElementById("crt-boot");
  const errorEl = document.getElementById("crt-error");
  const promptEl = document.getElementById("crt-prompt");
  if (!bootEl) return;

  const BOOT_LINES = [
    "TQB-TERM v2.1 \u2014 TheQuietBlock Terminal",
    "(C) 2024-2026 TheQuietBlock Community",
    "",
    "> Initializing session...",
    "> Loading whitelist-apply.sh ...",
    "> ERROR: module not compiled",
    "> ABORT: system halted",
  ];

  async function run(): Promise<void> {
    for (const line of BOOT_LINES) {
      await typeLine(bootEl!, line, 20);
      await wait(line.startsWith("> ERROR") ? 600 : line.startsWith(">") ? 350 : 120);
    }

    await wait(700);

    if (errorEl) errorEl.hidden = false;
    if (promptEl) promptEl.hidden = false;
  }

  setTimeout(run, 400);
}
