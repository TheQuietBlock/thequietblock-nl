function setShellInvalidState(field: HTMLElement | null, invalid: boolean) {
  const shell = field?.closest(".input-shell") as HTMLElement | null;
  if (!shell) return;

  if (invalid) {
    shell.dataset.invalid = "true";
    return;
  }

  delete shell.dataset.invalid;
}

export function initJoinForm() {
  const form = document.getElementById("apply-form") as HTMLFormElement | null;
  const feedback = document.getElementById("apply-feedback");
  const submit = document.getElementById("apply-submit") as HTMLButtonElement | null;
  const usernameField = document.getElementById("mc-username") as HTMLInputElement | null;
  const contactField = document.getElementById("contact") as HTMLInputElement | null;
  const motivationField = document.getElementById("motivation") as HTMLTextAreaElement | null;

  if (!form || !feedback || !submit || form.dataset.ready === "true") return;
  form.dataset.ready = "true";

  const textFields = [usernameField, contactField, motivationField].filter(Boolean) as Array<HTMLInputElement | HTMLTextAreaElement>;

  const setFeedback = (message: string, type?: "success" | "error") => {
    feedback.textContent = message;
    feedback.className = type ? `apply-feedback is-${type}` : "apply-feedback";
  };

  textFields.forEach((field) => {
    field.addEventListener("input", () => setShellInvalidState(field, false));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback("");

    textFields.forEach((field) => setShellInvalidState(field, false));

    const payload = new FormData(form);
    const username = String(payload.get("username") || "").trim();
    const motivation = String(payload.get("motivation") || "").trim();
    const consent = payload.get("consent");

    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
      setShellInvalidState(usernameField, true);
      setFeedback("Use a valid Minecraft Java username.", "error");
      return;
    }

    if (motivation.length < 10 || motivation.length > 500) {
      setShellInvalidState(motivationField, true);
      setFeedback("Motivation must be between 10 and 500 characters.", "error");
      return;
    }

    if (!consent) {
      setFeedback("Consent is required before submission.", "error");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Submitting...";

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          username,
          contact: String(payload.get("contact") || "").trim(),
          motivation,
          website: String(payload.get("website") || "").trim(),
          consent: true
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setFeedback(data.message || "Submission failed.", "error");
        return;
      }

      form.reset();
      textFields.forEach((field) => setShellInvalidState(field, false));
      setFeedback(data.message || "Application submitted.", "success");
    } catch {
      setFeedback("Network error while sending the application.", "error");
    } finally {
      submit.disabled = false;
      submit.textContent = "Submit Application";
    }
  });
}
