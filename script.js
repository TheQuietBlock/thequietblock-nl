(() => {
  const HOST = "mc.thequietblock.nl";
  const API_URL = `https://api.mcsrvstat.us/3/${encodeURIComponent(HOST)}`;
  const COOLDOWN_MS = 8000;
  const PLACEHOLDER_TEXT =
    "Live server status will be shown here soon, including online/offline state and current player count.";

  const statusMessage = document.getElementById("status-message");
  const serverState = document.getElementById("server-state");
  const playerCount = document.getElementById("player-count");
  const serverVersion = document.getElementById("server-version");
  const serverMotd = document.getElementById("server-motd");
  const refreshButton = document.getElementById("refresh-status");
  const themeToggle = document.getElementById("theme-toggle");
  const THEME_KEY = "tqb-theme";
  const hasStatusUI =
    statusMessage && serverState && playerCount && serverVersion && serverMotd && refreshButton;

  let nextRefreshAt = 0;

  function setStatusText(text) {
    if (!statusMessage) {
      return;
    }
    statusMessage.textContent = text;
  }

  function setUnknownState(message) {
    if (!hasStatusUI) {
      return;
    }
    serverState.textContent = "Unknown";
    playerCount.textContent = "-/-";
    serverVersion.textContent = "Not available";
    serverMotd.textContent = "Not available";
    setStatusText(message);
  }

  function sanitizeMotd(value) {
    if (typeof value !== "string") {
      return "Not available";
    }
    const cleaned = value.replace(/\s+/g, " ").trim();
    return cleaned || "Not available";
  }

  function updateCooldownUI() {
    if (!refreshButton) {
      return;
    }
    const now = Date.now();
    const remaining = Math.max(0, nextRefreshAt - now);

    if (remaining === 0) {
      refreshButton.disabled = false;
      refreshButton.textContent = "Refresh Status";
      return;
    }

    refreshButton.disabled = true;
    refreshButton.textContent = `Refresh in ${Math.ceil(remaining / 1000)}s`;
    window.setTimeout(updateCooldownUI, 250);
  }

  async function fetchStatus() {
    if (!hasStatusUI) {
      return;
    }
    try {
      setStatusText("Fetching live server status...");
      const response = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const online = Boolean(data.online);
      if (!online) {
        serverState.textContent = "Offline";
        playerCount.textContent = "0/0";
        serverVersion.textContent = "Not available";
        serverMotd.textContent = "Not available";
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

      serverState.textContent = "Online";
      playerCount.textContent = `${onlinePlayers}/${maxPlayers}`;
      serverVersion.textContent = version;
      serverMotd.textContent = motd;
      setStatusText("Live server status loaded.");
    } catch (_error) {
      setUnknownState(PLACEHOLDER_TEXT);
    }
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      const now = Date.now();
      if (now < nextRefreshAt) {
        return;
      }

      nextRefreshAt = now + COOLDOWN_MS;
      updateCooldownUI();
      fetchStatus();
    });
  }

  function applyTheme(theme) {
    const nextTheme = theme === "rgb" ? "rgb" : "dark";
    document.body.setAttribute("data-theme", nextTheme);
    if (themeToggle) {
      themeToggle.textContent = nextTheme === "rgb" ? "Dark Mode" : "RGB Mode";
    }
    window.localStorage.setItem(THEME_KEY, nextTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme");
      applyTheme(currentTheme === "rgb" ? "dark" : "rgb");
    });
  }

  applyTheme(window.localStorage.getItem(THEME_KEY) || "dark");

  if (hasStatusUI) {
    setUnknownState(PLACEHOLDER_TEXT);
    fetchStatus();
  }
})();
