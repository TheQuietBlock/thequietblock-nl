export function initApplyForm(): void {
  const form = document.getElementById("apply-form") as HTMLFormElement | null;
  const feedback = document.getElementById("apply-feedback");
  const submit = document.getElementById("apply-submit") as HTMLButtonElement | null;
  if (!form || !feedback || !submit) return;

  const API_ENDPOINT = "/api/apply";
  const SUBMIT_COOLDOWN_MS = 10000;
  let lastSubmitAt = 0;

  function showFeedback(message: string, type: "success" | "error"): void {
    feedback!.textContent = message;
    feedback!.className = "apply-feedback " + (type === "success" ? "is-success" : "is-error");
  }

  function clearFeedback(): void {
    feedback!.textContent = "";
    feedback!.className = "apply-feedback";
  }

  form.addEventListener("submit", async (e: Event) => {
    e.preventDefault();
    clearFeedback();

    const now = Date.now();
    if (now - lastSubmitAt < SUBMIT_COOLDOWN_MS) {
      showFeedback("Please wait before submitting again.", "error");
      return;
    }

    const username = (form.elements.namedItem("username") as HTMLInputElement).value.trim();
    const motivation = (form.elements.namedItem("motivation") as HTMLTextAreaElement).value.trim();
    const honeypot = (form.elements.namedItem("website") as HTMLInputElement).value;
    const consent = (form.elements.namedItem("consent") as HTMLInputElement).checked;

    if (honeypot) return;

    if (!consent) {
      showFeedback("You must agree to the privacy notice before submitting.", "error");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
      showFeedback("Invalid username. Use 3\u201316 characters: letters, numbers, underscores.", "error");
      return;
    }

    if (motivation.length < 10 || motivation.length > 500) {
      showFeedback("Motivation must be between 10 and 500 characters.", "error");
      return;
    }

    submit!.disabled = true;
    submit!.textContent = "[ Submitting... ]";
    lastSubmitAt = now;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username, motivation }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showFeedback("Application submitted. You will be contacted within 24 hours.", "success");
        form.reset();
      } else {
        showFeedback(data.message || "Something went wrong. Try again later.", "error");
      }
    } catch {
      showFeedback("Network error. Please check your connection and try again.", "error");
    } finally {
      submit!.disabled = false;
      submit!.textContent = "[ Submit Application ]";
    }
  });
}
