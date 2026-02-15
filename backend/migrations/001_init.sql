create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  is_premium boolean not null default false,
  premium_expiry timestamptz,
  check (is_premium or premium_expiry is null)
);

create table if not exists conventions (
  code text primary key,
  data jsonb not null,
  version integer not null,
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  convention_code text not null references conventions(code),
  work_type text not null check (work_type in ('horaire', 'forfait')),
  seniority_years integer not null default 0 check (seniority_years >= 0),
  forfait_granularity text check (forfait_granularity in ('day', 'half_day')),
  created_at timestamptz not null default now(),
  check (
    (work_type = 'forfait' and forfait_granularity is not null)
    or (work_type = 'horaire' and forfait_granularity is null)
  )
);

create table if not exists planning (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  worked_unit numeric(2,1) not null check (worked_unit in (0, 0.5, 1)),
  posable boolean not null,
  blocked boolean not null default false,
  unique (profile_id, date),
  check (not blocked or not posable)
);

create table if not exists capital (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  cp_remaining numeric(7,2) not null check (cp_remaining >= 0),
  rtt_remaining numeric(7,2) not null check (rtt_remaining >= 0),
  calculated boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists simulations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('local', 'annual')),
  parameters jsonb not null check (parameters <> '{}'::jsonb),
  created_at timestamptz not null default now()
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references simulations(id) on delete cascade,
  strategy_type text,
  metrics jsonb not null,
  allocation jsonb not null
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  store text not null check (store in ('apple', 'google')),
  receipt text not null,
  valid_until timestamptz not null,
  status text not null check (status in ('active', 'expired', 'cancelled')),
  check (status <> 'active' or valid_until > current_timestamp)
);
