# Teamio

Teamio is a lightweight Trello/ClickUp-inspired workspace for the browser with a companion desktop shell. It focuses on a friendly, clean interface with quick task creation, drag-and-drop boards, and local-first persistence.

## Structure
- `web/` – static web app (HTML/CSS/JS) for the kanban experience.
- `desktop/` – Electron shell that loads the web app for a synced desktop experience.

## Getting started
### Web
Open `web/index.html` directly in a browser, or serve it with any static server.

### Desktop
```
cd desktop
npm install
npm start
```

> Note: The desktop app loads the same `web/index.html` file to keep the experience consistent across platforms.
