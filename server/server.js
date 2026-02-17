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
loadEnvFile(path.join(__dirname, "../.env"));
loadEnvFile(path.join(process.cwd(), ".env"));

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST || "0.0.0.0";
const JWT_SECRET = (process.env.JWT_SECRET || "teamio-dev-secret").trim();
const WEB_DIR = path.join(__dirname, "../web");

const normalizeEnvValue = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (text === "undefined" || text === "null") return "";
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1).trim();
  }
  return text;
};

const readEnv = (...keys) => {
  for (const key of keys) {
    const value = normalizeEnvValue(process.env[key]);
    if (value) return value;
  }
  return "";
};

const buildConnStringFromParts = () => {
  const host = readEnv("DB_HOST", "PGHOST");
  const port = readEnv("DB_PORT", "PGPORT") || "5432";
  const name = readEnv("DB_NAME", "PGDATABASE");
  const user = readEnv("DB_USER", "PGUSER");
  const pass = readEnv("DB_PASS", "PGPASSWORD");

  if (!host || !name || !user) return "";
  // encode password safely (handles * # ! etc.)
  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(pass);
  return `postgresql://${encUser}:${encPass}@${host}:${port}/${name}`;
};

const DATABASE_URL = readEnv("DATABASE_URL", "DB_URL", "POSTGRES_URL", "POSTGRESQL_URL");
const EFFECTIVE_DB_URL = DATABASE_URL || buildConnStringFromParts();

const shouldEnableDbSsl = (value = "") => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return false;
  if (["1", "true", "yes", "on", "require", "required", "verify-ca", "verify-full"].includes(normalized)) {
    return true;
  }
  return false;
};

const getSslModeFromConnectionString = (connectionString = "") => {
  if (!connectionString) return "";
  try {
    const parsed = new URL(connectionString);
    return String(parsed.searchParams.get("sslmode") || parsed.searchParams.get("ssl") || "").trim();
  } catch {
    return "";
  }
};

const DB_SSL = readEnv("DB_SSL", "DATABASE_SSL", "PGSSLMODE");
const SSL_MODE_FROM_URL = getSslModeFromConnectionString(EFFECTIVE_DB_URL);
const dbSslEnabled = shouldEnableDbSsl(DB_SSL) || shouldEnableDbSsl(SSL_MODE_FROM_URL);

const poolConfig = EFFECTIVE_DB_URL
  ? {
      connectionString: EFFECTIVE_DB_URL,
      ...(dbSslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
    }
  : null;

const pool = poolConfig ? new Pool(poolConfig) : null;
const dbConfigSource = DATABASE_URL ? "DATABASE_URL" : EFFECTIVE_DB_URL ? "DB_PARTS" : "NONE";
let dbReady = false;
let dbInitError = null;

const dbUnavailableMessage =
  "Базата не е конфигурирана или е недостъпна. Провери DATABASE_URL или DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASS.";

const tryRecoverDb = async () => {
  if (!pool) return false;
  try {
    await pool.query("SELECT 1");
    dbReady = true;
    dbInitError = null;
    return true;
  } catch (error) {
    dbReady = false;
    dbInitError = String(error?.message || error);
    return false;
  }
};

tryRecoverDb();

const ensureDb = async (res) => {
  if (pool && dbReady) return true;
  const recovered = await tryRecoverDb();
  if (recovered) return true;
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
const MEMBERSHIP_ROLES = ["OWNER", "ADMIN", "MANAGER", "MEMBER", "VIEWER"];
const INVITE_ROLES = ["ADMIN", "MANAGER", "MEMBER", "VIEWER"];

const normalizeRole = (role = "") => {
  const normalized = normalizeText(role).toUpperCase();
  if (MEMBERSHIP_ROLES.includes(normalized)) return normalized;
  return "MEMBER";
};

const generatePublicId = () => randomBytes(6).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase();
const generateInviteToken = () => randomBytes(24).toString("hex");

const buildTenantSchemaSlugFromEmail = (email = "") => {
  const normalizedEmail = normalizeEmail(email);
  const rawSlug = normalizedEmail
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
  const base = rawSlug ? `u_${rawSlug}` : "u_account";
  return base.slice(0, 50);
};

const createUniquePublicId = async (client) => {
  for (let i = 0; i < 12; i += 1) {
    const candidate = generatePublicId();
    const exists = await client.query(`SELECT 1 FROM public.accounts WHERE public_id = $1`, [candidate]);
    if (exists.rowCount === 0) return candidate;
  }
  return `${generatePublicId()}${Date.now().toString(36).slice(-2)}`;
};

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

const requireAuth = (req, res) => {
  const token = parseAuthHeader(req);
  const claims = token ? verifyAuthToken(token) : null;
  if (!claims?.accountId) {
    send(res, 401, { message: "Липсва валиден JWT." });
    return null;
  }
  return claims;
};

const getMembership = async (client, tenantId, accountId) => {
  const membershipRes = await client.query(
    `SELECT workspace_id, account_id, role, active, created_at
     FROM public.workspace_memberships
     WHERE workspace_id = $1 AND account_id = $2 AND active = true`,
    [tenantId, accountId]
  );
  return membershipRes.rows[0] ?? null;
};

const getDefaultActiveMembership = async (client, accountId) => {
  const membershipRes = await client.query(
    `SELECT workspace_id, role, active, created_at
     FROM public.workspace_memberships
     WHERE account_id = $1 AND active = true AND workspace_id IS NOT NULL
     ORDER BY CASE role WHEN 'OWNER' THEN 0 ELSE 1 END, created_at ASC
     LIMIT 1`,
    [accountId]
  );
  return membershipRes.rows[0] ?? null;
};

const requireWorkspaceRole = async (client, workspaceId, accountId, allowedRoles = []) => {
  const membership = await getMembership(client, workspaceId, accountId);
  if (!membership) return null;
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));
  if (normalizedAllowedRoles.length === 0 || normalizedAllowedRoles.includes(normalizeRole(membership.role))) {
    return membership;
  }
  return null;
};

