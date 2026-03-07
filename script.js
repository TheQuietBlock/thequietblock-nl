(() => {
  /* ============================================================
     SERVER STATUS
  ============================================================ */
  const HOST = "mc.thequietblock.nl";
  const API_URL = `https://api.mcsrvstat.us/3/${encodeURIComponent(HOST)}`;
  const COOLDOWN_MS = 8000;
  const PLACEHOLDER_TEXT =
    "Live server status will be shown here soon, including online/offline state and current player count.";

  const statusMessage  = document.getElementById("status-message");
  const serverState    = document.getElementById("server-state");
  const playerCount    = document.getElementById("player-count");
  const serverVersion  = document.getElementById("server-version");
  const serverMotd     = document.getElementById("server-motd");
  const refreshButton  = document.getElementById("refresh-status");
  const statusDot      = document.getElementById("status-dot");

  const hasStatusUI =
    statusMessage && serverState && playerCount && serverVersion && serverMotd && refreshButton;

  let nextRefreshAt = 0;

  function setStatusText(text) {
    if (!statusMessage) return;
    statusMessage.textContent = text;
  }

  function setServerState(text, state) {
    if (!serverState) return;
    serverState.textContent = text;
    serverState.className = state === "online" ? "is-online"
                          : state === "offline" ? "is-offline"
                          : "";
    if (statusDot) {
      statusDot.className = "status-dot " + (state === "online" ? "online"
                                           : state === "offline" ? "offline"
                                           : "");
    }
  }

  function setUnknownState(message) {
    if (!hasStatusUI) return;
    setServerState("Unknown", "unknown");
    playerCount.textContent  = "-/-";
    serverVersion.textContent = "Not available";
    serverMotd.textContent   = "Not available";
    setStatusText(message);
  }

  function sanitizeMotd(value) {
    if (typeof value !== "string") return "Not available";
    const cleaned = value.replace(/\s+/g, " ").trim();
    return cleaned || "Not available";
  }

  function updateCooldownUI() {
    if (!refreshButton) return;
    const remaining = Math.max(0, nextRefreshAt - Date.now());
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
    if (!hasStatusUI) return;
    try {
      setStatusText("Fetching live server status...");
      const response = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const online = Boolean(data.online);

      if (!online) {
        setServerState("Offline", "offline");
        playerCount.textContent  = "0/0";
        serverVersion.textContent = "Not available";
        serverMotd.textContent   = "Not available";
        setStatusText(PLACEHOLDER_TEXT);
        return;
      }

      const onlinePlayers = Number.isFinite(data.players?.online) ? data.players.online : 0;
      const maxPlayers    = Number.isFinite(data.players?.max)    ? data.players.max    : 0;
      const version       = typeof data.version === "string"      ? data.version        : "Not available";

      let motd = "Not available";
      if (Array.isArray(data.motd?.clean) && data.motd.clean.length > 0) {
        motd = sanitizeMotd(data.motd.clean.join(" "));
      } else if (typeof data.motd?.clean === "string") {
        motd = sanitizeMotd(data.motd.clean);
      }

      setServerState("Online", "online");
      playerCount.textContent  = `${onlinePlayers}/${maxPlayers}`;
      serverVersion.textContent = version;
      serverMotd.textContent   = motd;
      setStatusText("Live server status loaded.");
    } catch (_err) {
      setUnknownState(PLACEHOLDER_TEXT);
    }
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      const now = Date.now();
      if (now < nextRefreshAt) return;
      nextRefreshAt = now + COOLDOWN_MS;
      updateCooldownUI();
      fetchStatus();
    });
  }

  if (hasStatusUI) {
    setUnknownState(PLACEHOLDER_TEXT);
    fetchStatus();
  }

  /* ============================================================
     MATRIX RAIN CANVAS
  ============================================================ */
  function initMatrixRain() {
    const canvas = document.getElementById("matrix-canvas");
    if (!canvas) return;

    const ctx    = canvas.getContext("2d");
    const CHARS  = "0123456789ABCDEF!?/#@%&*[]<>{}\\|^~";
    const SIZE   = 13;
    let w, h, cols, drops, animId;

    function setup() {
      const parent = canvas.parentElement;
      w = canvas.width  = parent.offsetWidth  || 800;
      h = canvas.height = parent.offsetHeight || 300;
      ctx.clearRect(0, 0, w, h);
      cols = Math.max(1, Math.floor(w / SIZE));
      drops = Array.from({ length: cols }, () => ((Math.random() * -h) / SIZE) | 0);
    }

    function tick() {
      /* fade trail */
      ctx.fillStyle = "rgba(2, 5, 8, 0.055)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${SIZE}px "Share Tech Mono",monospace`;

      for (let i = 0; i < cols; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x    = i * SIZE;
        const y    = drops[i] * SIZE;

        /* lead char — bright white-green */
        ctx.fillStyle = "#b0ffe0";
        ctx.fillText(char, x, y);

        /* reset when off-screen */
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        else drops[i]++;
      }

      animId = requestAnimationFrame(tick);
    }

    setup();

    if (window.ResizeObserver) {
      new ResizeObserver(setup).observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", setup, { passive: true });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(animId); animId = null; }
      else if (!animId)    { animId = requestAnimationFrame(tick); }
    });

    animId = requestAnimationFrame(tick);
  }

  /* ============================================================
     GLITCH EFFECT on H1
  ============================================================ */
  function initGlitch() {
    const h1 = document.querySelector("h1");
    if (!h1) return;

    function glitch() {
      h1.classList.add("is-glitching");
      h1.addEventListener("animationend", () => h1.classList.remove("is-glitching"), { once: true });
      /* randomise next occurrence: every 8–20 s */
      setTimeout(glitch, 8000 + Math.random() * 12000);
    }

    /* first glitch after ~1.5 s */
    setTimeout(glitch, 1500);
  }

  /* ============================================================
     TYPING EFFECT on hero subtitle
  ============================================================ */
  function initTypingEffect() {
    const subtitle = document.querySelector(".hero .subtitle");
    if (!subtitle) return;

    const fullText = subtitle.textContent.trim();
    subtitle.textContent = "";
    subtitle.classList.add("has-cursor");

    let i = 0;
    const BASE_SPEED = 26; /* ms per character */

    function type() {
      if (i < fullText.length) {
        subtitle.textContent = fullText.slice(0, ++i);
        /* slight random jitter for realistic feel */
        setTimeout(type, BASE_SPEED + Math.random() * 18);
      }
      /* cursor stays blinking after done */
    }

    /* start after a short boot delay */
    setTimeout(type, 420);
  }

  /* ============================================================
     BOOT — brief terminal-style line in status message
  ============================================================ */
  function initBootSequence() {
    if (!statusMessage) return;
    const lines = [
      "Initialising connection...",
      "Pinging mc.thequietblock.nl...",
      "Fetching live server status..."
    ];
    let idx = 0;

    function next() {
      if (idx < lines.length) {
        statusMessage.textContent = lines[idx++];
        setTimeout(next, 480);
      }
    }
    next();
  }

  /* ============================================================
     RULES TERMINAL — reveal lines sequentially
  ============================================================ */
  function initRulesTerminal() {
    const rules   = document.querySelectorAll(".term-rule");
    const closing = document.querySelector(".term-closing");
    if (!rules.length) return;

    const STAGGER = 160; /* ms between each rule block */
    const START   = 300; /* initial delay */

    rules.forEach((rule, i) => {
      setTimeout(() => rule.classList.add("is-visible"), START + i * STAGGER);
    });

    if (closing) {
      setTimeout(
        () => closing.classList.add("is-visible"),
        START + rules.length * STAGGER + 200
      );
    }
  }

  /* ============================================================
     INIT
  ============================================================ */
  initMatrixRain();
  initGlitch();
  initTypingEffect();
  initBootSequence();
  initRulesTerminal();
})();
