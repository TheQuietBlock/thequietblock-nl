export function initFaqSearch() {
  const input = document.getElementById("faq-search") as HTMLInputElement | null;
  if (!input || input.dataset.ready === "true") return;
  input.dataset.ready = "true";

  const items = Array.from(document.querySelectorAll<HTMLElement>("[data-faq-item]"));
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    items.forEach((item) => {
      const haystack = item.dataset.faqText || "";
      item.hidden = query.length > 0 && !haystack.includes(query);
    });
  });
}
