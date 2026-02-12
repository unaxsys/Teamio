import { createServer } from "node:http";
import fs from "fs";
import path from "path";
import { readFile, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "db.json");
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

const readDb = async () => {
  try {
    return JSON.parse(await readFile(DB_PATH, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      const fallbackDb = ensureDbShape({});
      await writeDb(fallbackDb);
      return fallbackDb;
    }
    throw error;
  }
};
const writeDb = async (db) => writeFile(DB_PATH, JSON.stringify(db, null, 2));

const ensureDbShape = (db) => {
  db.users ??= [];
  db.resetTokens ??= [];
  db.accounts ??= [];
  db.verificationTokens ??= [];
  db.invites ??= [];
  db.notifications ??= [];

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
    };
  });

  return db;
};

const send = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(payload));
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
    const companyName = normalizeText(body.companyName);
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

    if (!invite && !companyName) {
      send(res, 400, { message: "Липсва име на фирма за нова регистрация." });
      return;
    }

    let accountId = invite?.accountId;
    if (!accountId) {
      accountId = `account-${Date.now()}`;
      db.accounts.push({
        id: accountId,
        name: companyName,
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
      isEmailVerified: false,
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

      nextAccount.workspaces = (nextAccount.workspaces ?? []).map((workspace) => ({
        ...workspace,
        ownerUserId: !invite ? newUser.id : (workspace.ownerUserId ?? nextAccount.ownerUserId ?? null),
        memberRoles: [
          ...(workspace.memberRoles ?? []).filter((member) => member.userId !== newUser.id),
          { userId: newUser.id, role: invite?.role ?? (!invite ? "Owner" : "Member") },
        ],
      }));

      return nextAccount;
    });

    if (invite) {
      db.invites = db.invites.map((item) =>
        item.id === invite.id ? { ...item, usedAt: Date.now(), acceptedUserId: newUser.id } : item
      );
    }

    const verifyToken = randomBytes(24).toString("hex");
    const verifyTokenHash = createHash("sha256").update(verifyToken).digest("hex");
    db.verificationTokens.push({
      tokenHash: verifyTokenHash,
      userId: newUser.id,
      email,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      usedAt: null,
    });

    const verificationLink = `${getPublicBaseUrl(req)}/?verify=${verifyToken}`;

    let verificationEmailResult;
    try {
      verificationEmailResult = await sendEmail({
        to: email,
        subject: "Потвърди имейла си в Teamio",
        text: `Здравей, ${name}! Потвърди имейла си от тук: ${verificationLink}`,
        html: `<p>Здравей, <strong>${name}</strong>!</p><p>Потвърди имейла си от този линк:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
      });
    } catch (error) {
      console.error("[Teamio] Грешка при изпращане на verification имейл:", error);
      send(res, 500, {
        message: "Не успяхме да изпратим имейл за потвърждение. Свържи се с администратор.",
        ...(EMAIL_DEBUG ? { error: String(error?.message ?? error), emailStatus: getEmailStatus() } : {}),
      });
      return;
    }

    db.users.push(newUser);
    await writeDb(db);

    if (verificationEmailResult?.mode === "fallback") {
      console.log(`[Teamio] Verification линк за ${email}: ${verificationLink}`);
      send(res, 201, {
        message: "Имейл услугата не е конфигурирана. Използвай verificationLink от отговора.",
        verificationLink,
      });
      return;
    }

    send(res, 201, { message: "Пратихме линк за потвърждение на имейла." });
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

    send(res, 200, { user: { id: user.id, name: user.name, email: user.email, accountId: user.accountId, role: user.role, teamIds: user.teamIds ?? [] } });
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

      let resetEmailResult;
      try {
        resetEmailResult = await sendEmail({
          to: email,
          subject: "Смяна на парола в Teamio",
          text: `Здравей! Смени паролата си от тук: ${resetLink}`,
          html: `<p>Здравей!</p><p>Смени паролата си от този линк:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
        });
      } catch (error) {
        console.error("[Teamio] Грешка при изпращане на reset имейл:", error);
        send(res, 500, {
          message: "Не успяхме да изпратим имейл за смяна на парола.",
          ...(EMAIL_DEBUG ? { error: String(error?.message ?? error), emailStatus: getEmailStatus() } : {}),
        });
        return;
      }

      db.resetTokens.push({ token, email, createdAt: Date.now() });
      await writeDb(db);

      if (resetEmailResult?.mode === "fallback") {
        console.log(`[Teamio] Reset линк за ${email}: ${resetLink}`);
        send(res, 200, {
          message: "Имейл услугата не е конфигурирана. Използвай resetLink от отговора.",
          resetLink,
        });
        return;
      }
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

  if (requestUrl.pathname === "/api/invites" && req.method === "GET") {
    const accountId = normalizeText(requestUrl.searchParams.get("accountId") ?? "");
    const email = normalizeEmail(requestUrl.searchParams.get("email") ?? "");

    const db = ensureDbShape(await readDb());
    const invites = db.invites.filter((invite) => {
      const byAccount = accountId ? invite.accountId === accountId : false;
      const byEmail = email ? normalizeEmail(invite.email) === email : false;
      return byAccount || byEmail;
    });

    send(res, 200, { invites });
    return;
  }

  if (requestUrl.pathname === "/api/invites" && req.method === "POST") {
    const body = await readBody(req);
    const accountId = normalizeText(body.accountId);
    const invitedByUserId = normalizeText(body.invitedByUserId);
    const email = normalizeEmail(body.email);
    const role = normalizeText(body.role || "Member");

    if (!accountId || !email) {
      send(res, 400, { message: "Липсват данни за покана." });
      return;
    }

    const db = ensureDbShape(await readDb());
    const account = db.accounts.find((item) => item.id === accountId);
    if (!account) {
      send(res, 404, { message: "Фирмата не е намерена." });
      return;
    }

    const existingUser = db.users.find((user) => normalizeEmail(user.email) === email);
    if (existingUser?.accountId && existingUser.accountId !== accountId) {
      send(res, 409, { message: "Този имейл вече принадлежи на друг акаунт и не може да бъде поканен." });
      return;
    }

    const invite = {
      id: `invite-${Date.now()}`,
      accountId,
      invitedByUserId: invitedByUserId || null,
      email,
      role,
      token: randomBytes(16).toString("hex"),
      expiresAt: Date.now() + 48 * 60 * 60 * 1000,
      acceptedAt: null,
      declinedAt: null,
      revokedAt: null,
      usedAt: null,
    };

    db.invites.unshift(invite);
    await writeDb(db);
    send(res, 201, { invite });
    return;
  }

  if (requestUrl.pathname === "/api/invites/respond" && req.method === "POST") {
    const body = await readBody(req);
    const inviteId = normalizeText(body.inviteId);
    const action = normalizeText(body.action).toLowerCase();
    const userId = normalizeText(body.userId);
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

    if (normalizeEmail(invite.email) !== email) {
      send(res, 403, { message: "Поканата не е за този имейл." });
      return;
    }

    if (invite.revokedAt || invite.expiresAt < Date.now()) {
      send(res, 400, { message: "Поканата е невалидна." });
      return;
    }

    const now = Date.now();
    if (action === "accept") {
      db.invites = db.invites.map((item) =>
        item.id === inviteId
          ? { ...item, acceptedAt: now, acceptedUserId: userId || item.acceptedUserId || null, declinedAt: null, usedAt: now }
          : item
      );
      db.users = db.users.map((user) =>
        userId && user.id === userId ? { ...user, accountId: invite.accountId, role: invite.role ?? user.role } : user
      );
      db.accounts = db.accounts.map((account) => {
        if (account.id !== invite.accountId) {
          return account;
        }

        const memberExists = (account.members ?? []).some((member) => normalizeEmail(member.email ?? "") === email);
        if (memberExists) {
          return account;
        }

        return {
          ...account,
          members: [
            ...(account.members ?? []),
            {
              id: userId || `member-${Date.now()}`,
              userId: userId || null,
              name: email,
              email,
              role: invite.role ?? "Member",
              teamIds: [],
            },
          ],
        };
      });
    } else {
      db.invites = db.invites.map((item) =>
        item.id === inviteId ? { ...item, declinedAt: now, declinedUserId: userId || null } : item
      );
    }

    await writeDb(db);
    const updatedInvite = db.invites.find((item) => item.id === inviteId) ?? null;
    send(res, 200, { invite: updatedInvite });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/") {
    const indexPath = path.join(WEB_DIR, "index.html");

    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(fs.readFileSync(indexPath));
    }
  }

  const servedStatic = await serveStaticFile(req, res, requestUrl);
  if (servedStatic) {
    return;
  }

  send(res, 404, { message: "Not found" });
});

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
});
