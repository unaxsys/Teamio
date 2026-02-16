CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_tenant_id_key;
ALTER TABLE public.accounts ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE public.accounts ALTER COLUMN tenant_id DROP DEFAULT;

ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS public_id TEXT;

UPDATE public.accounts
SET public_id = upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 10))
WHERE public_id IS NULL;

ALTER TABLE public.accounts ALTER COLUMN public_id SET NOT NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.accounts'::regclass
      AND conname = 'accounts_public_id_key'
  ) THEN
    ALTER TABLE public.accounts ADD CONSTRAINT accounts_public_id_key UNIQUE (public_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('OWNER','ADMIN','MANAGER','MEMBER','VIEWER')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REMOVED')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, account_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_tenant_owner_active
ON public.tenant_members(tenant_id)
WHERE role = 'OWNER' AND status = 'ACTIVE';

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
