create extension if not exists "pgcrypto";

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id text unique,
  order_id text not null unique,
  payment_id text unique,
  payment_signature text,
  status text not null default 'pending',
  full_name text not null,
  email text not null,
  phone text not null,
  quantity integer not null check (quantity between 1 and 10),
  notes text,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR',
  ticket_token text unique,
  confirmed_at timestamptz,
  email_sent_at timestamptz,
  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_created_at_idx on bookings (created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on bookings;

create trigger bookings_set_updated_at
before update on bookings
for each row
execute procedure set_updated_at();
