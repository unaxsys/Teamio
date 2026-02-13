import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST || "0.0.0.0";
const DATABASE_URL = (process.env.DATABASE_URL || "").trim();
const JWT_SECRET = (process.env.JWT_SECRET || "teamio-dev-secret").trim();
const WEB_DIR = path.join(__dirname, "../web");

if (!DATABASE_URL) {
  throw new Error("Липсва DATABASE_URL. PostgreSQL е задължителен за тази версия.");
}

const pool = new Pool({ connectionString: DATABASE_URL });

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
};

const quoteIdent = (name) => `"${String(name).replace(/"/g, '""')}"`;
const hashPassword = (password) => createHash("sha256").update(password).digest("hex");
const normalizeText = (value = "") => String(value).trim();
const normalizeEmail = (email = "") => normalizeText(email).toLowerCase();

const send = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  });
  res.end(JSON.stringify(payload));
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
};

const parseAuthHeader = (req) => {
  const header = normalizeText(req.headers.authorization || "");
  if (!header.startsWith("Bearer ")) return null;
  return normalizeText(header.slice(7));
};

const signAuthToken = (accountId, tenantId) => jwt.sign({ accountId, tenantId }, JWT_SECRET, { expiresIn: "7d" });

const verifyAuthToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.tenants (
      id UUID PRIMARY KEY,
      schema_name TEXT NOT NULL UNIQUE,
      company_name TEXT NOT NULL,
      owner_account_id UUID,
      plan TEXT NOT NULL DEFAULT 'Free',
      status TEXT NOT NULL DEFAULT 'active',
      vat_id TEXT NOT NULL DEFAULT '',
      vat_number TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      logo_data_url TEXT NOT NULL DEFAULT '',
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.accounts (
      id UUID PRIMARY KEY,
      tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Owner',
      team_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_email_verified BOOLEAN NOT NULL DEFAULT TRUE,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.audit_log (
      id UUID PRIMARY KEY,
      tenant_id UUID,
      account_id UUID,
      action TEXT NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at BIGINT NOT NULL
    );
  `);
};

const createTenantSchema = async (client, tenantId, schemaName, owner) => {
  const now = Date.now();
  const boardId = randomUUID();
  const qSchema = quoteIdent(schemaName);

  await client.query(`CREATE SCHEMA ${qSchema}`);
  await client.query(`SET search_path TO ${qSchema}, public`);
  await client.query(`
    CREATE TABLE boards (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE columns (
      id UUID PRIMARY KEY,
      board_id UUID NOT NULL,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE tasks (
      id UUID PRIMARY KEY,
      board_id UUID NOT NULL,
      column_id UUID NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due TEXT NOT NULL DEFAULT '',
      level TEXT NOT NULL DEFAULT 'L2',
      created_by UUID,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    );
    CREATE TABLE members (
      id UUID PRIMARY KEY,
      user_id UUID,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      team_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE invites (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Member',
      token TEXT NOT NULL,
      invited_by_user_id UUID,
      invited_user_id UUID,
      workspace_id TEXT NOT NULL DEFAULT 'workspace-main',
      board_name TEXT NOT NULL DEFAULT '',
      expires_at BIGINT NOT NULL,
      accepted_at BIGINT,
      accepted_user_id UUID,
      used_at BIGINT,
      revoked_at BIGINT,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE workspace_state (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      updated_by UUID,
      updated_at BIGINT NOT NULL,
      payload JSONB NOT NULL
    );
  `);

  await client.query(`INSERT INTO boards (id, name, created_at) VALUES ($1, $2, $3)`, [boardId, "Основна дъска", now]);

  const defaultColumns = ["Backlog", "В процес", "Преглед", "Готово"];
  for (let i = 0; i < defaultColumns.length; i += 1) {
    await client.query(
      `INSERT INTO columns (id, board_id, name, position, created_at) VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), boardId, defaultColumns[i], i + 1, now]
    );
  }

  await client.query(
    `INSERT INTO members (id, user_id, name, email, role, team_ids, created_at) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
    [randomUUID(), owner.id, owner.name, owner.email, "Owner", JSON.stringify([]), now]
  );

  await client.query(
    `INSERT INTO public.tenants (id, schema_name, company_name, owner_account_id, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [tenantId, schemaName, `${owner.name} - фирма`, owner.id, now]
  );
};

const withTenant = async (req, res, handler) => {
  const token = parseAuthHeader(req);
  const claims = token ? verifyAuthToken(token) : null;
  if (!claims?.tenantId || !claims?.accountId) {
    send(res, 401, { message: "Липсва валиден JWT." });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const tenantResult = await client.query(`SELECT schema_name FROM public.tenants WHERE id = $1`, [claims.tenantId]);
    const tenant = tenantResult.rows[0];
    if (!tenant) {
      await client.query("ROLLBACK");
      send(res, 401, { message: "Невалиден tenant." });
      return;
    }

    const qSchema = quoteIdent(tenant.schema_name);
    await client.query(`SET LOCAL search_path TO ${qSchema}, public`);
    const output = await handler(client, claims, tenant);
    await client.query("COMMIT");
    if (output) send(res, output.status ?? 200, output.body ?? { ok: true });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error(error);
    send(res, 500, { message: "Вътрешна грешка." });
  } finally {
    client.release();
  }
};

const mapAccountContext = async (client, claims) => {
  const tenantRes = await client.query(`SELECT * FROM public.tenants WHERE id = $1`, [claims.tenantId]);
  const tenant = tenantRes.rows[0];
  const membersRes = await client.query(`SELECT * FROM members ORDER BY created_at DESC`);
  const members = membersRes.rows.map((m) => ({
    id: m.id,
    userId: m.user_id,
    name: m.name,
    email: m.email,
    role: m.role,
    teamIds: m.team_ids ?? [],
  }));

  return {
    id: tenant.id,
    name: tenant.company_name,
    ownerUserId: tenant.owner_account_id,
    plan: tenant.plan,
    status: tenant.status,
    createdAt: Number(tenant.created_at),
    workspaces: [
      {
        id: "workspace-main",
        name: "Основно пространство",
        description: "Главно работно пространство",
        ownerUserId: tenant.owner_account_id,
        memberRoles: members.map((m) => ({ userId: m.userId, role: m.role })),
      },
    ],
    teams: [],
    members,
    companyProfile: {
      vatId: tenant.vat_id,
      vatNumber: tenant.vat_number,
      address: tenant.address,
      logoDataUrl: tenant.logo_data_url,
    },
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

  if (requestUrl.pathname === "/api/auth/register" && req.method === "POST") {
    const body = await readBody(req);
    const name = normalizeText(body.name);
    const email = normalizeEmail(body.email);
    const password = normalizeText(body.password);

    if (!name || !email || password.length < 6) {
      send(res, 400, { message: "Невалидни данни за регистрация." });
      return;
    }

    const client = await pool.connect();
    try {
      const existing = await client.query(`SELECT id FROM public.accounts WHERE email = $1`, [email]);
      if (existing.rowCount > 0) {
        send(res, 409, { message: "Този имейл вече е регистриран." });
        return;
      }

      const accountId = randomUUID();
      const tenantId = randomUUID();
      const schemaName = `t_${tenantId.replace(/-/g, "")}`;
      const now = Date.now();

      await client.query("BEGIN");
      await client.query(
        `INSERT INTO public.accounts (id, tenant_id, name, email, password_hash, role, team_ids, is_email_verified, created_at)
         VALUES ($1, $2, $3, $4, $5, 'Owner', '[]'::jsonb, true, $6)`,
        [accountId, tenantId, name, email, hashPassword(password), now]
      );

      await createTenantSchema(client, tenantId, schemaName, { id: accountId, name, email });
      await client.query("COMMIT");

      send(res, 201, { message: "Регистрацията е успешна." });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error(error);
      send(res, 500, { message: "Грешка при регистрация." });
    } finally {
      client.release();
    }
    return;
  }

  if (requestUrl.pathname === "/api/auth/login" && req.method === "POST") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const password = normalizeText(body.password);

    const result = await pool.query(
      `SELECT a.*, t.schema_name FROM public.accounts a
       JOIN public.tenants t ON t.id = a.tenant_id
       WHERE a.email = $1`,
      [email]
    );
    const account = result.rows[0];

    if (!account || account.password_hash !== hashPassword(password)) {
      send(res, 401, { message: "Невалидни данни. Провери имейла и паролата." });
      return;
    }

    const token = signAuthToken(account.id, account.tenant_id);
    send(res, 200, {
      token,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        accountId: account.id,
        tenantId: account.tenant_id,
        workspaceId: "workspace-main",
        role: account.role,
        teamIds: account.team_ids ?? [],
      },
    });
    return;
  }

  if (requestUrl.pathname === "/api/accounts/context" && req.method === "GET") {
    await withTenant(req, res, async (client, claims) => ({ status: 200, body: { account: await mapAccountContext(client, claims) } }));
    return;
  }

  if (requestUrl.pathname === "/api/accounts/company-profile" && req.method === "GET") {
    await withTenant(req, res, async (client, claims) => {
      const account = await mapAccountContext(client, claims);
      return { status: 200, body: { companyProfile: { name: account.name, ...account.companyProfile } } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/accounts/company-profile" && req.method === "POST") {
    const body = await readBody(req);
    await withTenant(req, res, async (client, claims) => {
      const profile = body.companyProfile ?? {};
      await client.query(
        `UPDATE public.tenants
         SET company_name = $2, vat_id = $3, vat_number = $4, address = $5, logo_data_url = $6
         WHERE id = $1`,
        [claims.tenantId, normalizeText(profile.name), normalizeText(profile.vatId), normalizeText(profile.vatNumber), normalizeText(profile.address), normalizeText(profile.logoDataUrl)]
      );
      return { status: 200, body: { ok: true } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/workspace-state" && req.method === "GET") {
    await withTenant(req, res, async (client) => {
      const workspaceId = normalizeText(requestUrl.searchParams.get("workspaceId") ?? "workspace-main");
      const row = (await client.query(`SELECT * FROM workspace_state WHERE workspace_id = $1`, [workspaceId])).rows[0] ?? null;
      return { status: 200, body: row ? { state: row.payload, updatedAt: Number(row.updated_at) } : { state: null } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/workspace-state" && req.method === "PUT") {
    const body = await readBody(req);
    await withTenant(req, res, async (client, claims) => {
      const workspaceId = normalizeText(body.workspaceId || "workspace-main");
      const now = Date.now();
      await client.query(
        `INSERT INTO workspace_state (id, workspace_id, updated_by, updated_at, payload)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (id) DO UPDATE SET updated_by = EXCLUDED.updated_by, updated_at = EXCLUDED.updated_at, payload = EXCLUDED.payload`,
        [`workspace-state-${workspaceId}`, workspaceId, claims.accountId, now, JSON.stringify(body.payload ?? {})]
      );
      return { status: 200, body: { ok: true, updatedAt: now } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/cards" && req.method === "POST") {
    const body = await readBody(req);
    await withTenant(req, res, async (client, claims) => {
      const title = normalizeText(body.title);
      const listId = normalizeText(body.listId || body.column);
      if (!title || !listId) {
        return { status: 400, body: { message: "Липсват задължителни полета за карта." } };
      }

      const board = (await client.query(`SELECT id FROM boards ORDER BY created_at ASC LIMIT 1`)).rows[0];
      const card = {
        id: randomUUID(),
        boardId: board.id,
        listId,
        title,
        description: normalizeText(body.description),
        due: normalizeText(body.due),
        level: normalizeText(body.level || "L2"),
        createdBy: claims.accountId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await client.query(
        `INSERT INTO tasks (id, board_id, column_id, title, description, due, level, created_by, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [card.id, card.boardId, card.listId, card.title, card.description, card.due, card.level, card.createdBy, card.createdAt, card.updatedAt]
      );

      return { status: 201, body: { card } };
    });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/cards/") && ["PATCH", "DELETE"].includes(req.method ?? "")) {
    const cardId = normalizeText(requestUrl.pathname.split("/").pop() ?? "");
    const body = req.method === "PATCH" ? await readBody(req) : {};

    await withTenant(req, res, async (client) => {
      const found = (await client.query(`SELECT * FROM tasks WHERE id = $1`, [cardId])).rows[0];
      if (!found) return { status: 404, body: { message: "Картата не е намерена." } };

      if (req.method === "DELETE") {
        await client.query(`DELETE FROM tasks WHERE id = $1`, [cardId]);
        return { status: 200, body: { ok: true } };
      }

      const next = {
        title: normalizeText(body.title || found.title),
        description: normalizeText(body.description ?? found.description),
        due: normalizeText(body.due ?? found.due),
        level: normalizeText(body.level ?? found.level),
        listId: normalizeText(body.listId ?? found.column_id),
        updatedAt: Date.now(),
      };

      await client.query(
        `UPDATE tasks SET title = $2, description = $3, due = $4, level = $5, column_id = $6, updated_at = $7 WHERE id = $1`,
        [cardId, next.title, next.description, next.due, next.level, next.listId, next.updatedAt]
      );

      return {
        status: 200,
        body: {
          card: {
            id: cardId,
            boardId: found.board_id,
            listId: next.listId,
            title: next.title,
            description: next.description,
            due: next.due,
            level: next.level,
            createdBy: found.created_by,
            createdAt: Number(found.created_at),
            updatedAt: next.updatedAt,
          },
        },
      };
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites" && req.method === "GET") {
    await withTenant(req, res, async (client) => {
      const invites = (await client.query(`SELECT * FROM invites ORDER BY created_at DESC`)).rows;
      return { status: 200, body: { invites } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites/inbox" && req.method === "GET") {
    await withTenant(req, res, async (client) => {
      const email = normalizeEmail(requestUrl.searchParams.get("email") ?? "");
      const invites = (await client.query(`SELECT * FROM invites WHERE lower(email) = $1 ORDER BY created_at DESC`, [email])).rows;
      return { status: 200, body: { invites } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites" && req.method === "POST") {
    const body = await readBody(req);
    await withTenant(req, res, async (client, claims) => {
      const invite = {
        id: randomUUID(),
        email: normalizeEmail(body.email),
        role: normalizeText(body.role || "Member"),
        token: randomBytes(16).toString("hex"),
        invitedByUserId: claims.accountId,
        invitedUserId: null,
        workspaceId: "workspace-main",
        boardName: normalizeText(body.boardName),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
        createdAt: Date.now(),
      };
      await client.query(
        `INSERT INTO invites (id, email, role, token, invited_by_user_id, invited_user_id, workspace_id, board_name, expires_at, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [invite.id, invite.email, invite.role, invite.token, invite.invitedByUserId, invite.invitedUserId, invite.workspaceId, invite.boardName, invite.expiresAt, invite.createdAt]
      );
      return { status: 201, body: { invite } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites/revoke" && req.method === "POST") {
    const body = await readBody(req);
    await withTenant(req, res, async (client) => {
      await client.query(`UPDATE invites SET revoked_at = $2 WHERE id = $1`, [normalizeText(body.inviteId), Date.now()]);
      return { status: 200, body: { ok: true } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites/respond" && req.method === "POST") {
    const body = await readBody(req);
    await withTenant(req, res, async (client, claims) => {
      const inviteId = normalizeText(body.inviteId);
      const action = normalizeText(body.action).toLowerCase();
      const invite = (await client.query(`SELECT * FROM invites WHERE id = $1`, [inviteId])).rows[0];
      if (!invite) return { status: 404, body: { message: "Поканата не е намерена." } };

      if (action === "accept") {
        await client.query(`
          UPDATE invites SET accepted_at = $2, accepted_user_id = $3, used_at = $2 WHERE id = $1
        `, [inviteId, Date.now(), claims.accountId]);
      }
      if (action === "decline") {
        await client.query(`UPDATE invites SET revoked_at = $2 WHERE id = $1`, [inviteId, Date.now()]);
      }
      return { status: 200, body: { invite: { ...invite, action } } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/workspaces/members-summary" && req.method === "GET") {
    await withTenant(req, res, async (client) => {
      const acceptedMembers = (await client.query(`SELECT * FROM members ORDER BY created_at DESC`)).rows;
      const pendingInvites = (await client.query(`SELECT * FROM invites WHERE accepted_at IS NULL AND revoked_at IS NULL AND expires_at > $1`, [Date.now()])).rows;
      return { status: 200, body: { acceptedMembers, pendingInvites } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/users/by-email" && req.method === "GET") {
    const email = normalizeEmail(requestUrl.searchParams.get("email") ?? "");
    const row = (await pool.query(`SELECT id, tenant_id, name, email, role, team_ids FROM public.accounts WHERE email = $1`, [email])).rows[0] ?? null;
    send(res, 200, { user: row ? { id: row.id, accountId: row.id, tenantId: row.tenant_id, name: row.name, email: row.email, role: row.role, teamIds: row.team_ids ?? [] } : null });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    send(res, 404, { message: "Endpoint не е имплементиран в PostgreSQL версията." });
    return;
  }

  let filePath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  filePath = path.normalize(filePath).replace(/^\.+[\\/]+/, "");
  const absolutePath = path.join(WEB_DIR, filePath);
  if (!absolutePath.startsWith(WEB_DIR)) {
    send(res, 403, { message: "Forbidden" });
    return;
  }

  try {
    const data = await fs.promises.readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, { "Content-Type": STATIC_CONTENT_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  } catch (error) {
    if (error?.code === "ENOENT") {
      send(res, 404, { message: "Not found" });
      return;
    }
    send(res, 500, { message: "Internal error" });
  }
});

initDb()
  .then(() => {
    server.listen(PORT, HOST, () => {
      console.log(`[Teamio] Server listening on http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("[Teamio] Грешка при инициализация на PostgreSQL:", error);
    process.exit(1);
  });
