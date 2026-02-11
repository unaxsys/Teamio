import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { resolve } from "node:path";

const DB_PATH = resolve("./db.json");
const PORT = Number(process.env.PORT ?? 8787);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const hashPassword = (password) => createHash("sha256").update(password).digest("hex");
const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizeText = (value = "") => value.trim();

const readDb = async () => JSON.parse(await readFile(DB_PATH, "utf8"));
const writeDb = async (db) => writeFile(DB_PATH, JSON.stringify(db, null, 2));

const ensureDbShape = (db) => {
  db.users ??= [];
  db.resetTokens ??= [];
  db.accounts ??= [];
  db.verificationTokens ??= [];
  db.invites ??= [];
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

    db.users.push(newUser);
    await writeDb(db);

    const verificationLink = `${BASE_URL}/?verify=${verifyToken}`;
    console.log(`[Teamio] Verification линк за ${email}: ${verificationLink}`);

    send(res, 201, { message: "Пратихме линк за потвърждение на имейла.", verificationLink });
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
      db.resetTokens.push({ token, email, createdAt: Date.now() });
      await writeDb(db);
      console.log(`[Teamio] Reset линк за ${email}: ${BASE_URL}/?reset=${token}`);
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

  send(res, 404, { message: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Teamio server слуша на http://localhost:${PORT}`);
});
