-- Add slug column to pages table
alter table public.pages
add column if not exists slug text;

-- Make slug unique
create unique index if not exists pages_slug_idx on public.pages(slug);

-- Create function to generate slug
create or replace function generate_unique_slug(title text)
returns text
language plpgsql
as $$
declare
  base_slug text;
  new_slug text;
  counter integer := 1;
begin
  -- Convert title to base slug
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  
  -- Remove leading and trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Initial attempt with timestamp
  new_slug := base_slug || '-' || extract(epoch from now())::bigint;
  
  -- Return the unique slug
  return new_slug;
end;
$$;

-- Add trigger to automatically generate slug on insert if not provided
create or replace function handle_page_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null then
    new.slug := generate_unique_slug(new.title);
  end if;
  return new;
end;
$$;

create trigger ensure_page_slug
  before insert on public.pages
  for each row
  execute function handle_page_slug();

-- Backfill existing pages with slugs
update public.pages
set slug = generate_unique_slug(title)
where slug is null; 