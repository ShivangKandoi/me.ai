-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table to store user information
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  primary key (id),
  unique(email),
  constraint email_validation check (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Create pages table to store document/page information
create table if not exists public.pages (
  id uuid default uuid_generate_v4() primary key,
  title text not null default 'Untitled',
  content jsonb not null default '{}',
  is_favorite boolean default false,
  is_private boolean default true,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  parent_page_id uuid references public.pages(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_edited_by uuid references public.profiles(id) on delete set null,
  theme text default 'light',
  icon text,
  emoji text
);

-- Create page_collaborators table for shared pages
create table if not exists public.page_collaborators (
  page_id uuid references public.pages(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  permission_level text check (permission_level in ('view', 'edit', 'admin')) default 'view',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (page_id, user_id)
);

-- Create comments table for page discussions
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  page_id uuid references public.pages(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  resolved boolean default false
);

-- Create page_versions table for version history
create table if not exists public.page_versions (
  id uuid default uuid_generate_v4() primary key,
  page_id uuid references public.pages(id) on delete cascade not null,
  content jsonb not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) on delete set null not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.page_collaborators enable row level security;
alter table public.comments enable row level security;
alter table public.page_versions enable row level security;

-- Create policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create policies for pages
create policy "Users can view their own pages"
  on public.pages for select
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.page_collaborators
      where page_id = id and user_id = auth.uid()
    )
    or (not is_private)
  );

create policy "Users can create pages"
  on public.pages for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own pages"
  on public.pages for update
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.page_collaborators
      where page_id = id and user_id = auth.uid() and permission_level in ('edit', 'admin')
    )
  );

create policy "Users can delete their own pages"
  on public.pages for delete
  using (auth.uid() = owner_id);

-- Create policies for page collaborators
create policy "Users can view page collaborators"
  on public.page_collaborators for select
  using (
    exists (
      select 1 from public.pages
      where id = page_id and (owner_id = auth.uid() or not is_private)
    )
    or user_id = auth.uid()
  );

create policy "Page owners can manage collaborators"
  on public.page_collaborators for all
  using (
    exists (
      select 1 from public.pages
      where id = page_id and owner_id = auth.uid()
    )
  );

-- Create policies for comments
create policy "Users can view comments on accessible pages"
  on public.comments for select
  using (
    exists (
      select 1 from public.pages
      where id = page_id and (
        owner_id = auth.uid()
        or exists (
          select 1 from public.page_collaborators
          where page_id = pages.id and user_id = auth.uid()
        )
        or not is_private
      )
    )
  );

create policy "Users can create comments on accessible pages"
  on public.comments for insert
  with check (
    exists (
      select 1 from public.pages
      where id = page_id and (
        owner_id = auth.uid()
        or exists (
          select 1 from public.page_collaborators
          where page_id = pages.id and user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can update their own comments"
  on public.comments for update
  using (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- Create policies for page versions
create policy "Users can view versions of accessible pages"
  on public.page_versions for select
  using (
    exists (
      select 1 from public.pages
      where id = page_id and (
        owner_id = auth.uid()
        or exists (
          select 1 from public.page_collaborators
          where page_id = pages.id and user_id = auth.uid()
        )
        or not is_private
      )
    )
  );

create policy "Users can create versions of their pages"
  on public.page_versions for insert
  with check (
    exists (
      select 1 from public.pages
      where id = page_id and (
        owner_id = auth.uid()
        or exists (
          select 1 from public.page_collaborators
          where page_id = pages.id and user_id = auth.uid() and permission_level in ('edit', 'admin')
        )
      )
    )
  );

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers for updated_at
create trigger handle_updated_at_pages
  before update on public.pages
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_comments
  before update on public.comments
  for each row execute procedure public.handle_updated_at(); 