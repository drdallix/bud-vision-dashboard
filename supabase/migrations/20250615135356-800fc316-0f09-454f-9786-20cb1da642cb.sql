
-- Create a table to store price points for strains
create table public.prices (
  id uuid primary key default gen_random_uuid(),
  strain_id uuid not null references scans(id) on delete cascade,
  internal_grower_id uuid not null,
  now_price numeric not null,
  was_price numeric,
  created_at timestamp with time zone not null default now()
);

-- Only allow the following preset prices (in USD/oz): 30, 40, 50, 60, 80, 100, 120, 200, 300
create or replace function public.enforce_preset_prices() 
returns trigger as $$
begin
  if NEW.now_price not in (30,40,50,60,80,100,120,200,300) then
    raise exception 'Invalid now_price, must be in (30,40,50,60,80,100,120,200,300)';
  end if;
  if NEW.was_price is not null and NEW.was_price not in (30,40,50,60,80,100,120,200,300) then
    raise exception 'Invalid was_price, must be in (30,40,50,60,80,100,120,200,300)';
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger prices_validate
before insert or update on public.prices
for each row execute function public.enforce_preset_prices();

-- Enable Row Level Security
alter table public.prices enable row level security;

-- Allow users to view and edit prices for their own strains
create policy "Allow strain owner to read price"
  on public.prices for select
  using (exists (select 1 from scans s where s.id = strain_id and s.user_id = auth.uid()));

create policy "Allow strain owner to insert price"
  on public.prices for insert
  with check (exists (select 1 from scans s where s.id = strain_id and s.user_id = auth.uid()));

create policy "Allow strain owner to update price"
  on public.prices for update
  using (exists (select 1 from scans s where s.id = strain_id and s.user_id = auth.uid()));

create policy "Allow strain owner to delete price"
  on public.prices for delete
  using (exists (select 1 from scans s where s.id = strain_id and s.user_id = auth.uid()));
