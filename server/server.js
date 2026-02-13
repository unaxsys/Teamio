import { createServer } from "node:http";
import fs from "fs";
import path from "path";
import { readFile, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const loadEnvFile = (envFilePath) => {
  try {
    const raw = fs.readFileSync(envFilePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex <= 0) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || process.env[key] !== undefined) continue;

      let value = trimmed.slice(separatorIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error("[Teamio] Грешка при зареждане на .env:", error);
    }
  }
};

loadEnvFile(path.join(__dirname, ".env"));

const DB_PATH = path.join(__dirname, "db.json");
const SQLITE_USERS_PATH = path.join(__dirname, "users.sqlite");
const DatabaseSync = (() => {
  try {
    return require("node:sqlite").DatabaseSync;
  } catch {
    return null;
  }
})();
const SQLITE_USERS_ENABLED = Boolean(DatabaseSync);
const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST || "0.0.0.0";
const BASE_URL = (process.env.BASE_URL || "").trim();
const WEB_DIR = path.join(__dirname, "../web");

const STATIC_CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const hashPassword = (password) => createHash("sha256").update(password).digest("hex");
const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizeText = (value = "") => value.trim();
const normalizeOptionalId = (value = "") => {
  const v = normalizeText(value);
  if (!v) return "";
  const lowered = v.toLowerCase();
  if (lowered === "undefined" || lowered === "null") return "";
  return v;
};

const normalizeWorkspaceRole = (role = "") => {
  const normalized = normalizeText(role).toLowerCase();
  if (["owner", "собственик"].includes(normalized)) return "Owner";
  if (normalized === "admin") return "Admin";
  if (normalized === "manager" || normalized === "мениджър") return "Manager";
  if (normalized === "viewer") return "Viewer";
  return "Member";
};

const EMAIL_PROVIDER = normalizeText(process.env.EMAIL_PROVIDER || "resend").toLowerCase();
const EMAIL_FROM = normalizeText(process.env.EMAIL_FROM || "");
const EMAIL_REPLY_TO = normalizeText(process.env.EMAIL_REPLY_TO || "");
const EMAIL_DEBUG = String(process.env.EMAIL_DEBUG || "false").toLowerCase() === "true";

const RESEND_API_KEY = normalizeText(process.env.RESEND_API_KEY || "");
const BREVO_API_KEY = normalizeText(process.env.BREVO_API_KEY || "");

const getConfiguredProviders = () => {
  const providers = [];
  if (RESEND_API_KEY) providers.push("resend");
  if (BREVO_API_KEY) providers.push("brevo");
  return providers;
};

const getPublicBaseUrl = (req) => {
  if (BASE_URL) {
    return BASE_URL;
  }

  const forwardedProto = normalizeText(req?.headers?.["x-forwarded-proto"] || "").split(",")[0];
  const forwardedHost = normalizeText(req?.headers?.["x-forwarded-host"] || "").split(",")[0];
  const host = forwardedHost || normalizeText(req?.headers?.host || "") || `localhost:${PORT}`;
  const protocol = forwardedProto || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}`;
};

const getEmailStatus = () => {
  if (!EMAIL_FROM) {
    return {
      configured: false,
      reason: "Липсва EMAIL_FROM.",
      preferredProvider: EMAIL_PROVIDER,
      availableProviders: getConfiguredProviders(),
    };
  }

  const availableProviders = getConfiguredProviders();
  if (availableProviders.length === 0) {
    return {
      configured: false,
      reason: "Липсва API ключ за email provider (RESEND_API_KEY или BREVO_API_KEY).",
      preferredProvider: EMAIL_PROVIDER,
      availableProviders,
    };
  }

  return {
    configured: true,
    preferredProvider: EMAIL_PROVIDER,
    availableProviders,
  };
};

const sendWithBrevo = async ({ to, subject, html, text }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: EMAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
      ...(EMAIL_REPLY_TO ? { replyTo: { email: EMAIL_REPLY_TO } } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API error: ${response.status} ${errorText}`);
  }
};

const sendWithResend = async ({ to, subject, html, text }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text,
      ...(EMAIL_REPLY_TO ? { reply_to: EMAIL_REPLY_TO } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} ${errorText}`);
  }
};

const sendEmail = async (payload) => {
  const status = getEmailStatus();
  if (!status.configured) {
    console.log(
      `[Teamio] Имейл fallback (console mode): до=${payload.to}; причина=${status.reason}; тема=${payload.subject}`
    );
    if (payload.text) {
      console.log(`[Teamio] Имейл съдържание (text): ${payload.text}`);
    }
    return { delivered: false, mode: "fallback", reason: status.reason };
  }

  const providersInOrder = [EMAIL_PROVIDER, ...status.availableProviders].filter(
    (provider, index, arr) => arr.indexOf(provider) === index
  );

  let lastError = null;
  for (const provider of providersInOrder) {
    try {
      if (provider === "brevo" && BREVO_API_KEY) {
        await sendWithBrevo(payload);
        return { delivered: true, mode: "provider", provider: "brevo" };
      }
      if (provider === "resend" && RESEND_API_KEY) {
        await sendWithResend(payload);
        return { delivered: true, mode: "provider", provider: "resend" };
      }
    } catch (error) {
      lastError = error;
      console.error(`[Teamio] Грешка при изпращане през ${provider}:`, error);
    }
  }

  throw lastError || new Error("Неуспешно изпращане на имейл. Няма активен доставчик.");
};

let usersSqlite = null;
let upsertUserStmt = null;
let deleteUserStmt = null;
let selectAllUsersStmt = null;

if (SQLITE_USERS_ENABLED) {
  usersSqlite = new DatabaseSync(SQLITE_USERS_PATH);
  usersSqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      accountId TEXT,
      role TEXT,
      teamIds TEXT,
      isEmailVerified INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER
    );
  `);

  upsertUserStmt = usersSqlite.prepare(`
    INSERT INTO users (id, name, email, password, accountId, role, teamIds, isEmailVerified, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      email=excluded.email,
      password=excluded.password,
      accountId=excluded.accountId,
      role=excluded.role,
      teamIds=excluded.teamIds,
      isEmailVerified=excluded.isEmailVerified,
      createdAt=excluded.createdAt;
  `);

  deleteUserStmt = usersSqlite.prepare(`DELETE FROM users WHERE id = ?`);
  selectAllUsersStmt = usersSqlite.prepare(`SELECT * FROM users`);
}

