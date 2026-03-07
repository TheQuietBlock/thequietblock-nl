const HOST = "mc.thequietblock.nl";
const API_URL = `https://api.mcsrvstat.us/3/${encodeURIComponent(HOST)}`;
const COOLDOWN_MS = 8000;
const PLACEHOLDER_TEXT =
  "Live server status will be shown here soon, including online/offline state and current player count.";

function sanitizeMotd(value: unknown): string {
  if (typeof value !== "string") return "Not available";
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned || "Not available";
}

export function initServerStatus(): void {
  const statusMessage = document.getElementById("status-message");
  const serverState = document.getElementById("server-state");
  const playerCount = document.getElementById("player-count");
  const serverVersion = document.getElementById("server-version");
  const serverMotd = document.getElementById("server-motd");
  const refreshButton = document.getElementById("refresh-status") as HTMLButtonElement | null;
  const statusDot = document.getElementById("status-dot");

  const hasUI = statusMessage && serverState && playerCount && serverVersion && serverMotd && refreshButton;
  if (!hasUI) return;

  let nextRefreshAt = 0;

  function setStatusText(text: string): void {
    statusMessage!.textContent = text;
  }

  function setServerState(text: string, state: string): void {
    serverState!.textContent = text;
    serverState!.className = state === "online" ? "is-online" : state === "offline" ? "is-offline" : "";
    if (statusDot) {
      statusDot.className = "status-dot " + (state === "online" ? "online" : state === "offline" ? "offline" : "");
    }
  }

  function setUnknownState(message: string): void {
    setServerState("Unknown", "unknown");
    playerCount!.textContent = "-/-";
    serverVersion!.textContent = "Not available";
    serverMotd!.textContent = "Not available";
    setStatusText(message);
  }

  function updateCooldownUI(): void {
    const remaining = Math.max(0, nextRefreshAt - Date.now());
    if (remaining === 0) {
      refreshButton!.disabled = false;
      refreshButton!.textContent = "Refresh Status";
      return;
    }
    refreshButton!.disabled = true;
    refreshButton!.textContent = `Refresh in ${Math.ceil(remaining / 1000)}s`;
    setTimeout(updateCooldownUI, 250);
  }

  async function fetchStatus(): Promise<void> {
    try {
      setStatusText("Fetching live server status...");
      const response = await fetch(API_URL, { method: "GET", mode: "cors", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!data.online) {
        setServerState("Offline", "offline");
        playerCount!.textContent = "0/0";
        serverVersion!.textContent = "Not available";
        serverMotd!.textContent = "Not available";
        setStatusText(PLACEHOLDER_TEXT);
        return;
      }

      const onlinePlayers = Number.isFinite(data.players?.online) ? data.players.online : 0;
      const maxPlayers = Number.isFinite(data.players?.max) ? data.players.max : 0;
      const version = typeof data.version === "string" ? data.version : "Not available";

      let motd = "Not available";
      if (Array.isArray(data.motd?.clean) && data.motd.clean.length > 0) {
        motd = sanitizeMotd(data.motd.clean.join(" "));
      } else if (typeof data.motd?.clean === "string") {
        motd = sanitizeMotd(data.motd.clean);
      }

      setServerState("Online", "online");
      playerCount!.textContent = `${onlinePlayers}/${maxPlayers}`;
      serverVersion!.textContent = version;
      serverMotd!.textContent = motd;
      setStatusText("Live server status loaded.");
    } catch {
      setUnknownState(PLACEHOLDER_TEXT);
    }
  }

  refreshButton!.addEventListener("click", () => {
    const now = Date.now();
    if (now < nextRefreshAt) return;
    nextRefreshAt = now + COOLDOWN_MS;
    updateCooldownUI();
    fetchStatus();
  });

  setUnknownState(PLACEHOLDER_TEXT);
  fetchStatus();
}

export function initBootSequence(): void {
  const statusMessage = document.getElementById("status-message");
  if (!statusMessage) return;

  const lines = ["Initialising connection...", "Pinging mc.thequietblock.nl...", "Fetching live server status..."];
  let idx = 0;

  function next(): void {
    if (idx < lines.length) {
      statusMessage!.textContent = lines[idx++];
      setTimeout(next, 480);
    }
  }
  next();
}
