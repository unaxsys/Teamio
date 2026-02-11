# Teamio

Teamio is a lightweight Trello/ClickUp-inspired workspace for the browser with a companion desktop shell. It focuses on a friendly, clean interface with quick task creation, drag-and-drop boards, and local-first persistence.

## Product spec (BG)
Подробната MVP спецификация е в `docs/mvp-spec-bg.md`.

## Structure
- `web/` – static web app (HTML/CSS/JS) for the kanban experience.
- `desktop/` – Electron shell that loads the web app for a synced desktop experience.

## Getting started
### Web
Open `web/index.html` directly in a browser, or serve it with any static server.

### API server (file DB for auth)
For persistent login/registration data in a real file, run the backend:

```
cd server
npm start
```

This creates/uses `server/db.json` as the auth database.

By default the server binds to `0.0.0.0:8787` and prints the effective URL from `BASE_URL`.

You can set a public base URL (for verification/reset links):

```bash
cd server
BASE_URL="https://your-domain.com" npm start
```

### Real email delivery (verification + reset)
Teamio server can send real emails with configurable provider:

**Option A: Resend (default)**
```bash
cd server
EMAIL_PROVIDER="resend" \
RESEND_API_KEY="re_..." \
EMAIL_FROM="Teamio <noreply@your-domain.com>" \
BASE_URL="https://your-domain.com" \
npm start
```

**Option B: Brevo**
```bash
cd server
EMAIL_PROVIDER="brevo" \
BREVO_API_KEY="xkeysib-..." \
EMAIL_FROM="noreply@your-domain.com" \
BASE_URL="https://your-domain.com" \
npm start
```

Optional: `EMAIL_REPLY_TO="support@your-domain.com"`.

For debugging delivery errors during setup:
- set `EMAIL_DEBUG="true"` to receive provider error details in API response.
- once configured, set it back to `false`.

If both providers are configured, Teamio first tries `EMAIL_PROVIDER`, then automatically retries with the other provider.

Check current email configuration status:
```bash
curl http://localhost:8787/api/health/email
```

By default the web app still works in local demo mode.
To connect the UI to the API server, open browser console and set:

```js
localStorage.setItem("teamio-api-base", "http://localhost:8787")
location.reload()
```

> GitHub Pages is static hosting, so real email delivery and file-based DB writes are not possible there without an external backend service.

### Desktop
```
cd desktop
npm install
npm start
```

> Note: The desktop app loads the same `web/index.html` file to keep the experience consistent across platforms.

## Temporary hosting (GitHub Pages)
A GitHub Actions workflow is included at `.github/workflows/deploy-web.yml` and publishes the `web/` folder to a `gh-pages` branch.

### One-time setup
1. In GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Source: Deploy from a branch**.
3. Select **Branch: `gh-pages`** and folder **`/(root)`**, then Save.
4. Push to `main` or `work` (or run the workflow manually from **Actions**).

After deploy, open exactly this URL:
`https://unaxsys.github.io/Teamio/`

### If you get 404
- Make sure you are opening exactly `https://unaxsys.github.io/Teamio/` (no extra characters after `/`).
- In **Actions**, confirm the latest run of **Deploy web to GitHub Pages** is green.
- In **Settings → Pages**, confirm source is **Deploy from a branch** with `gh-pages` + `/(root)`.
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
