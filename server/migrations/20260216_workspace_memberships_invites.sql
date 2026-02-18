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

CREATE TABLE IF NOT EXISTS public.workspace_memberships (
  workspace_id UUID NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('OWNER','ADMIN','MANAGER','MEMBER','VIEWER')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, account_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_workspace_owner_active
ON public.workspace_memberships(workspace_id)
WHERE role = 'OWNER' AND active = true;

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

CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_workspace_invite_account
ON public.workspace_invites(workspace_id, invitee_account_id)
WHERE status = 'pending' AND invitee_account_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_workspace_invite_email
ON public.workspace_invites(workspace_id, lower(invitee_email))
WHERE status = 'pending' AND invitee_email IS NOT NULL;
