# TheQuietBlock Terminal Refresh

This folder contains the terminal-first Astro refresh for TheQuietBlock.

## Safety

The current production-like static site in the repository root is untouched. This app lives entirely in `site_upgrade_terminal/`.

## Stack

- Astro with a Node adapter
- Content collections for FAQ entries
- Progressive enhancement for matrix rain, boot logs, live server status, and join form handling

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:4321`.

## Key routes

- `/`
- `/join`
- `/rules`
- `/faq`
- `/community`
- `/status`
