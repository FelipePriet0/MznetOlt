-- RLS policy templates for review with network/security team
-- Usage: copy needed blocks, replace <table>, and apply when ready.

-- Block 1: Enable RLS (no policies → blocks anon/auth entirely)
-- alter table public.<table> enable row level security;

-- Block 2: Read-only for authenticated users
-- create policy read_auth on public.<table>
--   for select
--   using (auth.uid() is not null);

-- Block 3: Insert/Update for authenticated users (adjust predicates)
-- create policy insert_auth on public.<table>
--   for insert
--   with check (auth.uid() is not null);
-- create policy update_auth on public.<table>
--   for update
--   using (auth.uid() is not null)
--   with check (auth.uid() is not null);

-- Optional: Restrict by role (example using JWT claim)
-- using (coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role','') = 'authenticated')

-- Optional: Tenant scoping example
-- using ((current_setting('request.jwt.claims', true)::jsonb ->> 'sub') = user_id::text)

-- Recommended candidates to block (internal/staging):
-- alter table public.import_onus_staging enable row level security;
-- alter table public.import_olts_staging enable row level security;
-- alter table public.network_events enable row level security;
-- alter table public.network_sync_runs enable row level security;
-- alter table public.onu_network_snapshots enable row level security;
-- alter table public.onu_events enable row level security;
-- alter table public.authorization_presets enable row level security;
-- alter table public.authorization_preset_profiles enable row level security;

-- Optional: Move staging/internal to a private schema
-- create schema if not exists internal;
-- alter table public.import_onus_staging set schema internal;
-- alter table public.import_olts_staging set schema internal;
-- revoke usage on schema internal from anon, authenticated;