const isOwnerOrAdmin = (role = "") => ["OWNER", "ADMIN"].includes(normalizeRole(role));

const initDb = async () => {
  if (!pool) return;
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS public.tenants (
      tenant_id UUID PRIMARY KEY,
      schema_name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      public_id TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      tenant_id UUID NULL REFERENCES public.tenants(tenant_id) ON DELETE SET NULL
    );

    ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_tenant_id_key;
    ALTER TABLE public.accounts ALTER COLUMN tenant_id DROP NOT NULL;

    CREATE TABLE IF NOT EXISTS public.tenant_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
      account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'OWNER' CHECK (role IN ('OWNER','ADMIN','MANAGER','MEMBER','VIEWER')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REMOVED')),
      joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, account_id)
    );

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tenant_members'
          AND column_name = 'role'
      ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tenant_members'
          AND column_name = 'status'
      ) THEN
        EXECUTE 'ALTER TABLE public.tenant_members ALTER COLUMN role SET DEFAULT ''OWNER''';
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uniq_tenant_owner_active ON public.tenant_members(tenant_id) WHERE role = ''OWNER'' AND status = ''ACTIVE''';
      END IF;
    END
    $$;

    CREATE TABLE IF NOT EXISTS public.tenant_invites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
      invited_by_account_id UUID NOT NULL REFERENCES public.accounts(id),
      invited_account_id UUID NULL REFERENCES public.accounts(id),
      invited_email TEXT NULL,
      role TEXT NOT NULL CHECK (role IN ('ADMIN','MANAGER','MEMBER','VIEWER')),
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACCEPTED','DECLINED','REVOKED','EXPIRED')),
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
      responded_at TIMESTAMPTZ NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_invite_account
    ON public.tenant_invites(tenant_id, invited_account_id)
    WHERE status = 'PENDING' AND invited_account_id IS NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_invite_email
    ON public.tenant_invites(tenant_id, lower(invited_email))
    WHERE status = 'PENDING' AND invited_email IS NOT NULL;

    CREATE TABLE IF NOT EXISTS public.workspace_memberships (
      workspace_id UUID NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
      account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('OWNER','ADMIN','MANAGER','MEMBER','VIEWER')),
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (workspace_id, account_id)
    );

    CREATE OR REPLACE FUNCTION public.sync_workspace_membership_from_tenant_member()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.workspace_memberships (workspace_id, account_id, role, active)
      VALUES (NEW.tenant_id, NEW.account_id, 'OWNER', true)
      ON CONFLICT (workspace_id, account_id)
      DO UPDATE SET active = true;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_sync_workspace_membership_from_tenant_member ON public.tenant_members;
    CREATE TRIGGER trg_sync_workspace_membership_from_tenant_member
    AFTER INSERT ON public.tenant_members
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_workspace_membership_from_tenant_member();

    CREATE TABLE IF NOT EXISTS public.workspace_invites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
      invited_by_account_id UUID NOT NULL REFERENCES public.accounts(id),
      invitee_account_id UUID NULL REFERENCES public.accounts(id),
      invitee_email TEXT NULL,
      role TEXT NOT NULL CHECK (role IN ('ADMIN','MANAGER','MEMBER','VIEWER')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      responded_at TIMESTAMPTZ NULL
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

    UPDATE public.accounts
    SET public_id = upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 10))
    WHERE public_id IS NULL;

    ALTER TABLE public.accounts ALTER COLUMN public_id SET NOT NULL;
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
    `INSERT INTO public.tenants (tenant_id, schema_name)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO NOTHING`,
    [tenantId, schemaName]
  );
};

const ensureTenantForAccount = async ({ pool, accountId, email }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT tenant_id
       FROM public.tenant_members
       WHERE account_id = $1
       LIMIT 1`,
      [accountId]
    );

    if (existing.rowCount > 0) {
      await client.query("COMMIT");
      return existing.rows[0].tenant_id;
    }

    let ensuredEmail = normalizeEmail(email);
    if (!ensuredEmail) {
      const accountRes = await client.query(`SELECT email FROM public.accounts WHERE id = $1`, [accountId]);
      ensuredEmail = normalizeEmail(accountRes.rows[0]?.email);
    }

    const base = buildTenantSchemaSlugFromEmail(ensuredEmail);
    let tenantId = null;

    for (let i = 0; i < 5; i += 1) {
      const schemaName = i === 0 ? base : `${base}_${i + 1}`;
      try {
        const insTenant = await client.query(
          `INSERT INTO public.tenants (tenant_id, schema_name)
           VALUES (gen_random_uuid(), $1)
           RETURNING tenant_id`,
          [schemaName]
        );
        tenantId = insTenant.rows[0].tenant_id;
        break;
      } catch (error) {
        if (error?.code === "23505") continue;
        throw error;
      }
    }

    if (!tenantId) {
      throw new Error("Failed to create tenant (schema_name conflicts)");
    }

    await client.query(
      `INSERT INTO public.tenant_members (tenant_id, account_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [tenantId, accountId]
    );

    await client.query("COMMIT");
    return tenantId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const ensureTenantAndMembership = async (client, accountId, email) => {
  const tenantId = await ensureTenantForAccount({ pool, accountId, email });
  const membership = await getDefaultActiveMembership(client, accountId);
  const selectedTenantId = membership?.workspace_id ?? tenantId;
  const selectedRole = membership?.role ?? "OWNER";

  await client.query(`UPDATE public.accounts SET tenant_id = $2 WHERE id = $1`, [accountId, selectedTenantId]);

  return {
    tenantId: selectedTenantId,
    role: normalizeRole(selectedRole),
  };
};

const withTenant = async (req, res, handler) => {
  const claims = requireAuth(req, res);
  if (!claims) {
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const defaultMembership = await getDefaultActiveMembership(client, claims.accountId);
    const effectiveTenantId = normalizeText(claims.tenantId) || defaultMembership?.workspace_id || null;
    if (!effectiveTenantId) {
      await client.query("ROLLBACK");
      send(res, 403, { message: "Нямаш достъп до workspace." });
      return;
    }

    const tenantResult = await client.query(`SELECT schema_name FROM public.tenants WHERE tenant_id = $1`, [effectiveTenantId]);
    const tenant = tenantResult.rows[0];
    if (!tenant) {
      await client.query("ROLLBACK");
      send(res, 401, { message: "Невалиден tenant." });
      return;
    }

    const membership = await getMembership(client, effectiveTenantId, claims.accountId);
    if (!membership) {
      await client.query("ROLLBACK");
      send(res, 403, { message: "Нямаш достъп до този workspace." });
      return;
    }

    const qSchema = quoteIdent(tenant.schema_name);
    await client.query(`SET LOCAL search_path TO ${qSchema}, public`);
    const output = await handler(client, { ...claims, tenantId: effectiveTenantId, membershipRole: membership.role }, tenant, membership);
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

  const membersRes = await client.query(
    `SELECT wm.account_id, wm.role, wm.created_at AS joined_at, a.email, a.display_name
     FROM public.workspace_memberships wm
     JOIN public.accounts a ON a.id = wm.account_id
     WHERE wm.workspace_id = $1 AND wm.active = true
     ORDER BY wm.created_at DESC`,
    [claims.tenantId]
  );

  const members = membersRes.rows.map((m) => ({
    id: m.account_id,
    userId: m.account_id,
    name: m.display_name || m.email,
    email: m.email,
    role: m.role[0] + m.role.slice(1).toLowerCase(),
    teamIds: [],
  }));

  const owner = members.find((m) => normalizeRole(m.role) === 'OWNER');

  return {
    id: tenant.tenant_id,
    name: account?.display_name || account?.email || "Teamio",
    ownerUserId: owner?.id ?? null,
    plan: "Free",
    status: "active",
    createdAt: new Date(tenant.created_at).getTime(),
    workspaces: [
      {
        id: "workspace-main",
        name: "Основно пространство",
        description: "Главно работно пространство",
        ownerUserId: owner?.id ?? null,
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
    send(res, 200, { ok: true, dbReady, hasDatabaseUrl: Boolean(EFFECTIVE_DB_URL), dbConfigSource, dbInitError });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/") && requestUrl.pathname !== "/api/health" && !(await ensureDb(res))) {
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
      const publicId = await createUniquePublicId(client);
      const account = (
        await client.query(
          `INSERT INTO public.accounts (email, password_hash, display_name, public_id, tenant_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, email, display_name, public_id, tenant_id`,
          [email, hashPassword(password), name, publicId, tenantId]
        )
      ).rows[0];
      await client.query(
        `INSERT INTO public.tenant_members (tenant_id, account_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [tenantId, account.id]
      );
      await client.query("COMMIT");

      send(res, 201, {
        message: "Регистрацията е успешна.",
        account: { id: account.id, email: account.email, displayName: account.display_name, publicId: account.public_id },
      });
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

    const accountRes = await pool.query(`SELECT * FROM public.accounts WHERE email = $1`, [email]);
    const account = accountRes.rows[0];

    if (!account || account.password_hash !== hashPassword(password)) {
      send(res, 401, { message: "Невалидни данни. Провери имейла и паролата." });
      return;
    }

    let tenantId;
    console.log(`ensureTenantForAccount start accountId=${account.id}`);
    try {
      tenantId = await ensureTenantForAccount({ pool, accountId: account.id, email: account.email });
      console.log(`ensureTenantForAccount result tenantId=${tenantId}`);
    } catch (error) {
      console.error("ensureTenantForAccount error", error);
      send(res, 500, { message: "Грешка при осигуряване на workspace достъп." });
      return;
    }

    let ensuredRole = "OWNER";
    const roleRes = await pool.query(
      `SELECT role, active
       FROM public.workspace_memberships
       WHERE workspace_id = $1 AND account_id = $2
       LIMIT 1`,
      [tenantId, account.id]
    );
    if (roleRes.rowCount > 0 && roleRes.rows[0].active) {
      ensuredRole = normalizeRole(roleRes.rows[0].role);
    }

    await pool.query(`UPDATE public.accounts SET tenant_id = $2 WHERE id = $1`, [account.id, tenantId]);

    const token = signAuthToken(account.id, tenantId);
    send(res, 200, {
      token,
      user: {
        id: account.id,
        name: account.display_name,
        email: account.email,
        publicId: account.public_id,
        accountId: account.id,
        tenantId,
        workspaceId: "workspace-main",
        role: ensuredRole[0] + ensuredRole.slice(1).toLowerCase(),
        teamIds: [],
      },
    });
    return;
  }

  if (requestUrl.pathname === "/api/me" && req.method === "GET") {
    const claims = requireAuth(req, res);
    if (!claims) return;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const ensuredAccess = await ensureTenantAndMembership(client, claims.accountId);

      const accountRes = await client.query(
        `SELECT id, email, display_name, public_id, tenant_id, created_at FROM public.accounts WHERE id = $1`,
        [claims.accountId]
      );
      const account = accountRes.rows[0];
      if (!account) {
        await client.query("ROLLBACK");
        send(res, 404, { message: "Потребителят не е намерен." });
        return;
      }

      let memberships = (
        await client.query(
          `SELECT wm.workspace_id, wm.role,
                  'ACTIVE' AS status,
                  wm.created_at,
                  t.schema_name AS workspace_name
           FROM public.workspace_memberships wm
           LEFT JOIN public.tenants t ON t.tenant_id = wm.workspace_id
           WHERE wm.account_id = $1
             AND wm.active = true
             AND wm.workspace_id IS NOT NULL
           ORDER BY CASE wm.role WHEN 'OWNER' THEN 0 ELSE 1 END, wm.created_at ASC`,
          [claims.accountId]
        )
      ).rows;

      if (memberships.length === 0) {
        const fallbackMemberships = (
          await client.query(
            `SELECT workspace_id, role, active, created_at
             FROM public.workspace_memberships
             WHERE account_id = $1
               AND active = true
               AND workspace_id IS NOT NULL
             ORDER BY CASE role WHEN 'OWNER' THEN 0 ELSE 1 END, created_at ASC`,
            [claims.accountId]
          )
        ).rows;
        if (fallbackMemberships.length > 0) {
          console.error(`[Teamio] /api/me inconsistency: account ${claims.accountId} has active memberships but primary query returned empty.`);
          memberships = fallbackMemberships.map((row) => ({
            workspace_id: row.workspace_id,
            role: row.role,
            status: 'ACTIVE',
            created_at: row.created_at,
            workspace_name: null,
          }));
        }
      }

      const pendingInvites = (
        await client.query(
          `SELECT wi.id, wi.workspace_id, wi.invitee_email, wi.role,
                  wi.status, wi.created_at, wi.responded_at
           FROM public.workspace_invites wi
           WHERE wi.invitee_account_id = $1 AND wi.status = 'pending'
           ORDER BY wi.created_at DESC`,
          [claims.accountId]
        )
      ).rows;

      await client.query("COMMIT");

      send(res, 200, {
        account: {
          id: account.id,
          email: account.email,
          displayName: account.display_name,
          publicId: account.public_id,
          tenantId: memberships[0]?.workspace_id ?? account.tenant_id,
          activeTenantId: ensuredAccess.tenantId,
          activeWorkspaceId: ensuredAccess.tenantId,
          createdAt: account.created_at,
        },
        memberships,
        pendingInvites,
      });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error(error);
      send(res, 500, { message: "Грешка при зареждане на профила." });
    } finally {
      client.release();
    }
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

  if (requestUrl.pathname === "/api/users/lookup" && req.method === "GET") {
    const query = normalizeText(requestUrl.searchParams.get("query") ?? "");
    if (!query) {
      send(res, 400, { exists: false, message: "Липсва query." });
      return;
    }

    const isEmail = query.includes("@");
    const row = (
      await pool.query(
        `SELECT id, public_id, email, display_name FROM public.accounts WHERE ${isEmail ? "lower(email) = lower($1)" : "public_id = upper($1)"}`,
        [query]
      )
    ).rows[0];
    send(res, 200, { exists: Boolean(row), account: row ?? null });
    return;
  }


  if (requestUrl.pathname.match(/^\/api\/workspaces\/[^/]+\/invites$/) && req.method === "POST") {
    const claims = requireAuth(req, res);
    if (!claims) return;

    const workspaceId = normalizeText(requestUrl.pathname.split("/")[3] ?? "");
    const body = await readBody(req);
    const role = normalizeRole(body.role);
    const inviteEmail = normalizeEmail(body.email);
    const publicId = normalizeText(body.public_id || body.publicId).toUpperCase();

    if (!workspaceId || !INVITE_ROLES.includes(role) || (!inviteEmail && !publicId)) {
      send(res, 400, { message: "Невалидна покана." });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const membership = await requireWorkspaceRole(client, workspaceId, claims.accountId, ["OWNER", "ADMIN"]);
      if (!membership) {
        await client.query("ROLLBACK");
        send(res, 403, { message: "Само OWNER/ADMIN могат да канят." });
        return;
      }

      let inviteeAccountId = null;
      let inviteeEmailValue = inviteEmail || null;
      if (publicId) {
        const account = (await client.query(`SELECT id, email FROM public.accounts WHERE public_id = upper($1)`, [publicId])).rows[0];
        if (!account) {
          await client.query("ROLLBACK");
          send(res, 404, { message: "Потребител с този public_id не съществува." });
          return;
        }
        inviteeAccountId = account.id;
        inviteeEmailValue = account.email;
      } else if (inviteEmail) {
        const account = (await client.query(`SELECT id, email FROM public.accounts WHERE lower(email) = lower($1)`, [inviteEmail])).rows[0];
        if (account) {
          inviteeAccountId = account.id;
          inviteeEmailValue = account.email;
        }
      }

      const invite = (
        await client.query(
          `INSERT INTO public.workspace_invites (workspace_id, invited_by_account_id, invitee_account_id, invitee_email, role)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [workspaceId, claims.accountId, inviteeAccountId, inviteeEmailValue, role]
        )
      ).rows[0];

      await client.query("COMMIT");
      send(res, 201, { invite });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      if (error?.code === "23505") {
        send(res, 409, { message: "Вече има активна покана за този потребител." });
        return;
      }
      console.error(error);
      send(res, 500, { message: "Грешка при създаване на покана." });
    } finally {
      client.release();
    }
    return;
  }

  if (requestUrl.pathname.match(/^\/api\/workspaces\/[^/]+\/members$/) && req.method === "GET") {
    const claims = requireAuth(req, res);
    if (!claims) return;
    const workspaceId = normalizeText(requestUrl.pathname.split("/")[3] ?? "");

    const client = await pool.connect();
    try {
      const membership = await requireWorkspaceRole(client, workspaceId, claims.accountId, []);
      if (!membership) {
        send(res, 403, { message: "Нямаш достъп до този workspace." });
        return;
      }

      const members = (await client.query(
        `SELECT wm.account_id AS id, a.email, a.display_name, a.public_id, wm.role, wm.active, wm.created_at
         FROM public.workspace_memberships wm
         JOIN public.accounts a ON a.id = wm.account_id
         WHERE wm.workspace_id = $1 AND wm.active = true
         ORDER BY wm.created_at DESC`,
        [workspaceId]
      )).rows;

      send(res, 200, { members });
    } finally {
      client.release();
    }
    return;
  }

  if (requestUrl.pathname.match(/^\/api\/tenants\/[^/]+\/invites$/) && req.method === "POST") {
    const claims = requireAuth(req, res);
    if (!claims) return;

    const tenantId = normalizeText(requestUrl.pathname.split("/")[3] ?? "");
    const body = await readBody(req);
    const target = normalizeText(body.target);
    const role = normalizeRole(body.role);

    if (!tenantId || !target || !INVITE_ROLES.includes(role)) {
      send(res, 400, { message: "Невалидна покана." });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const inviterMembership = await getMembership(client, tenantId, claims.accountId);
      if (!inviterMembership || !isOwnerOrAdmin(inviterMembership.role)) {
        await client.query("ROLLBACK");
        send(res, 403, { message: "Само OWNER/ADMIN могат да канят." });
        return;
      }

      let invitedAccountId = null;
      let invitedEmail = null;

      if (target.includes("@")) {
        invitedEmail = normalizeEmail(target);
        const account = (await client.query(`SELECT id, email FROM public.accounts WHERE lower(email) = lower($1)`, [invitedEmail])).rows[0];
        if (account) {
          invitedAccountId = account.id;
          invitedEmail = account.email;
        }
      } else {
        const account = (await client.query(`SELECT id, email FROM public.accounts WHERE public_id = upper($1)`, [target])).rows[0];
        if (!account) {
          await client.query("ROLLBACK");
          send(res, 404, { message: "User not found" });
          return;
        }
        invitedAccountId = account.id;
        invitedEmail = account.email;
      }

      if (invitedAccountId) {
        const memberCheck = await getMembership(client, tenantId, invitedAccountId);
        if (memberCheck) {
          await client.query("ROLLBACK");
          send(res, 409, { message: "Already a member" });
          return;
        }
      }

      const invite = (
        await client.query(
          `INSERT INTO public.tenant_invites (
            tenant_id, invited_by_account_id, invited_account_id, invited_email, role, token
           ) VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [tenantId, claims.accountId, invitedAccountId, invitedEmail, role, generateInviteToken()]
        )
      ).rows[0];
      await client.query(
        `INSERT INTO public.workspace_invites (workspace_id, invited_by_account_id, invitee_account_id, invitee_email, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [tenantId, claims.accountId, invitedAccountId, invitedEmail, role]
      );

      await client.query("COMMIT");
      send(res, 201, { invite });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      if (error?.code === "23505") {
        send(res, 409, { message: "Вече има активна покана за този потребител." });
        return;
      }
      console.error(error);
      send(res, 500, { message: "Грешка при създаване на покана." });
    } finally {
      client.release();
    }
    return;
  }

  if (requestUrl.pathname === "/api/invites" && req.method === "GET") {
    await withTenant(req, res, async (client, claims) => {
      if (!isOwnerOrAdmin(claims.membershipRole)) {
        return { status: 403, body: { message: "Недостатъчни права." } };
      }
      const invites = (
        await client.query(
          `SELECT ti.id, ti.invited_email AS email, ti.role, ti.created_at AS "createdAt", ti.expires_at AS "expiresAt", ti.token, ti.tenant_id AS "tenantId", a.display_name AS "invitedByName"
           FROM public.tenant_invites ti
           LEFT JOIN public.accounts a ON a.id = ti.invited_by_account_id
           WHERE ti.tenant_id = $1 AND ti.status = 'PENDING'
           ORDER BY ti.created_at DESC`,
          [claims.tenantId]
        )
      ).rows;
      return { status: 200, body: { invites } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites/inbox" && req.method === "GET") {
    const claims = requireAuth(req, res);
    if (!claims) return;

    const invites = (
      await pool.query(
        `SELECT ti.id, ti.role, ti.created_at AS "createdAt", ti.expires_at AS "expiresAt", ti.token, ti.tenant_id AS "tenantId",
                t.schema_name AS "workspaceName",
                inviter.display_name AS "invitedByName",
                inviter.email AS "invitedByEmail",
                ti.invited_email AS email,
                'incoming'::text AS __scope
         FROM public.tenant_invites ti
         JOIN public.tenants t ON t.tenant_id = ti.tenant_id
         LEFT JOIN public.accounts inviter ON inviter.id = ti.invited_by_account_id
         WHERE ti.invited_account_id = $1
           AND ti.status = 'PENDING'
           AND ti.expires_at > now()
         ORDER BY ti.created_at DESC`,
        [claims.accountId]
      )
    ).rows;

    send(res, 200, { invites });
    return;
  }

  if (requestUrl.pathname === "/api/me/invites" && req.method === "GET") {
    const claims = requireAuth(req, res);
    if (!claims) return;

    const invites = (
      await pool.query(
        `SELECT ti.id, ti.role, ti.created_at AS "createdAt", ti.expires_at AS "expiresAt", ti.token, ti.tenant_id AS "tenantId",
                t.schema_name AS "workspaceName",
                inviter.display_name AS "invitedByName",
                inviter.email AS "invitedByEmail",
                ti.invited_email AS email
         FROM public.tenant_invites ti
         JOIN public.tenants t ON t.tenant_id = ti.tenant_id
         LEFT JOIN public.accounts inviter ON inviter.id = ti.invited_by_account_id
         WHERE ti.invited_account_id = $1
           AND ti.status = 'PENDING'
           AND ti.expires_at > now()
         ORDER BY ti.created_at DESC`,
        [claims.accountId]
      )
    ).rows;

    send(res, 200, { invites });
    return;
  }

  if (requestUrl.pathname.match(/^\/api\/invites\/[^/]+\/accept$/) && req.method === "POST") {
    const claims = requireAuth(req, res);
    if (!claims) return;

    const inviteId = normalizeText(requestUrl.pathname.split("/")[3] ?? "");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      let invite = (
        await client.query(
          `SELECT * FROM public.tenant_invites WHERE id = $1 FOR UPDATE`,
          [inviteId]
        )
      ).rows[0];
      let inviteSource = "tenant";

      if (!invite) {
        const workspaceInvite = (
          await client.query(`SELECT * FROM public.workspace_invites WHERE id = $1 FOR UPDATE`, [inviteId])
        ).rows[0];
        if (workspaceInvite) {
          invite = {
            ...workspaceInvite,
            tenant_id: workspaceInvite.workspace_id,
            invited_account_id: workspaceInvite.invitee_account_id,
            invited_email: workspaceInvite.invitee_email,
            status: String(workspaceInvite.status || "").toUpperCase(),
            role: workspaceInvite.role,
            expires_at: null,
          };
          inviteSource = "workspace";
        }
      }

      if (!invite || invite.invited_account_id !== claims.accountId) {
        await client.query("ROLLBACK");
        send(res, 404, { message: "Поканата не е намерена." });
        return;
      }
      if (invite.status !== "PENDING") {
        await client.query("ROLLBACK");
        send(res, 409, { message: "Поканата вече е обработена." });
        return;
      }
      if (invite.expires_at && new Date(invite.expires_at).getTime() <= Date.now()) {
        await client.query(
          `UPDATE public.tenant_invites SET status = 'EXPIRED', responded_at = now() WHERE id = $1`,
          [inviteId]
        );
        await client.query("COMMIT");
        send(res, 409, { message: "Поканата е изтекла." });
        return;
      }

      await client.query(
        `INSERT INTO public.workspace_memberships (workspace_id, account_id, role, active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (workspace_id, account_id)
         DO UPDATE SET role = EXCLUDED.role, active = true`,
        [invite.tenant_id, claims.accountId, invite.role]
      );
      if (inviteSource === "tenant") {
        await client.query(
          `UPDATE public.tenant_invites SET status = 'ACCEPTED', responded_at = now() WHERE id = $1`,
          [inviteId]
        );
      }
      await client.query(
        `UPDATE public.workspace_invites
         SET status = 'accepted', responded_at = now()
         WHERE id = $1`,
        [inviteId]
      );
      await client.query(
        `UPDATE public.workspace_invites
         SET status = 'accepted', responded_at = now()
         WHERE workspace_id = $1 AND (invitee_account_id = $2 OR lower(invitee_email) = lower($3)) AND status = 'pending'`,
        [invite.tenant_id, claims.accountId, invite.invited_email || '']
      );
      await client.query(`UPDATE public.accounts SET tenant_id = $2 WHERE id = $1`, [claims.accountId, invite.tenant_id]);
      await client.query("COMMIT");
      send(res, 200, { ok: true });
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error(error);
      send(res, 500, { message: "Грешка при приемане на покана." });
    } finally {
      client.release();
    }
    return;
  }

  if (requestUrl.pathname.match(/^\/api\/invites\/[^/]+\/decline$/) && req.method === "POST") {
    const claims = requireAuth(req, res);
    if (!claims) return;

    const inviteId = normalizeText(requestUrl.pathname.split("/")[3] ?? "");
    const result = await pool.query(
      `UPDATE public.tenant_invites
       SET status = 'DECLINED', responded_at = now()
       WHERE id = $1 AND invited_account_id = $2 AND status = 'PENDING'
       RETURNING id`,
      [inviteId, claims.accountId]
    );
    if (result.rowCount === 0) {
      send(res, 404, { message: "Поканата не е намерена." });
      return;
    }
    await pool.query(
      `UPDATE public.workspace_invites
       SET status = 'declined', responded_at = now()
       WHERE id = $1 AND invitee_account_id = $2 AND status = 'pending'`,
      [inviteId, claims.accountId]
    );
    send(res, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname === "/api/invites/revoke" && req.method === "POST") {
    const body = await readBody(req);
    await withTenant(req, res, async (client, claims) => {
      if (!isOwnerOrAdmin(claims.membershipRole)) {
        return { status: 403, body: { message: "Недостатъчни права." } };
      }
      const inviteId = normalizeText(body.inviteId);
      const result = await client.query(
        `UPDATE public.tenant_invites
         SET status = 'REVOKED', responded_at = now()
         WHERE id = $1 AND tenant_id = $2 AND status = 'PENDING'`,
        [inviteId, claims.tenantId]
      );
      return { status: result.rowCount ? 200 : 404, body: result.rowCount ? { ok: true } : { message: "Поканата не е намерена." } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/invites/respond" && req.method === "POST") {
    const claims = requireAuth(req, res);
    if (!claims) return;

    const body = await readBody(req);
    const inviteId = normalizeText(body.inviteId);
    const action = normalizeText(body.action).toLowerCase();

    if (action === "accept") {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const invite = (await client.query(`SELECT * FROM public.tenant_invites WHERE id = $1 FOR UPDATE`, [inviteId])).rows[0];
        if (!invite || invite.invited_account_id !== claims.accountId) {
          await client.query("ROLLBACK");
          send(res, 404, { message: "Поканата не е намерена." });
          return;
        }
        if (invite.status !== "PENDING" || new Date(invite.expires_at).getTime() <= Date.now()) {
          await client.query("ROLLBACK");
          send(res, 409, { message: "Поканата не е активна." });
          return;
        }
        await client.query(
          `INSERT INTO public.workspace_memberships (workspace_id, account_id, role, active)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (workspace_id, account_id)
           DO UPDATE SET role = EXCLUDED.role, active = true`,
          [invite.tenant_id, claims.accountId, invite.role]
        );
        await client.query(`UPDATE public.tenant_invites SET status = 'ACCEPTED', responded_at = now() WHERE id = $1`, [inviteId]);
        await client.query("COMMIT");
        send(res, 200, { ok: true });
      } catch (error) {
        try { await client.query("ROLLBACK"); } catch {}
        console.error(error);
        send(res, 500, { message: "Грешка при приемане на покана." });
      } finally {
        client.release();
      }
      return;
    }

    if (action === "decline") {
      const result = await pool.query(
        `UPDATE public.tenant_invites
         SET status = 'DECLINED', responded_at = now()
         WHERE id = $1 AND invited_account_id = $2 AND status = 'PENDING'`,
        [inviteId, claims.accountId]
      );
      send(res, result.rowCount ? 200 : 404, result.rowCount ? { ok: true } : { message: "Поканата не е намерена." });
      return;
    }

    send(res, 400, { message: "Невалидно действие." });
    return;
  }

  if (requestUrl.pathname === "/api/accounts/members/remove" && req.method === "POST") {
    const body = await readBody(req);
    await withTenant(req, res, async (client, claims) => {
      if (!isOwnerOrAdmin(claims.membershipRole)) {
        return { status: 403, body: { message: "Недостатъчни права." } };
      }
      const memberId = normalizeText(body.memberId);
      const membership = await getMembership(client, claims.tenantId, memberId);
      if (!membership) {
        return { status: 404, body: { message: "Членът не е намерен." } };
      }
      if (membership.role === 'OWNER') {
        return { status: 409, body: { message: "Owner не може да бъде премахнат без transfer ownership." } };
      }
      await client.query(
        `UPDATE public.workspace_memberships
         SET active = false
         WHERE workspace_id = $1 AND account_id = $2`,
        [claims.tenantId, memberId]
      );
      return { status: 200, body: { ok: true } };
    });
    return;
  }

  if (requestUrl.pathname === "/api/workspaces/members-summary" && req.method === "GET") {
    await withTenant(req, res, async (client, claims) => {
      const acceptedMembers = (
        await client.query(
          `SELECT wm.account_id AS id, a.email, a.display_name AS name, wm.role, wm.created_at AS "joinedAt"
           FROM public.workspace_memberships wm
           JOIN public.accounts a ON a.id = wm.account_id
           WHERE wm.workspace_id = $1 AND wm.active = true
           ORDER BY wm.created_at DESC`,
          [claims.tenantId]
        )
      ).rows;

      const pendingInvites = (
        await client.query(
          `SELECT ti.id, ti.invited_email AS email, ti.role, ti.created_at AS "createdAt", ti.expires_at AS "expiresAt",
                  inviter.display_name AS "invitedByName"
           FROM public.tenant_invites ti
           LEFT JOIN public.accounts inviter ON inviter.id = ti.invited_by_account_id
           WHERE ti.tenant_id = $1 AND ti.status = 'PENDING'
           ORDER BY ti.created_at DESC`,
          [claims.tenantId]
        )
      ).rows;

      return { status: 200, body: { acceptedMembers, pendingInvites } };
    });
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
  .then(async () => {
    dbReady = await tryRecoverDb();
    server.listen(PORT, HOST, () => {
      console.log(`[Teamio] Server listening on http://${HOST}:${PORT} (dbReady=${dbReady}, dbConfigSource=${dbConfigSource})`);
    });
  })
  .catch((error) => {
    dbReady = false;
    dbInitError = String(error?.message || error);
    console.error("[Teamio] Грешка при инициализация на PostgreSQL:", error);
    server.listen(PORT, HOST, () => {
      console.log(`[Teamio] Server listening in degraded mode on http://${HOST}:${PORT}`);
    });
  });
