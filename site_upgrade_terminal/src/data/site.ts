export const siteMeta = {
  name: "TheQuietBlock",
  shortName: "TQB",
  domain: "thequietblock.nl",
  host: "mc.thequietblock.nl",
  applyReviewTime: "within 24 hours"
};

export const primaryNav = [
  { href: "/", label: "Home", page: "home" },
  { href: "/rules", label: "Rules", page: "rules" },
  { href: "/faq", label: "FAQ", page: "faq" },
  { href: "/community", label: "Community", page: "community" },
  { href: "/join", label: "Join", page: "join" }
] as const;

export const homeConsole = [
  { label: "server", value: "mc.thequietblock.nl" },
  { label: "access", value: "Whitelist required" },
  { label: "focus", value: "Calm community survival" },
  { label: "status", value: "Live check available" }
];

export const trustSignals = [
  {
    title: "Whitelist review stays human",
    body: "Applications are read by staff, not auto-approved by a bot. The join flow keeps the questions short and the review expectations explicit."
  },
  {
    title: "Status stays honest",
    body: "The live server module reports online, offline, or unknown. If the upstream check fails, the site resets to unknown instead of keeping stale green data on screen."
  },
  {
    title: "Rules are easy to scan",
    body: "The rules page is written for quick reading so players can understand the boundaries before they join the server."
  },
  {
    title: "The site matches the real routes",
    body: "Home, Rules, FAQ, Community, Join, and Status cover the actual live-site structure without prototype-only sections or invented records."
  }
];

export const rulesList = [
  {
    id: "01",
    title: "Respect other players.",
    body: "No harassment, no toxic behavior, and no real-world drama spillover. Keep chat civil and treat the server like a shared space."
  },
  {
    id: "02",
    title: "No griefing or stealing.",
    body: "Do not break, modify, or take anything that is not yours without permission. Small theft still counts and still damages trust."
  },
  {
    id: "03",
    title: "PvP by agreement only.",
    body: "Combat is allowed only when both players agree first. No trap bases, surprise ambushes, or kill setups aimed at other players."
  },
  {
    id: "04",
    title: "No cheats, exploits, or unfair mods.",
    body: "Hacked clients, x-ray, duplication glitches, auto-clickers, and similar advantages are not allowed. Performance and accessibility tools are fine unless they affect fair play."
  },
  {
    id: "05",
    title: "Build responsibly.",
    body: "Avoid lag machines, excessive entity counts, and redstone that runs constantly. If a build hurts server performance, staff may ask you to adjust it."
  },
  {
    id: "06",
    title: "Respect world integrity.",
    body: "Do not leave the world full of floating trees, crater fields, or strip-mined scars near shared areas. Clean up after major work."
  },
  {
    id: "07",
    title: "Give other bases room.",
    body: "Do not build too close to another player without checking first. Clear spacing helps the world stay readable and reduces conflict."
  },
  {
    id: "08",
    title: "Keep AFK use reasonable.",
    body: "Short AFK sessions are fine. Long-running setups that monopolize mob caps or keep the server under unnecessary load are not."
  },
  {
    id: "09",
    title: "Follow moderator decisions.",
    body: "Staff look after stability and fairness. If they ask you to stop, move, or change something, take that direction seriously."
  },
  {
    id: "10",
    title: "Play survival as intended.",
    body: "No creative perks, spawned items, or special gameplay advantages unless they are clearly announced to everyone."
  }
] as const;
