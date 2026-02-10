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
A GitHub Actions workflow is included at `.github/workflows/deploy-web.yml` and deploys the `web/` folder to GitHub Pages on every push to `main`.

### One-time setup
1. In GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Source: GitHub Actions**.
3. Push to `main` (or run the workflow manually from **Actions**).

After deploy, the app will be available at:
`https://<your-github-username>.github.io/<repository-name>/`

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
