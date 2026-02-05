-- Create api_keys table
create table if not exists public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  key text unique not null,
  label text,
  is_active boolean default true,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

-- Enable RLS
alter table public.api_keys enable row level security;

-- Policies
create policy "Users can view their own keys"
  on public.api_keys for select
  using (auth.uid() = user_id);

create policy "Users can delete (revoke) their own keys"
  on public.api_keys for delete
  using (auth.uid() = user_id);

-- Only service role can insert (we'll do generation via server-side API)
-- OR allow users to insert if we validate on server. 
-- Best practice: Allow Read/Delete for user, Insert via function or server endpoint.
-- We'll use the server endpoint with service role to insert, which bypasses RLS, so this is fine.
