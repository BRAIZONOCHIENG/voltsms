-- Create game_products table
create table public.game_products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  provider_product_id text not null,
  category text not null, -- 'Mobile Legends', 'PUBG', etc.
  price decimal not null, -- Selling price in USD
  cost decimal not null, -- Cost from provider
  currency text default 'USD',
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for game_products (Public read, Admin write)
alter table public.game_products enable row level security;

create policy "Public can view active products"
  on public.game_products for select
  using ( is_active = true );

create policy "Admins can manage products"
  on public.game_products for all
  using ( auth.uid() in (select id from public.users where role = 'admin') );


-- Create orders table (if not exists, or update existing one)
-- Checking your existing code, you use 'orders' table. We need to ensure it supports games.

-- Add columns to support Game Top-ups if they don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'order_type') then
    alter table public.orders add column order_type text default 'sms'; -- 'sms', 'rental', 'game_topup'
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'target_identifier') then
    alter table public.orders add column target_identifier text; -- Player ID or Phone Number
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'metadata') then
    alter table public.orders add column metadata jsonb; -- Store extra game info (Zone ID, Server)
  end if;
end $$;
