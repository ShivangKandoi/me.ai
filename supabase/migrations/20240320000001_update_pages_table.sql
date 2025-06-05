-- Add owner_id column if it doesn't exist
alter table public.pages
add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- Add not null constraint to owner_id
alter table public.pages
alter column owner_id set not null;

-- Add default value for content (empty JSON object)
alter table public.pages
alter column content set default '{}'::jsonb;

-- Add default value for is_favorite
alter table public.pages
alter column is_favorite set default false;

-- Create index for faster page lookups
create index if not exists pages_owner_id_idx on public.pages(owner_id);
create index if not exists pages_updated_at_idx on public.pages(updated_at desc);

-- First, disable RLS
alter table public.pages disable row level security;

-- Drop existing policies
drop policy if exists "Users can view their own pages" on public.pages;
drop policy if exists "Users can create pages" on public.pages;
drop policy if exists "Users can update their own pages" on public.pages;
drop policy if exists "Users can delete their own pages" on public.pages;

-- Enable RLS
alter table public.pages enable row level security;

-- Create simplified policies
create policy "Enable read for users based on owner_id"
  on public.pages
  for select
  using (auth.uid() = owner_id);

create policy "Enable insert for authenticated users"
  on public.pages
  for insert
  with check (auth.uid() = owner_id);

create policy "Enable update for users based on owner_id"
  on public.pages
  for update
  using (auth.uid() = owner_id);

create policy "Enable delete for users based on owner_id"
  on public.pages
  for delete
  using (auth.uid() = owner_id); 