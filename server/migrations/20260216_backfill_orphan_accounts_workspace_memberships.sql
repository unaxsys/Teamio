BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  orphan_account RECORD;
  new_workspace_id UUID;
  new_schema_name TEXT;
  board_id UUID;
BEGIN
  FOR orphan_account IN
    SELECT a.id
    FROM public.accounts a
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.workspace_memberships wm
      WHERE wm.account_id = a.id
    )
  LOOP
    new_workspace_id := gen_random_uuid();
    new_schema_name := 't_' || replace(new_workspace_id::text, '-', '');

    INSERT INTO public.tenants (tenant_id, schema_name)
    VALUES (new_workspace_id, new_schema_name);

    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', new_schema_name);

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I.boards (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         name TEXT NOT NULL,
         created_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )',
      new_schema_name
    );

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I.columns (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         board_id UUID NOT NULL REFERENCES %I.boards(id) ON DELETE CASCADE,
         name TEXT NOT NULL,
         position INTEGER NOT NULL DEFAULT 0,
         wip_limit INTEGER,
         created_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )',
      new_schema_name,
      new_schema_name
    );

    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_columns_board ON %I.columns(board_id)', new_schema_name);

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I.tasks (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         board_id UUID NOT NULL REFERENCES %I.boards(id) ON DELETE CASCADE,
         column_id UUID NOT NULL REFERENCES %I.columns(id) ON DELETE CASCADE,
         title TEXT NOT NULL,
         description TEXT,
         position INTEGER NOT NULL DEFAULT 0,
         due_date DATE,
         created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
         updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )',
      new_schema_name,
      new_schema_name,
      new_schema_name
    );

    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_tasks_board ON %I.tasks(board_id)', new_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_tasks_column ON %I.tasks(column_id)', new_schema_name);

    EXECUTE format(
      'CREATE OR REPLACE FUNCTION %I.set_updated_at()
       RETURNS trigger AS $$
       BEGIN
         NEW.updated_at = now();
         RETURN NEW;
       END;
       $$ LANGUAGE plpgsql',
      new_schema_name
    );

    EXECUTE format('DROP TRIGGER IF EXISTS trg_tasks_updated_at ON %I.tasks', new_schema_name);
    EXECUTE format(
      'CREATE TRIGGER trg_tasks_updated_at
       BEFORE UPDATE ON %I.tasks
       FOR EACH ROW EXECUTE FUNCTION %I.set_updated_at()',
      new_schema_name,
      new_schema_name
    );

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I.workspace_state (
         id TEXT PRIMARY KEY,
         workspace_id TEXT NOT NULL,
         updated_by UUID,
         updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
         payload JSONB NOT NULL
       )',
      new_schema_name
    );

    EXECUTE format('INSERT INTO %I.boards(name) VALUES ($1) RETURNING id', new_schema_name)
      INTO board_id
      USING 'Основен борд';

    EXECUTE format('INSERT INTO %I.columns (board_id, name, position) VALUES ($1, $2, $3)', new_schema_name)
      USING board_id, 'Backlog', 0;
    EXECUTE format('INSERT INTO %I.columns (board_id, name, position) VALUES ($1, $2, $3)', new_schema_name)
      USING board_id, 'В процес', 1;
    EXECUTE format('INSERT INTO %I.columns (board_id, name, position) VALUES ($1, $2, $3)', new_schema_name)
      USING board_id, 'Преглед', 2;
    EXECUTE format('INSERT INTO %I.columns (board_id, name, position) VALUES ($1, $2, $3)', new_schema_name)
      USING board_id, 'Готово', 3;

    INSERT INTO public.workspace_memberships (workspace_id, account_id, role, active)
    VALUES (new_workspace_id, orphan_account.id, 'OWNER', true)
    ON CONFLICT (workspace_id, account_id)
    DO UPDATE SET role = EXCLUDED.role, active = true;

    UPDATE public.accounts
    SET tenant_id = new_workspace_id
    WHERE id = orphan_account.id;
  END LOOP;
END $$;

COMMIT;
