import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { resolve } from "node:path";

const DB_PATH = resolve("./db.json");
const PORT = Number(process.env.PORT ?? 8787);

const hashPassword = (password) => createHash("sha256").update(password).digest("hex");
const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizeText = (value = "") => value.trim();

const readDb = async () => JSON.parse(await readFile(DB_PATH, "utf8"));
const writeDb = async (db) => writeFile(DB_PATH, JSON.stringify(db, null, 2));

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

  if (req.url === "/api/health" && req.method === "GET") {
    send(res, 200, { ok: true });
    return;
  }

  if (req.url === "/api/auth/register" && req.method === "POST") {
    const body = await readBody(req);
    const name = normalizeText(body.name);
    const email = normalizeEmail(body.email);
    const password = normalizeText(body.password);
    const companyName = normalizeText(body.companyName);

    if (!name || !email || !companyName || password.length < 6) {
      send(res, 400, { message: "Невалидни данни за регистрация." });
      return;
    }

    const db = await readDb();
    db.accounts ??= [];
    if (db.users.some((user) => normalizeEmail(user.email) === email)) {
      send(res, 409, { message: "Този имейл вече е регистриран." });
      return;
    }

    const accountId = `account-${Date.now()}`;
    db.accounts.push({
      id: accountId,
      name: companyName,
      teams: [
        { id: `team-${Date.now()}-1`, name: "Продуктов екип" },
        { id: `team-${Date.now()}-2`, name: "Инженерен екип" },
      ],
      members: [],
    });

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password: hashPassword(password),
      accountId,
    };

    db.users.push(newUser);
    await writeDb(db);

    send(res, 201, {
      user: { id: newUser.id, name: newUser.name, email: newUser.email, accountId: newUser.accountId },
    });
    return;
  }

  if (req.url === "/api/auth/login" && req.method === "POST") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const password = normalizeText(body.password);

    const db = await readDb();
    const hashed = hashPassword(password);
    const user = db.users.find((item) => normalizeEmail(item.email) === email && item.password === hashed);

    if (!user) {
      send(res, 401, { message: "Невалидни данни. Провери имейла и паролата." });
      return;
    }

    send(res, 200, { user: { id: user.id, name: user.name, email: user.email, accountId: user.accountId } });
    return;
  }

  if (req.url === "/api/auth/forgot-password" && req.method === "POST") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const db = await readDb();
    const user = db.users.find((item) => normalizeEmail(item.email) === email);

    if (user) {
      const token = randomBytes(16).toString("hex");
      db.resetTokens.push({ token, email, createdAt: Date.now() });
      await writeDb(db);
      console.log(`[Teamio] Reset линк за ${email}: http://localhost:${PORT}/?reset=${token}`);
    }

    send(res, 200, { message: "Ако имейлът съществува, изпратихме линк за смяна на парола." });
    return;
  }

  if (req.url === "/api/auth/reset-password" && req.method === "POST") {
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

  send(res, 404, { message: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Teamio server слуша на http://localhost:${PORT}`);
});