const normalizeSqliteUser = (user) => ({
  id: user.id,
  name: user.name,
  email: normalizeEmail(user.email),
  password: user.password,
  accountId: normalizeOptionalId(user.accountId),
  role: normalizeText(user.role) || "Member",
  teamIds: Array.isArray(user.teamIds) ? user.teamIds : [],
  isEmailVerified: Boolean(user.isEmailVerified),
  createdAt: Number.isFinite(Number(user.createdAt)) ? Number(user.createdAt) : Date.now(),
});

const hydrateSqliteUser = (row) => ({
  id: row.id,
  name: row.name,
  email: normalizeEmail(row.email),
  password: row.password,
  accountId: normalizeOptionalId(row.accountId),
  role: normalizeText(row.role) || "Member",
  teamIds: (() => {
    try {
      const parsed = JSON.parse(row.teamIds || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })(),
  isEmailVerified: Boolean(row.isEmailVerified),
  createdAt: Number.isFinite(Number(row.createdAt)) ? Number(row.createdAt) : Date.now(),
});

const writeUsersToSqlite = (users = []) => {
  if (!SQLITE_USERS_ENABLED) {
    return;
  }

  const normalizedUsers = users.map(normalizeSqliteUser);
  const incomingIds = new Set(normalizedUsers.map((user) => user.id));
  const existingRows = selectAllUsersStmt.all();

  usersSqlite.exec("BEGIN TRANSACTION");
  try {
    for (const user of normalizedUsers) {
      upsertUserStmt.run(
        user.id,
        user.name,
        user.email,
        user.password,
        user.accountId,
        user.role,
        JSON.stringify(user.teamIds ?? []),
        user.isEmailVerified ? 1 : 0,
        user.createdAt
      );
    }

    for (const row of existingRows) {
      if (!incomingIds.has(row.id)) {
        deleteUserStmt.run(row.id);
      }
    }
    usersSqlite.exec("COMMIT");
  } catch (error) {
    usersSqlite.exec("ROLLBACK");
    throw error;
  }
};

const readUsersFromSqlite = (fallbackUsers = []) => {
  if (!SQLITE_USERS_ENABLED) {
    return fallbackUsers.map(normalizeSqliteUser);
  }
  return selectAllUsersStmt.all().map(hydrateSqliteUser);
};

const readDb = async () => {
  try {
    const db = ensureDbShape(JSON.parse(await readFile(DB_PATH, "utf8")));
    try {
      db.users = readUsersFromSqlite(db.users);
    } catch (error) {
      console.error("[Teamio] Грешка при четене на users от SQLite. Ползва се db.json fallback:", error);
    }
    return db;
  } catch (error) {
    if (error?.code === "ENOENT") {
      const fallbackDb = ensureDbShape({});
      if (fallbackDb.users.length > 0) {
        writeUsersToSqlite(fallbackDb.users);
      }
      fallbackDb.users = readUsersFromSqlite();
      await writeDb(fallbackDb);
      return fallbackDb;
    }
    throw error;
  }
};
const writeDb = async (db) => {
  const nextDb = ensureDbShape(db);
  if (!SQLITE_USERS_ENABLED) {
    await writeFile(DB_PATH, JSON.stringify(nextDb, null, 2));
    return;
  }

  try {
    writeUsersToSqlite(nextDb.users ?? []);
    const dbWithoutUsers = { ...nextDb, users: [] };
    await writeFile(DB_PATH, JSON.stringify(dbWithoutUsers, null, 2));
  } catch (error) {
    console.error("[Teamio] Грешка при запис на users в SQLite. Ползва се db.json fallback:", error);
    await writeFile(DB_PATH, JSON.stringify(nextDb, null, 2));
  }
};

const ensureDbShape = (db) => {
  db.users ??= [];
  db.resetTokens ??= [];
  db.accounts ??= [];
  db.verificationTokens ??= [];
  db.invites ??= [];
  db.notifications ??= [];
  db.cards ??= [];
  db.workspaceStates ??= [];

  db.accounts = db.accounts.map((account) => {
    const ownerUserId = account.ownerUserId ?? null;
    const workspaces = Array.isArray(account.workspaces) && account.workspaces.length > 0
      ? account.workspaces
      : [{ id: `workspace-${Date.now()}`, name: "Основно пространство", description: "Главно работно пространство", ownerUserId, memberRoles: ownerUserId ? [{ userId: ownerUserId, role: "Owner" }] : [] }];

    return {
      ...account,
      createdAt: account.createdAt ?? Date.now(),
      status: ["active", "suspended"].includes(account.status) ? account.status : "active",
      plan: ["Free", "Pro", "Team"].includes(account.plan) ? account.plan : "Free",
      workspaces,
      teams: Array.isArray(account.teams) ? account.teams : [],
      members: Array.isArray(account.members) ? account.members : [],
      companyProfile: {
        vatId: normalizeText(account.companyProfile?.vatId ?? ""),
        vatNumber: normalizeText(account.companyProfile?.vatNumber ?? ""),
        address: normalizeText(account.companyProfile?.address ?? ""),
        logoDataUrl: normalizeText(account.companyProfile?.logoDataUrl ?? ""),
      },
    };
  });

  return db;
};

const bootstrapUsersToSqlite = async () => {
  if (!SQLITE_USERS_ENABLED) {
    return;
  }

  try {
    const db = ensureDbShape(JSON.parse(await readFile(DB_PATH, "utf8")));
    const sqliteUsers = readUsersFromSqlite();
    if (sqliteUsers.length === 0 && db.users.length > 0) {
      writeUsersToSqlite(db.users);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error("[Teamio] Грешка при миграция на users към SQLite:", error);
    }
  }
};

const send = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,OPTIONS",
  });
  res.end(JSON.stringify(payload));
};

const getUserRoleInAccount = (db, account, userId) => {
  if (!account || !userId) {
    return null;
  }

  if (account.ownerUserId === userId) {
    return "Owner";
  }

  const workspaceRoles = (account.workspaces ?? []).flatMap((workspace) => workspace.memberRoles ?? []);
  const workspaceRole = workspaceRoles.find((member) => member.userId === userId)?.role;
  if (workspaceRole) {
    return normalizeWorkspaceRole(workspaceRole);
  }

  const accountMemberRole = (account.members ?? []).find((member) => (member.userId ?? member.id) === userId)?.role;
  if (accountMemberRole) {
    return normalizeWorkspaceRole(accountMemberRole);
  }

  const userRole = db.users.find((user) => user.id === userId)?.role;
  return userRole ? normalizeWorkspaceRole(userRole) : null;
};

