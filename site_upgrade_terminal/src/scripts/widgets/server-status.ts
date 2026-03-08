import { siteMeta } from "../../data/site";

const COOLDOWN_MS = 8000;
const FETCH_TIMEOUT_MS = 7000;
let nextRefreshAt = 0;

type FetchState = "idle" | "fetching" | "online" | "offline" | "timeout" | "error";

function setText(id: string, text: string) {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
}

function setState(text: string, state: "online" | "offline" | "unknown") {
  const stateNode = document.getElementById("server-state");
  const dot = document.getElementById("status-dot");
  if (!stateNode || !dot) return;

  stateNode.textContent = text;
  dot.className = `status-dot ${state === "unknown" ? "" : state}`.trim();
}

function setMessage(text: string) {
  setText("status-message", text);
}

function setFetchState(state: FetchState) {
  setText("status-last-fetch", state.charAt(0).toUpperCase() + state.slice(1));
}

function setCooldownLabel(button: HTMLButtonElement | null) {
  const remaining = Math.max(0, nextRefreshAt - Date.now());
  const cooldownText = remaining === 0 ? "Ready" : `${Math.ceil(remaining / 1000)}s`;

  setText("status-cooldown", cooldownText);

  if (!button) return;

  if (remaining === 0) {
    button.disabled = false;
    button.textContent = "Refresh";
    return;
  }

  button.disabled = true;
  button.textContent = `Refresh ${Math.ceil(remaining / 1000)}s`;
  window.setTimeout(() => setCooldownLabel(button), 250);
}

function resetToUnknown() {
  setState("Unknown", "unknown");
  setText("player-count", "-/-");
  setText("server-version", "Not available");
  setText("server-motd", "Not available");
}

function addTranscript(level: FetchState | "info", text: string) {
  const container = document.getElementById("status-transcript");
  if (!container) return;

  const entries = Array.from(container.querySelectorAll<HTMLElement>(".transcript-entry"));
  if (entries.length === 1 && entries[0].textContent?.includes("Waiting for the first live status request.")) {
    container.innerHTML = "";
  }

  const stamp = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());

  const entry = document.createElement("p");
  entry.className = "transcript-entry";
  entry.dataset.level = level;
  entry.textContent = `[${stamp}] ${text}`;
  container.prepend(entry);

  const updatedEntries = Array.from(container.querySelectorAll<HTMLElement>(".transcript-entry"));
  updatedEntries.slice(6).forEach((node) => node.remove());
}

function formatMotd(payload: any) {
  const rawMotd = Array.isArray(payload.motd?.clean)
    ? payload.motd.clean.join(" ")
    : payload.motd?.clean || "";
  return String(rawMotd).replace(/\s+/g, " ").trim() || "Not available";
}

function setUnknownState(message: string, fetchState: Extract<FetchState, "idle" | "timeout" | "error">) {
  resetToUnknown();
  setFetchState(fetchState);
  setMessage(message);
}

export function initServerStatus() {
  const refresh = document.getElementById("refresh-status") as HTMLButtonElement | null;
  const players = document.getElementById("player-count");
  const version = document.getElementById("server-version");
  const motd = document.getElementById("server-motd");
  if (!refresh || !players || !version || !motd || refresh.dataset.ready === "true") return;

  refresh.dataset.ready = "true";

  const fetchStatus = async () => {
    setFetchState("fetching");
    setMessage("Fetching live server status...");
    addTranscript("fetching", `Requesting live status for ${siteMeta.host}.`);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(siteMeta.host)}`, {
        headers: {
          Accept: "application/json"
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`http_${response.status}`);
      }

      const payload = await response.json();
      if (typeof payload?.online !== "boolean") {
        throw new Error("invalid_payload");
      }

      if (!payload.online) {
        setState("Offline", "offline");
        players.textContent = "0/0";
        version.textContent = payload.version || "Not available";
        motd.textContent = formatMotd(payload) === "Not available" ? "Server offline or sleeping" : formatMotd(payload);
        setFetchState("offline");
        setMessage("The server is currently offline.");
        addTranscript("offline", "Upstream reported the server offline.");
        return;
      }

      const onlinePlayers = payload.players?.online ?? 0;
      const maxPlayers = payload.players?.max ?? 0;

      setState("Online", "online");
      players.textContent = `${onlinePlayers}/${maxPlayers}`;
      version.textContent = payload.version || "Not available";
      motd.textContent = formatMotd(payload);
      setFetchState("online");
      setMessage("Live server status loaded.");
      addTranscript("online", `Upstream reported ${onlinePlayers}/${maxPlayers} players online.`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setUnknownState(
          "Status is unknown because the upstream request timed out. No stale online state is shown.",
          "timeout"
        );
        addTranscript("timeout", "The upstream request timed out. State reset to unknown.");
        return;
      }

      setUnknownState(
        "Status is unknown because live telemetry could not be loaded. No stale online state is shown.",
        "error"
      );
      addTranscript("error", "The upstream request failed. State reset to unknown.");
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  refresh.addEventListener("click", () => {
    if (Date.now() < nextRefreshAt) return;
    nextRefreshAt = Date.now() + COOLDOWN_MS;
    setCooldownLabel(refresh);
    void fetchStatus();
  });

  setUnknownState(`Checking ${siteMeta.host} for current live data.`, "idle");
  setCooldownLabel(refresh);
  void fetchStatus();
}
