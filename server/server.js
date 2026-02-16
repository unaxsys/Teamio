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

const buildConnStringFromParts = () => {
  const host = (process.env.DB_HOST || "").trim();
  const port = (process.env.DB_PORT || "5432").trim();
  const name = (process.env.DB_NAME || "").trim();
  const user = (process.env.DB_USER || "").trim();
  const pass = (process.env.DB_PASS || "").trim();

  if (!host || !name || !user) return "";
  // encode password safely (handles * # ! etc.)
  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(pass);
  return `postgresql://${encUser}:${encPass}@${host}:${port}/${name}`;
};

const EFFECTIVE_DB_URL = DATABASE_URL || buildConnStringFromParts();

const pool = EFFECTIVE_DB_URL ? new Pool({ connectionString: EFFECTIVE_DB_URL }) : null;
let dbReady = Boolean(pool);

const dbUnavailableMessage =
  "Базата не е конфигурирана или е недостъпна. Провери DATABASE_URL или DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASS.";
const ensureDb = (res) => {
  if (pool && dbReady) return true;
  send(res, 503, { message: dbUnavailableMessage });
  return false;
};

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
const tenantSchemaName = (tenantId) => `t_${String(tenantId).replaceAll("-", "")}`;

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
  if (!pool) return;
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS public.accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      tenant_id UUID UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.tenants (
      tenant_id UUID PRIMARY KEY,
      schema_name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.audit_log (
      id BIGSERIAL PRIMARY KEY,
      at TIMESTAMPTZ NOT NULL DEFAULT now(),
      account_id UUID,
      tenant_id UUID,
      action TEXT NOT NULL,
      meta JSONB NOT NULL DEFAULT '{}'::jsonb
    );

    CREATE INDEX IF NOT EXISTS idx_audit_tenant ON public.audit_log(tenant_id);
  `);
};

const createTenantSchema = async (client, tenantId, schemaName, owner) => {
  const qSchema = quoteIdent(schemaName);

  await client.query(`CREATE SCHEMA IF NOT EXISTS ${qSchema}`);
  await client.query(`SET search_path TO ${qSchema}, public`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS boards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS columns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      wip_limit INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_columns_board ON columns(board_id);

    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      due_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_board ON tasks(board_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks(column_id);

    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
    CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

    CREATE TABLE IF NOT EXISTS members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(email)
    );

    CREATE TABLE IF NOT EXISTS invites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      token TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      accepted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS workspace_state (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      updated_by UUID,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      payload JSONB NOT NULL
    );
  `);

  const boardId = (await client.query(`INSERT INTO boards(name) VALUES($1) RETURNING id`, ["Основен борд"]))
    .rows[0].id;

  const defaultColumns = ["Backlog", "В процес", "Преглед", "Готово"];
  for (let i = 0; i < defaultColumns.length; i += 1) {
    await client.query(
      `INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3)`,
      [boardId, defaultColumns[i], i]
    );
  }

  await client.query(
    `INSERT INTO members(email, full_name, role) VALUES($1, $2, 'owner') ON CONFLICT(email) DO NOTHING`,
    [owner.email, owner.name]
  );

  await client.query(
    `INSERT INTO public.tenants (tenant_id, schema_name)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO NOTHING`,
    [tenantId, schemaName]
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
    const tenantResult = await client.query(`SELECT schema_name FROM public.tenants WHERE tenant_id = $1`, [claims.tenantId]);
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
  const tenantRes = await client.query(`SELECT * FROM public.tenants WHERE tenant_id = $1`, [claims.tenantId]);
  const accountRes = await client.query(`SELECT * FROM public.accounts WHERE id = $1`, [claims.accountId]);
  const tenant = tenantRes.rows[0];
  const account = accountRes.rows[0];
  const membersRes = await client.query(`SELECT * FROM members ORDER BY created_at DESC`);
  const members = membersRes.rows.map((m) => ({
    id: m.id,
    userId: null,
    name: m.full_name || m.email,
    email: m.email,
    role: m.role === "owner" ? "Owner" : "Member",
    teamIds: [],
  }));

  return {
    id: tenant.tenant_id,
    name: account?.display_name || account?.email || "Teamio",
    ownerUserId: account?.id ?? null,
    plan: "Free",
    status: "active",
    createdAt: new Date(tenant.created_at).getTime(),
    workspaces: [
      {
        id: "workspace-main",
        name: "Основно пространство",
        description: "Главно работно пространство",
        ownerUserId: account?.id ?? null,
        memberRoles: members.map((m) => ({ userId: m.userId, role: m.role })),
      },
    ],
    teams: [],
    members,
    companyProfile: {
      vatId: "",
      vatNumber: "",
      address: "",
      logoDataUrl: "",
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
    send(res, 200, { ok: true, dbReady, hasDatabaseUrl: Boolean(DATABASE_URL) });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/") && requestUrl.pathname !== "/api/health" && !ensureDb(res)) {
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

      const tenantId = (await client.query("SELECT gen_random_uuid() AS id")).rows[0].id;
      const schemaName = tenantSchemaName(tenantId);

      await client.query("BEGIN");
      await createTenantSchema(client, tenantId, schemaName, { name, email });
      await client.query(
        `INSERT INTO public.accounts (email, password_hash, display_name, tenant_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [email, hashPassword(password), name, tenantId]
      );
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
       JOIN public.tenants t ON t.tenant_id = a.tenant_id
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
        name: account.display_name,
        email: account.email,
        accountId: account.id,
        tenantId: account.tenant_id,
        workspaceId: "workspace-main",
        role: "Owner",
        teamIds: [],
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
      await client.query(`UPDATE public.accounts SET display_name = $2 WHERE id = $1`, [claims.accountId, normalizeText(profile.name)]);
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
        createdAt: new Date(),
      };

      await client.query(
        `INSERT INTO tasks (id, board_id, column_id, title, description, due_date)
         VALUES ($1,$2,$3,$4,$5,$6::date)`,
        [card.id, card.boardId, card.listId, card.title, card.description || null, card.due || null]
      );

      return { status: 201, body: { card } };
    });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/cards/") && ["PATCH", "DELETE"].includes(req.method ?? "")) {
    const cardId = normalizeText(requestUrl.pathname.split("/").pop() ?? "");
    const body = req.method === "PATCH" ? await readBody(req) : {};

    await withTenant(req, res, async (client, claims) => {
      const found = (await client.query(`SELECT * FROM tasks WHERE id = $1`, [cardId])).rows[0];
      if (!found) return { status: 404, body: { message: "Картата не е намерена." } };

      if (req.method === "DELETE") {
        await client.query(`DELETE FROM tasks WHERE id = $1`, [cardId]);
        return { status: 200, body: { ok: true } };
      }

      const next = {
        title: normalizeText(body.title || found.title),
        description: normalizeText(body.description ?? found.description),
        due: normalizeText(body.due ?? found.due_date ?? ""),
        level: normalizeText(body.level ?? "L2"),
        listId: normalizeText(body.listId ?? found.column_id),
      };

      await client.query(
        `UPDATE tasks SET title = $2, description = $3, due_date = $4::date, column_id = $5 WHERE id = $1`,
        [cardId, next.title, next.description || null, next.due || null, next.listId]
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
            createdBy: claims?.accountId ?? null,
            createdAt: new Date(found.created_at).getTime(),
            updatedAt: Date.now(),
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
        role: normalizeText(body.role || "member").toLowerCase(),
        token: randomBytes(16).toString("hex"),
        createdAt: new Date(),
      };
      await client.query(
        `INSERT INTO invites (id, email, role, token, created_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [invite.id, invite.email, invite.role, invite.token, invite.createdAt]
      );
      return { status: 201, body: { invite } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites/revoke" && req.method === "POST") {
    const body = await readBody(req);
    await withTenant(req, res, async (client) => {
      await client.query(`DELETE FROM invites WHERE id = $1`, [normalizeText(body.inviteId)]);
      return { status: 200, body: { ok: true } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites/respond" && req.method === "POST") {
    const body = await readBody(req);
    await withTenant(req, res, async (client) => {
      const inviteId = normalizeText(body.inviteId);
      const action = normalizeText(body.action).toLowerCase();
      const invite = (await client.query(`SELECT * FROM invites WHERE id = $1`, [inviteId])).rows[0];
      if (!invite) return { status: 404, body: { message: "Поканата не е намерена." } };

      if (action === "accept") {
        await client.query(`
          UPDATE invites SET accepted_at = now() WHERE id = $1
        `, [inviteId]);
      }
      if (action === "decline") {
        await client.query(`DELETE FROM invites WHERE id = $1`, [inviteId]);
      }
      return { status: 200, body: { invite: { ...invite, action } } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/workspaces/members-summary" && req.method === "GET") {
    await withTenant(req, res, async (client) => {
      const acceptedMembers = (await client.query(`SELECT * FROM members ORDER BY created_at DESC`)).rows;
      const pendingInvites = (await client.query(`SELECT * FROM invites WHERE accepted_at IS NULL`)).rows;
      return { status: 200, body: { acceptedMembers, pendingInvites } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/users/by-email" && req.method === "GET") {
    const email = normalizeEmail(requestUrl.searchParams.get("email") ?? "");
    const row = (await pool.query(`SELECT id, tenant_id, display_name, email FROM public.accounts WHERE email = $1`, [email])).rows[0] ?? null;
    send(res, 200, { user: row ? { id: row.id, accountId: row.id, tenantId: row.tenant_id, name: row.display_name, email: row.email, role: "Owner", teamIds: [] } : null });
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
    dbReady = Boolean(pool);
    server.listen(PORT, HOST, () => {
      console.log(`[Teamio] Server listening on http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    dbReady = false;
    console.error("[Teamio] Грешка при инициализация на PostgreSQL:", error);
    server.listen(PORT, HOST, () => {
      console.log(`[Teamio] Server listening in degraded mode on http://${HOST}:${PORT}`);
    });
  });
