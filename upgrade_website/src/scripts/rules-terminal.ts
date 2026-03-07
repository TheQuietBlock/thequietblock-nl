function typeText(el: HTMLElement, text: string, speed: number): Promise<void> {
  return new Promise(resolve => {
    let i = 0;
    (function next() {
      if (i < text.length) {
        el.textContent = text.slice(0, ++i);
        setTimeout(next, speed + Math.random() * speed * 0.4);
      } else resolve();
    })();
  });
}

function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function initRulesTerminal(): void {
  const cmdSpan = document.querySelector(".term-cmd-text") as HTMLElement | null;
  const rules = document.querySelectorAll<HTMLElement>(".term-rule");
  const closing = document.querySelector(".term-closing") as HTMLElement | null;
  const lastLine = document.querySelector(".term-last") as HTMLElement | null;
  if (!rules.length) return;

  if (lastLine) lastLine.style.visibility = "hidden";

  const cmdText = cmdSpan ? cmdSpan.textContent ?? "" : "";
  if (cmdSpan) {
    cmdSpan.textContent = "";
    cmdSpan.classList.add("has-cursor");
  }

  const ruleData = Array.from(rules).map(rule => {
    const titleEl = rule.querySelector(".term-rule-title") as HTMLElement | null;
    const descEl = rule.querySelector(".term-rule-desc") as HTMLElement | null;
    const title = titleEl ? titleEl.textContent ?? "" : "";
    const desc = descEl ? descEl.textContent ?? "" : "";
    if (titleEl) titleEl.textContent = "";
    if (descEl) { descEl.textContent = ""; descEl.style.visibility = "hidden"; }
    return { el: rule, titleEl, descEl, title, desc };
  });

  async function run(): Promise<void> {
    if (cmdSpan) {
      await typeText(cmdSpan, cmdText, 40);
      cmdSpan.classList.remove("has-cursor");
    }

    await wait(500);

    for (const d of ruleData) {
      d.el.classList.add("is-visible");

      if (d.titleEl) {
        d.titleEl.classList.add("has-cursor");
        await typeText(d.titleEl, d.title, 22);
        d.titleEl.classList.remove("has-cursor");
      }
      if (d.descEl) {
        d.descEl.style.visibility = "visible";
        await typeText(d.descEl, d.desc, 6);
      }

      await wait(280);
    }

    if (closing) { await wait(200); closing.classList.add("is-visible"); }
    if (lastLine) { await wait(300); lastLine.style.visibility = "visible"; }
  }

  setTimeout(run, 600);
}
