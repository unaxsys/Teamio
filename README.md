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

## Temporary hosting (GitHub Pages)
A GitHub Actions workflow is included at `.github/workflows/deploy-web.yml` and deploys the `web/` folder to GitHub Pages on every push (any branch), and it can also be started manually.

### One-time setup
1. In GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Source: GitHub Actions**.
3. Open **Actions** and run **Deploy web to GitHub Pages** once (or just push a commit).

After deploy, open exactly this URL:
`https://unaxsys.github.io/Teamio/`

### If you get 404
- Make sure you are opening exactly `https://unaxsys.github.io/Teamio/` (no extra characters after `/`).
- In **Actions**, confirm the latest run of **Deploy web to GitHub Pages** is green.
- In **Settings → Pages**, confirm source is **GitHub Actions**.
- Wait 1–3 minutes after a successful deploy and refresh (Ctrl+F5).

## Syncing with Pull Requests
If you open a PR on GitHub, your local files will only update after you fetch the branch or pull the merge result.

### Pull the PR branch locally
```
git fetch origin
git checkout <pr-branch-name>
git pull
```

### After merging the PR
```
git checkout main
git pull
```
