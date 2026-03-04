-- supabase/migrations/20260302000000_initial_schema.sql
-- Uses gen_random_uuid() (built-in in PostgreSQL 13+, no extension needed)
-- ─────────────────────────────────────────────────────────────────────────────
-- TENANTS
-- ─────────────────────────────────────────────────────────────────────────────
create table tenants (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,          -- Arabic (primary display)
  name_en      text,
  description  text,
  logo_url     text,
  brand_color  text not null default '#C9A87C',
  phone        text,
  created_at   timestamptz not null default now()
);

-- Links auth users to their tenant (one user → one tenant for MVP)
create table tenant_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  tenant_id  uuid not null references tenants(id) on delete cascade
);

create table tenant_settings (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null unique references tenants(id) on delete cascade,
  payment_mode     text not null default 'at_salon'
                     check (payment_mode in ('full', 'deposit', 'at_salon')),
  deposit_percent  smallint check (deposit_percent between 1 and 100),
  max_advance_days integer not null default 30
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────────────────────────────────────────
create table service_categories (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  name       text not null,
  name_en    text,
  sort_order integer not null default 0
);

create table services (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  category_id       uuid not null references service_categories(id) on delete restrict,
  name              text not null,
  name_en           text,
  description       text,
  price             integer not null check (price >= 0),   -- SAR, no decimals
  duration_minutes  integer not null check (duration_minutes > 0),
  is_active         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- STAFF
-- ─────────────────────────────────────────────────────────────────────────────
create table staff (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  name       text not null,
  name_en    text,
  photo_url  text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Which services each staff member can perform
create table staff_services (
  staff_id    uuid not null references staff(id) on delete cascade,
  service_id  uuid not null references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- WORKING HOURS
-- Rows with staff_id = null represent salon-level defaults.
-- Staff-specific rows override the default for that day.
-- ─────────────────────────────────────────────────────────────────────────────
create table working_hours (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  staff_id     uuid references staff(id) on delete cascade,    -- null = salon default
  day_of_week  smallint not null check (day_of_week between 0 and 6), -- 0=Sun
  start_time   time not null,
  end_time     time not null,
  is_working   boolean not null default true
);

-- ─────────────────────────────────────────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────────────────────────────────────────
create table bookings (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  service_id       uuid not null references services(id) on delete restrict,
  staff_id         uuid references staff(id) on delete set null,
  customer_name    text not null,
  customer_phone   text not null,
  date             date not null,
  time             time not null,
  status           text not null default 'pending'
                     check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status   text not null default 'at_salon'
                     check (payment_status in ('unpaid', 'paid', 'at_salon')),
  created_at       timestamptz not null default now()
);

-- Useful index for the admin calendar: fetch bookings by tenant + date
create index bookings_tenant_date_idx on bookings(tenant_id, date);

-- ─────────────────────────────────────────────────────────────────────────────
-- TIME BLOCKS (admin blocks off hours/days)
-- ─────────────────────────────────────────────────────────────────────────────
create table time_blocks (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  staff_id     uuid references staff(id) on delete cascade,  -- null = all staff
  date         date not null,
  start_time   time,           -- null when is_full_day = true
  end_time     time,           -- null when is_full_day = true
  is_full_day  boolean not null default false,
  reason       text,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: enable on all tables
-- ─────────────────────────────────────────────────────────────────────────────
alter table tenants          enable row level security;
alter table tenant_users     enable row level security;
alter table tenant_settings  enable row level security;
alter table service_categories enable row level security;
alter table services         enable row level security;
alter table staff            enable row level security;
alter table staff_services   enable row level security;
alter table working_hours    enable row level security;
alter table bookings         enable row level security;
alter table time_blocks      enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS HELPER: returns the tenant_id of the currently authenticated admin
-- Returns null when called by an unauthenticated/public request.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function current_tenant_id()
returns uuid
language sql
stable
as $$
  select tenant_id from tenant_users where user_id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- tenants: public read by slug (for booking page); admin can update their own
create policy "public can read tenants"          on tenants for select using (true);
create policy "admin can update own tenant"      on tenants for update using (id = current_tenant_id());

-- tenant_users: admin can only see their own row
create policy "user can read own tenant link"    on tenant_users for select using (user_id = auth.uid());

-- tenant_settings: public read; admin can write
create policy "public can read tenant_settings"  on tenant_settings for select using (true);
create policy "admin can write tenant_settings"  on tenant_settings for all using (tenant_id = current_tenant_id());

-- service_categories: public read; admin CRUD on their own
create policy "public can read categories"       on service_categories for select using (true);
create policy "admin can write categories"       on service_categories for all using (tenant_id = current_tenant_id());

-- services: public read active; admin CRUD
create policy "public can read active services"  on services for select using (is_active = true);
create policy "admin can read all services"      on services for select using (tenant_id = current_tenant_id());
create policy "admin can write services"         on services for all using (tenant_id = current_tenant_id());

-- staff: public read active; admin CRUD
create policy "public can read active staff"     on staff for select using (is_active = true);
create policy "admin can write staff"            on staff for all using (tenant_id = current_tenant_id());

-- staff_services: public read; admin write
create policy "public can read staff_services"   on staff_services for select using (true);
create policy "admin can write staff_services"   on staff_services for all
  using (staff_id in (select id from staff where tenant_id = current_tenant_id()));

-- working_hours: public read; admin write
create policy "public can read working_hours"    on working_hours for select using (true);
create policy "admin can write working_hours"    on working_hours for all using (tenant_id = current_tenant_id());

-- bookings: customers can INSERT; admin can SELECT/UPDATE their tenant's bookings
create policy "public can create bookings"       on bookings for insert with check (true);
create policy "admin can manage own bookings"    on bookings for all using (tenant_id = current_tenant_id());

-- time_blocks: public read; admin write
create policy "public can read time_blocks"      on time_blocks for select using (true);
create policy "admin can write time_blocks"      on time_blocks for all using (tenant_id = current_tenant_id());
