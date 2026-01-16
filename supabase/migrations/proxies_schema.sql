-- Create Proxies Table
create table public.proxies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  ip text not null,
  port int not null,
  username text not null,
  password text not null,
  country_code text not null,
  isp_name text,
  purchase_date timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  status text default 'active' check (status in ('active', 'expired', 'suspended')),
  auto_renew boolean default false
);

-- Enable RLS
alter table public.proxies enable row level security;

-- Policies
create policy "Users can view their own proxies"
  on public.proxies for select
  using ( auth.uid() = user_id );

create policy "Admins can view all proxies"
  on public.proxies for select
  using ( auth.uid() in (select id from public.users where role = 'admin') ); 
  -- Note: Adjust admin check based on your actual admin role implementation