const isAccountMember = (db, account, userId) => {
  const user = db.users.find((item) => item.id === userId);
  if (!user || !account) {
    return false;
  }
  if (account.ownerUserId === userId) {
    return true;
  }
  if (user.accountId === account.id) {
    return true;
  }
  return (account.members ?? []).some((member) => (member.userId ?? member.id) === userId);
};

const canManageMembers = (db, account, userId) => {
  const role = getUserRoleInAccount(db, account, userId);
  return role === "Owner" || role === "Admin";
};

const canCreateCard = (db, account, userId) => {
  const role = getUserRoleInAccount(db, account, userId);
  return role === "Owner" || role === "Admin" || role === "Member";
};

const isAccountOwner = (account, userId) => Boolean(account && userId && account.ownerUserId === userId);

const canMutateCard = (db, account, userId, card) => {
  const role = getUserRoleInAccount(db, account, userId);
  if (role === "Owner" || role === "Admin") {
    return true;
  }
  if (role === "Member") {
    return card?.createdBy === userId;
  }
  return false;
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const sendStatic = (res, statusCode, body, contentType) => {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
};

const resolveStaticPath = (pathname) => {
  const relativePath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const requestedPath = path.resolve(WEB_DIR, relativePath || "index.html");
  const normalizedWebDir = `${WEB_DIR}${path.sep}`;
  if (requestedPath !== WEB_DIR && !requestedPath.startsWith(normalizedWebDir)) {
    return null;
  }
  return requestedPath;
};

const serveStaticFile = async (req, res, requestUrl) => {
  if (!["GET", "HEAD"].includes(req.method ?? "")) {
    return false;
  }

  if ((requestUrl?.pathname ?? "").startsWith("/api/")) return false;

  const isApiPath = requestUrl.pathname === "/api" || requestUrl.pathname.startsWith("/api/");
  if (isApiPath) {
    return false;
  }

  const requestedPath = resolveStaticPath(requestUrl.pathname);
  if (!requestedPath) {
    send(res, 403, { message: "Forbidden" });
    return true;
  }

  try {
    const file = await readFile(requestedPath);
    const contentType = STATIC_CONTENT_TYPES[path.extname(requestedPath).toLowerCase()] || "application/octet-stream";
    sendStatic(res, 200, req.method === "HEAD" ? "" : file, contentType);
    return true;
  } catch {
    try {
      const indexFilePath = path.join(WEB_DIR, "index.html");
      const indexFile = await readFile(indexFilePath);
      sendStatic(res, 200, req.method === "HEAD" ? "" : indexFile, STATIC_CONTENT_TYPES[".html"]);
      return true;
    } catch {
      return false;
    }
  }
};

/* =========================
   INVITES / NOTIFICATIONS HELPERS (NEW)
   ========================= */
const isInviteActive = (invite, now = Date.now()) => {
  if (!invite) return false;
  if (invite.acceptedAt || invite.declinedAt || invite.revokedAt) return false;
  if (typeof invite.expiresAt === "number" && invite.expiresAt <= now) return false;
  return true;
};

const createNotification = (db, { userId, type, title, message, payload }) => {
  if (!db.notifications) db.notifications = [];
  const now = Date.now();
  const id = `notif-${now}-${randomBytes(4).toString("hex")}`;
  const notification = {
    id,
    userId,
    type: normalizeText(type || "info"),
    title: normalizeText(title || "Известие"),
    message: normalizeText(message || ""),
    payload: payload && typeof payload === "object" ? payload : {},
    createdAt: now,
    readAt: null,
  };
  db.notifications.unshift(notification);
  return notification;
};

const markInviteNotificationsRead = (db, inviteId, userId) => {
  if (!db.notifications) return;
  const now = Date.now();
  db.notifications = db.notifications.map((n) => {
    const matchesInvite = n?.payload?.inviteId === inviteId;
    if (!matchesInvite) return n;
    if (userId && n.userId && n.userId !== userId) return n;
    if (n.readAt) return n;
    return { ...n, readAt: now };
  });
};

const mapInviteView = (db, invite) => {
  const account = db.accounts.find((entry) => entry.id === invite.accountId);
  const invitedByUser = db.users.find((entry) => entry.id === invite.invitedByUserId);
  const workspace = (account?.workspaces ?? []).find((entry) => entry.id === invite.workspaceId);
  return {
    ...invite,
    accountName: account?.name ?? null,
    invitedByName: invitedByUser?.name ?? invitedByUser?.email ?? null,
    workspaceName: workspace?.name ?? null,
    boardName: normalizeText(invite.boardName ?? "") || null,
  };
};

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 200, { ok: true });
    return;
  }

  const requestUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? `localhost:${PORT}`}`);

  if (requestUrl.pathname === "/api/health" && req.method === "GET") {
    send(res, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname === "/api/health/email" && req.method === "GET") {
    const status = getEmailStatus();
    send(res, 200, { ok: true, email: status, baseUrl: getPublicBaseUrl(req), baseUrlFromEnv: Boolean(BASE_URL) });
    return;
  }

  if (requestUrl.pathname === "/api/auth/register" && req.method === "POST") {
    const body = await readBody(req);
    const name = normalizeText(body.name);
    const email = normalizeEmail(body.email);
    const password = normalizeText(body.password);
    const inviteToken = normalizeText(body.inviteToken);

    if (!name || !email || password.length < 6) {
      send(res, 400, { message: "Невалидни данни за регистрация." });
      return;
    }

    const db = ensureDbShape(await readDb());
    if (db.users.some((user) => normalizeEmail(user.email) === email)) {
      send(res, 409, { message: "Този имейл вече е регистриран." });
      return;
    }

    const invite = db.invites.find(
      (item) =>
        item.token === inviteToken &&
        normalizeEmail(item.email) === email &&
        !item.usedAt &&
        !item.revokedAt &&
        item.expiresAt > Date.now()
    );

    let accountId = invite?.accountId;
    if (!accountId) {
      accountId = `account-${Date.now()}`;
      db.accounts.push({
        id: accountId,
        name: `${name} - фирма`,
        ownerUserId: null,
        plan: "Free",
        status: "active",
        createdAt: Date.now(),
        workspaces: [{ id: `workspace-${Date.now()}`, name: "Основно пространство", description: "Главно работно пространство", ownerUserId: null, memberRoles: [] }],
        teams: [
          { id: `team-${Date.now()}-1`, name: "Продуктов екип" },
          { id: `team-${Date.now()}-2`, name: "Инженерен екип" },
        ],
        members: [],
        companyProfile: {
          vatId: "",
          vatNumber: "",
          address: "",
          logoDataUrl: "",
        },
      });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password: hashPassword(password),
      accountId,
      role: invite?.role ?? "Собственик",
      teamIds: [],
      isEmailVerified: true,
      createdAt: Date.now(),
    };

    db.accounts = db.accounts.map((account) => {
      if (account.id !== accountId) {
        return account;
      }

      const nextAccount = {
        ...account,
        members: [
          ...(account.members ?? []).filter((member) => normalizeEmail(member.email ?? "") !== email),
          { id: newUser.id, userId: newUser.id, name, email, role: invite?.role ?? "Member", teamIds: [] },
        ],
      };

      if (!invite) {
        nextAccount.ownerUserId = newUser.id;
      }

      nextAccount.workspaces = (nextAccount.workspaces ?? []).map((workspace) => {
        const shouldGrantWorkspaceRole = !invite || !invite.workspaceId || workspace.id === invite.workspaceId;
        return {
          ...workspace,
          ownerUserId: !invite ? newUser.id : (workspace.ownerUserId ?? nextAccount.ownerUserId ?? null),
          memberRoles: shouldGrantWorkspaceRole
            ? [
                ...(workspace.memberRoles ?? []).filter((member) => member.userId !== newUser.id),
                { userId: newUser.id, role: invite?.role ?? (!invite ? "Owner" : "Member") },
              ]
            : (workspace.memberRoles ?? []),
        };
      });

      return nextAccount;
    });

    if (invite) {
      db.invites = db.invites.map((item) =>
        item.id === invite.id ? { ...item, usedAt: Date.now(), acceptedUserId: newUser.id } : item
      );
    }

    db.users.push(newUser);
    await writeDb(db);

    send(res, 201, { message: "Регистрацията е успешна." });
    return;
  }

  if (requestUrl.pathname === "/api/auth/verify-email" && req.method === "POST") {
    const body = await readBody(req);
    const token = normalizeText(body.token);
    if (!token) {
      send(res, 400, { message: "Невалиден линк за потвърждение." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const tokenRecord = db.verificationTokens.find((item) => item.tokenHash === tokenHash);

    if (!tokenRecord) {
      send(res, 400, { message: "Линкът за потвърждение е невалиден." });
      return;
    }

    if (tokenRecord.usedAt) {
      send(res, 400, { message: "Този линк вече е използван." });
      return;
    }

    if (tokenRecord.expiresAt < Date.now()) {
      send(res, 400, { message: "Линкът за потвърждение е изтекъл." });
      return;
    }

    db.users = db.users.map((user) =>
      user.id === tokenRecord.userId || normalizeEmail(user.email) === normalizeEmail(tokenRecord.email)
        ? { ...user, isEmailVerified: true }
        : user
    );
    db.verificationTokens = db.verificationTokens.map((item) =>
      item.tokenHash === tokenHash ? { ...item, usedAt: Date.now() } : item
    );

    await writeDb(db);
    send(res, 200, { message: "Имейлът е потвърден успешно." });
    return;
  }

  if (requestUrl.pathname === "/api/auth/login" && req.method === "POST") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const password = normalizeText(body.password);

    const db = ensureDbShape(await readDb());
    const hashed = hashPassword(password);
    const user = db.users.find((item) => normalizeEmail(item.email) === email && item.password === hashed);

    if (!user) {
      send(res, 401, { message: "Невалидни данни. Провери имейла и паролата." });
      return;
    }

    if (user.isEmailVerified === false) {
      send(res, 403, { message: "Потвърди имейла си преди вход." });
      return;
    }

    const account = db.accounts.find((item) => item.id === user.accountId);
    const workspaces = account?.workspaces ?? [];
    const membershipWorkspace = workspaces.find((workspace) =>
      (workspace.memberRoles ?? []).some((member) => member.userId === user.id)
    );
    const workspaceId = membershipWorkspace?.id ?? workspaces[0]?.id ?? null;

    send(res, 200, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountId: user.accountId,
        workspaceId,
        role: user.role,
        teamIds: user.teamIds ?? [],
      },
      account: account ?? null,
    });
    return;
  }

  if (requestUrl.pathname === "/api/auth/forgot-password" && req.method === "POST") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const db = ensureDbShape(await readDb());
    const user = db.users.find((item) => normalizeEmail(item.email) === email);

    if (user) {
      const token = randomBytes(16).toString("hex");
      const resetLink = `${getPublicBaseUrl(req)}/?reset=${token}`;

      db.resetTokens.push({ token, email, createdAt: Date.now() });
      await writeDb(db);

      send(res, 200, {
        message: "Отвори страницата за смяна на парола.",
        resetLink,
      });
      return;
    }

    send(res, 200, { message: "Ако имейлът съществува, изпратихме линк за смяна на парола." });
    return;
  }

  if (requestUrl.pathname === "/api/auth/reset-password" && req.method === "POST") {
    const body = await readBody(req);
    const token = normalizeText(body.token);
    const password = normalizeText(body.password);

    if (!token || password.length < 6) {
      send(res, 400, { message: "Невалидна заявка за смяна на парола." });
      return;
    }

    const db = await readDb();
    const tokenRecord = db.resetTokens.find((item) => item.token === token);

    if (!tokenRecord) {
      send(res, 400, { message: "Линкът за възстановяване е невалиден." });
      return;
    }

    db.users = db.users.map((user) =>
      normalizeEmail(user.email) === normalizeEmail(tokenRecord.email)
        ? { ...user, password: hashPassword(password) }
        : user
    );

    db.resetTokens = db.resetTokens.filter((item) => item.token !== token);
    await writeDb(db);

    send(res, 200, { message: "Паролата е обновена." });
    return;
  }

  if (requestUrl.pathname === "/api/accounts/context" && req.method === "GET") {
    const accountId = normalizeText(requestUrl.searchParams.get("accountId") ?? "");
    const requesterUserId = normalizeText(requestUrl.searchParams.get("requesterUserId") ?? "");

    if (!accountId || !requesterUserId) {
      send(res, 400, { message: "Липсват accountId/requesterUserId." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    if (!isAccountMember(db, account, requesterUserId)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    send(res, 200, { account });
    return;
  }

  if (requestUrl.pathname === "/api/accounts/company-profile" && req.method === "GET") {
    const accountId = normalizeText(requestUrl.searchParams.get("accountId") ?? "");
    const requesterUserId = normalizeText(requestUrl.searchParams.get("requesterUserId") ?? "");

    if (!accountId || !requesterUserId) {
      send(res, 400, { message: "Липсват accountId/requesterUserId." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    if (!isAccountOwner(account, requesterUserId)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    send(res, 200, {
      companyProfile: {
        name: account.name ?? "",
        vatId: account.companyProfile?.vatId ?? "",
        vatNumber: account.companyProfile?.vatNumber ?? "",
        address: account.companyProfile?.address ?? "",
        logoDataUrl: account.companyProfile?.logoDataUrl ?? "",
      },
    });
    return;
  }

  if (requestUrl.pathname === "/api/accounts/company-profile" && req.method === "POST") {
    const body = await readBody(req);
    const accountId = normalizeText(body.accountId);
    const requesterUserId = normalizeText(body.requesterUserId);
    const name = normalizeText(body.name);
    const vatId = normalizeText(body.vatId);
    const vatNumber = normalizeText(body.vatNumber);
    const address = normalizeText(body.address);
    const logoDataUrl = normalizeText(body.logoDataUrl);

    if (!accountId || !requesterUserId || !name) {
      send(res, 400, { message: "Липсват задължителни данни." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    if (!isAccountOwner(account, requesterUserId)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    db.accounts = db.accounts.map((item) =>
      item.id === accountId
        ? {
            ...item,
            name,
            companyProfile: {
              ...(item.companyProfile ?? {}),
              vatId,
              vatNumber,
              address,
              logoDataUrl,
            },
          }
        : item
    );

    await writeDb(db);
    send(res, 200, {
      companyProfile: {
        name,
        vatId,
        vatNumber,
        address,
        logoDataUrl,
      },
    });
    return;
  }

  if (requestUrl.pathname === "/api/users/by-email" && req.method === "GET") {
    const email = normalizeEmail(requestUrl.searchParams.get("email") ?? "");
    if (!email) {
      send(res, 400, { message: "Липсва имейл." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const user = db.users.find((item) => normalizeEmail(item.email) === email);
    if (!user) {
      send(res, 200, { user: null });
      return;
    }

    send(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        accountId: user.accountId ?? null,
        role: user.role ?? "Member",
      },
    });
    return;
  }

  /* =========================
     INVITES INBOX (NEW)
     - This is what the invited user calls to SEE their invites
     ========================= */
  if (requestUrl.pathname === "/api/invites/inbox" && req.method === "GET") {
    const userId = normalizeText(requestUrl.searchParams.get("userId") ?? "");
    const email = normalizeEmail(requestUrl.searchParams.get("email") ?? "");

    if (!userId && !email) {
      send(res, 400, { message: "Липсва userId или email." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const resolvedUser = userId ? db.users.find((u) => u.id === userId) : db.users.find((u) => normalizeEmail(u.email) === email);

    const resolvedUserId = resolvedUser?.id ?? (userId || "");
    const resolvedEmail = resolvedUser ? normalizeEmail(resolvedUser.email) : email;

    const now = Date.now();

    const invites = db.invites
      .filter((invite) => {
        if (!isInviteActive(invite, now)) return false;
        const byUser = resolvedUserId ? invite.invitedUserId === resolvedUserId : false;
        const byEmail = resolvedEmail ? normalizeEmail(invite.email) === resolvedEmail : false;
        return byUser || byEmail;
      })
      .map((invite) => mapInviteView(db, invite));

    send(res, 200, { invites });
    return;
  }

  if (requestUrl.pathname === "/api/invites" && req.method === "GET") {
    const accountId = normalizeText(requestUrl.searchParams.get("accountId") ?? "");
    const email = normalizeEmail(requestUrl.searchParams.get("email") ?? "");
    const userId = normalizeText(requestUrl.searchParams.get("userId") ?? "");
    const requesterUserId = normalizeText(requestUrl.searchParams.get("requesterUserId") ?? "");

    const db = ensureDbShape(await readDb());
    let canReadAccountInvites = false;

    if (accountId && requesterUserId) {
      const account = db.accounts.find((item) => item.id === accountId);
      if (!account && !email) {
        send(res, 404, { message: "Фирмата не е намерена." });
        return;
      }

      if (account && canManageMembers(db, account, requesterUserId)) {
        canReadAccountInvites = true;
      } else if (!email && !userId) {
        send(res, 403, { message: "Forbidden" });
        return;
      }
    }

    const invites = db.invites
      .filter((invite) => {
        const byAccount = canReadAccountInvites ? invite.accountId === accountId : false;
        const byEmail = email ? normalizeEmail(invite.email) === email : false;
        const byInvitedUser = userId ? invite.invitedUserId === userId : false;
        return byAccount || byEmail || byInvitedUser;
      })
      .map((invite) => mapInviteView(db, invite));

    send(res, 200, { invites });
    return;
  }

  if (requestUrl.pathname === "/api/invites" && req.method === "POST") {
    const body = await readBody(req);
    const accountId = normalizeText(body.accountId);
    const invitedByUserId = normalizeText(body.invitedByUserId);
    const email = normalizeEmail(body.email);
    const invitedUserId = normalizeText(body.invitedUserId);
    const role = normalizeWorkspaceRole(body.role || "Member");
    const workspaceId = normalizeOptionalId(body.workspaceId);
    const boardId = normalizeOptionalId(body.boardId);
    const boardName = normalizeText(body.boardName);

    if (!accountId || (!email && !invitedUserId) || !invitedByUserId) {
      send(res, 400, { message: "Липсват данни за покана (accountId/email|invitedUserId/invitedByUserId)." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    // Prevent self-invite
    const inviter = db.users.find((u) => u.id === invitedByUserId) ?? null;
    if (inviter && ((email && normalizeEmail(inviter.email) === email) || invitedByUserId === invitedUserId)) {
      send(res, 409, { message: "Не можеш да поканиш самия себе си." });
      return;
    }

    if (!canManageMembers(db, account, invitedByUserId)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    let resolvedWorkspaceId = normalizeText(workspaceId);

    // ако идва грешен workspaceId (пример: от друг акаунт / localStorage), не връщаме грешка,
    // а fallback-ваме към първото workspace на акаунта
    if (resolvedWorkspaceId && !(account.workspaces ?? []).some((workspace) => workspace.id === resolvedWorkspaceId)) {
      resolvedWorkspaceId = (account.workspaces ?? [])[0]?.id ?? null;
    }

    // ако пак няма workspace – оставяме null
    if (!resolvedWorkspaceId) resolvedWorkspaceId = null;

    const existingUserById = invitedUserId ? db.users.find((item) => item.id === invitedUserId) ?? null : null;
    const existingUserByEmail = email ? db.users.find((item) => normalizeEmail(item.email) === email) ?? null : null;
    const existingUser = existingUserById ?? existingUserByEmail;

    if (invitedUserId && !existingUserById && !email) {
      send(res, 404, { message: "Потребител с това ID не е намерен. Покани го по имейл, за да споделиш линк." });
      return;
    }

    const targetEmail = normalizeEmail(existingUser?.email ?? email);

    // If the user exists AND is already a member -> don't create invite
    if (existingUser && isAccountMember(db, account, existingUser.id)) {
      send(res, 409, { message: "Потребителят вече има достъп до тази фирма." });
      return;
    }

    const now = Date.now();

    // Revoke previous active invite for same target/account/email
    db.invites = db.invites.map((item) => {
      const sameTargetByUser = existingUser?.id ? item.accountId === accountId && item.invitedUserId === existingUser.id : false;
      const sameTargetByEmail = targetEmail ? item.accountId === accountId && normalizeEmail(item.email) === targetEmail : false;
      const sameTarget = sameTargetByUser || sameTargetByEmail;
      const isActive = isInviteActive(item, now);
      if (sameTarget && isActive) {
        return {
          ...item,
          revokedAt: now,
          revokedByUserId: invitedByUserId || null,
          revokedReason: "replaced",
        };
      }
      return item;
    });

    const invite = {
      id: `invite-${Date.now()}`,
      accountId,
      invitedByUserId: invitedByUserId || null,
      invitedUserId: existingUser?.id ?? null,
      email: targetEmail,
      role,
      workspaceId: resolvedWorkspaceId,
      boardId: boardId || null,
      boardName: boardName || null,
      delivery: existingUser ? "internal" : "email",
      token: randomBytes(16).toString("hex"),
      createdAt: now,
      expiresAt: now + 48 * 60 * 60 * 1000,
      acceptedAt: null,
      declinedAt: null,
      revokedAt: null,
      usedAt: null,
      acceptedUserId: null,
      declinedUserId: null,
      revokedByUserId: null,
      revokedReason: null,
    };

    db.invites.unshift(invite);

    // NEW: notification for internal invites so it shows inside invited user's account
    if (existingUser?.id) {
      createNotification(db, {
        userId: existingUser.id,
        type: "invite",
        title: "Нова покана",
        message: `Имаш покана за достъп до ${account.name ?? "Teamio"}`,
        payload: {
          inviteId: invite.id,
          accountId: invite.accountId,
          accountName: account.name ?? null,
          invitedByUserId: invitedByUserId || null,
          workspaceId: invite.workspaceId,
          boardId: invite.boardId,
          boardName: invite.boardName,
          email: invite.email,
          role: invite.role,
        },
      });
    }

    await writeDb(db);

    let deliveryReport = null;
    if (!existingUser) {
      try {
        const inviteLink = `${getPublicBaseUrl(req)}/?invite=${invite.token}`;
        deliveryReport = await sendEmail({
          to: email,
          subject: `Покана за достъп до ${account.name ?? "Teamio"}`,
          text: `Получаваш покана за Teamio. Отвори линка: ${inviteLink}`,
          html: `<p>Получаваш покана за Teamio.</p><p><a href="${inviteLink}">${inviteLink}</a></p>`,
        });
      } catch (error) {
        console.error("[Teamio] Грешка при изпращане на invite имейл:", error);
        deliveryReport = { delivered: false, mode: "error", reason: error?.message || "Грешка при изпращане." };
      }
    }

    send(res, 201, {
      invite: mapInviteView(db, invite),
      delivery: invite.delivery,
      existingUserId: existingUser?.id ?? null,
      deliveryReport,
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites/revoke" && req.method === "POST") {
    const body = await readBody(req);
    const inviteId = normalizeText(body.inviteId);
    const accountId = normalizeText(body.accountId);
    const requesterUserId = normalizeText(body.requesterUserId);

    if (!inviteId || !accountId || !requesterUserId) {
      send(res, 400, { message: "Липсват данни за отмяна на поканата." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    if (!canManageMembers(db, account, requesterUserId)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    const invite = db.invites.find((item) => item.id === inviteId && item.accountId === accountId);
    if (!invite) {
      send(res, 404, { message: "Поканата не е намерена." });
      return;
    }

    if (!isInviteActive(invite, Date.now())) {
      send(res, 409, { message: "Поканата не е активна." });
      return;
    }

    const now = Date.now();
    db.invites = db.invites.map((item) =>
      item.id === inviteId
        ? { ...item, revokedAt: now, revokedByUserId: requesterUserId, revokedReason: "manual" }
        : item
    );

    await writeDb(db);

    send(res, 200, { invite: mapInviteView(db, db.invites.find((item) => item.id === inviteId) ?? null) });
    return;
  }

  if (requestUrl.pathname === "/api/workspaces/members-summary" && req.method === "GET") {
    const accountId = normalizeText(requestUrl.searchParams.get("accountId") ?? "");
    const requesterUserId = normalizeText(requestUrl.searchParams.get("requesterUserId") ?? "");

    if (!accountId || !requesterUserId) {
      send(res, 400, { message: "Липсват accountId/requesterUserId." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    if (!canManageMembers(db, account, requesterUserId)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    const now = Date.now();
    const pendingInvites = db.invites
      .filter((invite) => invite.accountId === accountId && isInviteActive(invite, now))
      .map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: normalizeWorkspaceRole(invite.role),
        invitedByUserId: invite.invitedByUserId ?? null,
        createdAt: invite.createdAt ?? (Number.parseInt((invite.id || "").split("-")[1], 10) || Date.now()),
      }));

    const members = (account.members ?? []).map((member) => {
      const memberUserId = member.userId ?? member.id ?? null;
      const linkedUser = memberUserId ? db.users.find((user) => user.id === memberUserId) : null;
      return {
        id: member.id ?? memberUserId,
        userId: memberUserId,
        name: member.name ?? linkedUser?.name ?? member.email ?? "Потребител",
        email: member.email ?? linkedUser?.email ?? "",
        role: normalizeWorkspaceRole(member.role ?? linkedUser?.role ?? "Member"),
        joinedAt: linkedUser?.createdAt ?? null,
      };
    });

    send(res, 200, {
      pendingCount: pendingInvites.length,
      pendingInvites,
      acceptedMembers: members,
    });
    return;
  }

  if (requestUrl.pathname === "/api/accounts/members/remove" && req.method === "POST") {
    const body = await readBody(req);
    const accountId = normalizeText(body.accountId);
    const requesterUserId = normalizeText(body.requesterUserId);
    const memberUserId = normalizeText(body.memberUserId);
    const memberEmail = normalizeEmail(body.memberEmail);

    if (!accountId || !requesterUserId || (!memberUserId && !memberEmail)) {
      send(res, 400, { message: "Липсват данни за премахване на достъп." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    if (!isAccountOwner(account, requesterUserId)) {
      send(res, 403, { message: "Само собственикът може да премахва достъп." });
      return;
    }

    if (memberUserId && memberUserId === account.ownerUserId) {
      send(res, 409, { message: "Собственикът не може да премахне себе си." });
      return;
    }

    const shouldRemoveMember = (member) => {
      const currentUserId = member.userId ?? member.id ?? "";
      const currentEmail = normalizeEmail(member.email ?? "");
      return (memberUserId && currentUserId === memberUserId) || (memberEmail && currentEmail === memberEmail);
    };

    let removedUserId = memberUserId || null;
    let removedEmail = memberEmail || "";
    const targetMember = (account.members ?? []).find((member) => shouldRemoveMember(member));
    if (!targetMember) {
      send(res, 404, { message: "Членът не е намерен в тази фирма." });
      return;
    }

    removedUserId = removedUserId || targetMember.userId || targetMember.id || null;
    removedEmail = removedEmail || normalizeEmail(targetMember.email ?? "");

    if (removedUserId && removedUserId === account.ownerUserId) {
      send(res, 409, { message: "Собственикът не може да бъде премахнат." });
      return;
    }

    const ownerEmail = normalizeEmail(db.users.find((user) => user.id === account.ownerUserId)?.email ?? "");
    if (!removedUserId && removedEmail && ownerEmail && removedEmail === ownerEmail) {
      send(res, 409, { message: "Собственикът не може да бъде премахнат." });
      return;
    }

    db.accounts = db.accounts.map((entry) => {
      if (entry.id !== accountId) {
        return entry;
      }

      const nextMembers = (entry.members ?? []).filter((member) => !shouldRemoveMember(member));
      const nextWorkspaces = (entry.workspaces ?? []).map((workspace) => ({
        ...workspace,
        memberRoles: (workspace.memberRoles ?? []).filter((member) => member.userId !== removedUserId),
      }));

      return {
        ...entry,
        members: nextMembers,
        workspaces: nextWorkspaces,
      };
    });

    db.users = db.users.map((user) => {
      const emailMatches = removedEmail ? normalizeEmail(user.email) === removedEmail : false;
      if ((removedUserId && user.id === removedUserId) || emailMatches) {
        if (user.accountId === accountId) {
          return { ...user, accountId: null };
        }
      }
      return user;
    });

    await writeDb(db);
    send(res, 200, { ok: true, removedUserId, removedEmail });
    return;
  }

  if (requestUrl.pathname === "/api/workspace-state" && req.method === "GET") {
    const accountId = normalizeText(requestUrl.searchParams.get("accountId") ?? "");
    const workspaceId = normalizeText(requestUrl.searchParams.get("workspaceId") ?? "");
    const requesterUserId = normalizeText(requestUrl.searchParams.get("requesterUserId") ?? "");

    if (!accountId || !workspaceId || !requesterUserId) {
      send(res, 400, { message: "Липсват accountId/workspaceId/requesterUserId." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    if (!isAccountMember(db, account, requesterUserId)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    const state = (db.workspaceStates ?? []).find(
      (entry) => entry.accountId === accountId && entry.workspaceId === workspaceId
    );

    send(res, 200, {
      state: state?.payload ?? null,
      updatedAt: state?.updatedAt ?? null,
    });
    return;
  }

  if (requestUrl.pathname === "/api/workspace-state" && req.method === "PUT") {
    const body = await readBody(req);
    const accountId = normalizeText(body.accountId);
    const workspaceId = normalizeText(body.workspaceId);
    const requesterUserId = normalizeText(body.requesterUserId);
    const payload = body.payload;

    if (!accountId || !workspaceId || !requesterUserId || !payload || typeof payload !== "object") {
      send(res, 400, { message: "Липсват валидни данни за синхронизация." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    if (!isAccountMember(db, account, requesterUserId)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    const now = Date.now();
    const nextState = {
      id: `workspace-state-${accountId}-${workspaceId}`,
      accountId,
      workspaceId,
      updatedBy: requesterUserId,
      updatedAt: now,
      payload,
    };

    db.workspaceStates = (db.workspaceStates ?? []).filter(
      (entry) => !(entry.accountId === accountId && entry.workspaceId === workspaceId)
    );
    db.workspaceStates.unshift(nextState);

    await writeDb(db);
    send(res, 200, { ok: true, updatedAt: now });
    return;
  }

  if (requestUrl.pathname === "/api/cards" && req.method === "POST") {
    const body = await readBody(req);
    const accountId = normalizeText(body.accountId);
    const requesterUserId = normalizeText(body.requesterUserId);
    const boardId = normalizeText(body.boardId);
    const listId = normalizeText(body.listId || body.column);
    const title = normalizeText(body.title);

    if (!accountId || !requesterUserId || !boardId || !listId || !title) {
      send(res, 400, { message: "Липсват задължителни полета за карта." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    if (!isAccountMember(db, account, requesterUserId) || !canCreateCard(db, account, requesterUserId)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    const now = Date.now();
    const card = {
      id: `card-${now}`,
      accountId,
      boardId,
      listId,
      title,
      description: normalizeText(body.description || ""),
      due: normalizeText(body.due || ""),
      level: normalizeText(body.level || "L2"),
      createdBy: requesterUserId,
      createdAt: now,
      updatedAt: now,
    };

    db.cards.unshift(card);
    await writeDb(db);
    send(res, 201, { card });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/cards/") && ["PATCH", "DELETE"].includes(req.method ?? "")) {
    const cardId = normalizeText(requestUrl.pathname.split("/").pop() ?? "");
    const body = req.method === "PATCH" ? await readBody(req) : {};
    const requesterUserId = normalizeText((body?.requesterUserId ?? requestUrl.searchParams.get("requesterUserId") ?? ""));

    if (!cardId || !requesterUserId) {
      send(res, 400, { message: "Липсва cardId/requesterUserId." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const card = db.cards.find((item) => item.id === cardId);
    if (!card) {
      send(res, 404, { message: "Картата не е намерена." });
      return;
    }

    const account = db.accounts.find((item) => item.id === card.accountId);
    if (!account || !isAccountMember(db, account, requesterUserId) || !canMutateCard(db, account, requesterUserId, card)) {
      send(res, 403, { message: "Forbidden" });
      return;
    }

    if (req.method === "DELETE") {
      db.cards = db.cards.filter((item) => item.id !== cardId);
      await writeDb(db);
      send(res, 200, { ok: true });
      return;
    }

    const now = Date.now();
    db.cards = db.cards.map((item) =>
      item.id === cardId
        ? {
            ...item,
            title: normalizeText(body.title || item.title),
            description: normalizeText(body.description ?? item.description ?? ""),
            due: normalizeText(body.due ?? item.due ?? ""),
            level: normalizeText(body.level ?? item.level ?? "L2"),
            listId: normalizeText(body.listId ?? item.listId),
            updatedAt: now,
          }
        : item
    );

    await writeDb(db);
    send(res, 200, { card: db.cards.find((item) => item.id === cardId) });
    return;
  }

  if (requestUrl.pathname === "/api/invites/respond" && req.method === "POST") {
    const body = await readBody(req);
    const inviteId = normalizeText(body.inviteId);
    const action = normalizeText(body.action).toLowerCase();
    let userId = normalizeText(body.userId);
    const email = normalizeEmail(body.email);

    if (!inviteId || !["accept", "decline"].includes(action)) {
      send(res, 400, { message: "Невалидна заявка за покана." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const invite = db.invites.find((item) => item.id === inviteId);
    if (!invite) {
      send(res, 404, { message: "Поканата не е намерена." });
      return;
    }

    // Resolve userId by email if missing
    if (!userId && email) {
      const u = db.users.find((x) => normalizeEmail(x.email) === email) ?? null;
      if (u) userId = u.id;
    }

    // Validate target
    if (email && normalizeEmail(invite.email) !== email) {
      send(res, 403, { message: "Поканата не е за този имейл." });
      return;
    }

    if (invite.invitedUserId && userId && invite.invitedUserId !== userId) {
      send(res, 403, { message: "Поканата не е за този потребител." });
      return;
    }

    if (!isInviteActive(invite, Date.now())) {
      send(res, 400, { message: "Поканата е невалидна." });
      return;
    }

    const now = Date.now();

    if (action === "accept") {
      // Mark invite accepted
      db.invites = db.invites.map((item) =>
        item.id === inviteId
          ? { ...item, acceptedAt: now, acceptedUserId: userId || item.acceptedUserId || null, declinedAt: null, usedAt: now }
          : item
      );

      // Add member to account + workspace role
      db.accounts = db.accounts.map((account) => {
        if (account.id !== invite.accountId) {
          return account;
        }

        // If userId is known, prevent duplicates by userId and/or email
        const existingMemberByEmail = (account.members ?? []).find((member) => normalizeEmail(member.email ?? "") === normalizeEmail(invite.email));
        const existingMemberByUserId = userId ? (account.members ?? []).find((m) => (m.userId ?? m.id) === userId) : null;

        const nextMembers = existingMemberByUserId || existingMemberByEmail
          ? (account.members ?? []).map((member) => {
              const memberEmail = normalizeEmail(member.email ?? "");
              const memberId = member.userId ?? member.id ?? "";
              const matches = (userId && memberId === userId) || (memberEmail && memberEmail === normalizeEmail(invite.email));
              if (!matches) return member;
              return {
                ...member,
                userId: member.userId ?? userId ?? null,
                email: member.email ?? invite.email,
                role: invite.role ?? member.role ?? "Member",
              };
            })
          : [
              ...(account.members ?? []),
              {
                id: userId || `member-${Date.now()}`,
                userId: userId || null,
                name: invite.email,
                email: invite.email,
                role: invite.role ?? "Member",
                teamIds: [],
              },
            ];

        const nextWorkspaces = (account.workspaces ?? []).map((workspace) => {
          const shouldGrantWorkspaceRole = !invite.workspaceId || workspace.id === invite.workspaceId;
          if (!shouldGrantWorkspaceRole) {
            return workspace;
          }
          if (!userId) return workspace;

          const existingWorkspaceMember = (workspace.memberRoles ?? []).find((member) => member.userId === userId);
          return {
            ...workspace,
            memberRoles: existingWorkspaceMember
              ? (workspace.memberRoles ?? []).map((member) =>
                  member.userId === userId ? { ...member, role: invite.role ?? member.role ?? "Member" } : member
                )
              : [...(workspace.memberRoles ?? []), { userId, role: invite.role ?? "Member" }],
          };
        });

        return {
          ...account,
          members: nextMembers,
          workspaces: nextWorkspaces,
        };
      });

      // IMPORTANT: за текущия модел (1 активен account на потребител),
      // при accept прехвърляме потребителя към акаунта на поканата
      if (userId) {
        db.users = db.users.map((u) => {
          if (u.id !== userId) return u;
          return { ...u, accountId: invite.accountId };
        });
      }

      // Mark invite notifications as read
      markInviteNotificationsRead(db, inviteId, userId || null);

    } else {
      db.invites = db.invites.map((item) =>
        item.id === inviteId ? { ...item, declinedAt: now, declinedUserId: userId || null } : item
      );

      markInviteNotificationsRead(db, inviteId, userId || null);
    }

    await writeDb(db);
    const updatedInvite = db.invites.find((item) => item.id === inviteId) ?? null;
    send(res, 200, { invite: updatedInvite ? mapInviteView(db, updatedInvite) : null });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/") {
    const indexPath = path.join(WEB_DIR, "index.html");

    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(fs.readFileSync(indexPath));
    }
  }

  const isApiPath = requestUrl.pathname === "/api" || requestUrl.pathname.startsWith("/api/");
  if (!isApiPath) {
    const servedStatic = await serveStaticFile(req, res, requestUrl);
    if (servedStatic) {
      return;
    }
  }

  send(res, 404, { message: "Not found" });
});

await bootstrapUsersToSqlite();

server.listen(PORT, HOST, () => {
  const emailStatus = getEmailStatus();
  const startupBaseUrl = BASE_URL || `http://localhost:${PORT}`;
  console.log(`Teamio server слуша на ${startupBaseUrl} (bind: ${HOST}:${PORT})`);
  if (!BASE_URL) {
    console.warn("[Teamio] BASE_URL не е зададен. Линковете ще се генерират по host от заявката. За production задай BASE_URL.");
  }
  console.log(
    `[Teamio] Имейл статус: ${emailStatus.configured ? `конфигуриран (preferred=${emailStatus.preferredProvider}, налични=${(emailStatus.availableProviders ?? []).join(",")})` : `грешка (${emailStatus.reason})`}`
  );
  if (!SQLITE_USERS_ENABLED) {
    console.warn("[Teamio] node:sqlite не е наличен в текущата Node среда. Users ще се пазят в db.json (server-side fallback).");
  }
});
