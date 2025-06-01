-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('admin', 'member', 'guest');
create type workspace_role as enum ('owner', 'admin', 'member', 'guest');
create type block_type as enum (
  'text',
  'heading_1',
  'heading_2',
  'heading_3',
  'bullet_list',
  'numbered_list',
  'todo',
  'toggle',
  'code',
  'quote',
  'divider',
  'image',
  'file',
  'table'
);

-- Create users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  workspace_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create workspaces table
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create workspace_members table
create table public.workspace_members (
  workspace_id uuid references public.workspaces on delete cascade,
  user_id uuid references public.users on delete cascade,
  role workspace_role not null default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (workspace_id, user_id)
);

-- Create pages table
create table public.pages (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  parent_id uuid references public.pages on delete cascade,
  title text not null default 'Untitled',
  icon text,
  cover_image text,
  is_favorite boolean default false,
  is_archived boolean default false,
  created_by uuid references public.users not null,
  updated_by uuid references public.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create blocks table (for page content)
create table public.blocks (
  id uuid default uuid_generate_v4() primary key,
  page_id uuid references public.pages on delete cascade not null,
  parent_id uuid references public.blocks on delete cascade,
  type block_type not null,
  content jsonb,
  properties jsonb,
  sort_order real not null,
  created_by uuid references public.users not null,
  updated_by uuid references public.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create shares table
create table public.shares (
  id uuid default uuid_generate_v4() primary key,
  page_id uuid references public.pages on delete cascade not null,
  access_level text not null default 'view',
  is_public boolean default false,
  created_by uuid references public.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone
);

-- Create comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  block_id uuid references public.blocks on delete cascade,
  page_id uuid references public.pages on delete cascade,
  content text not null,
  created_by uuid references public.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  type text not null,
  content jsonb not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for better performance
create index idx_pages_workspace on public.pages(workspace_id);
create index idx_pages_parent on public.pages(parent_id);
create index idx_blocks_page on public.blocks(page_id);
create index idx_blocks_parent on public.blocks(parent_id);
create index idx_blocks_sort on public.blocks(page_id, sort_order);
create index idx_comments_block on public.comments(block_id);
create index idx_comments_page on public.comments(page_id);
create index idx_notifications_user on public.notifications(user_id, is_read);

-- Add RLS policies
alter table public.users enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.pages enable row level security;
alter table public.blocks enable row level security;
alter table public.shares enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

-- Create functions for updating timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger handle_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.workspaces
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.pages
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.blocks
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.comments
  for each row
  execute function public.handle_updated_at(); 