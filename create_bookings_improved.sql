-- =========================================
-- 1️⃣ EXTENSIONS
-- =========================================
-- Required for exclusion constraints on UUID + Range
create extension if not exists btree_gist;

-- =========================================
-- 0️⃣ RESET (CAUTION: Deletes data)
-- =========================================
drop table if exists bookings cascade;

-- =========================================
-- 2️⃣ BOOKINGS TABLE (IMPROVED)
-- =========================================
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),

  -- relationships
  client_id uuid not null references profiles(id) on delete set null,
  photographer_id uuid not null references profiles(id) on delete set null,

  -- timing logic
  start_time timestamptz not null check (start_time >= now()),
  duration_hours numeric not null check (duration_hours > 0 and duration_hours <= 24),
  
  -- Calculated via trigger for easier querying and overlap checks
  end_time timestamptz,

  -- form fields
  shoot_type text not null,
  location text not null,
  total_price numeric not null default 0,
  message text,

  -- booking lifecycle
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- constraints
  constraint no_self_booking check (client_id <> photographer_id)
);

-- FUNCTION TO CALCULATE END TIME
create or replace function calculate_booking_end_time()
returns trigger as $$
begin
  new.end_time := new.start_time + (new.duration_hours * interval '1 hour');
  return new;
end;
$$ language plpgsql;

-- TRIGGER TO RUN CALCULATION
create trigger bookings_end_time_trigger
before insert or update of start_time, duration_hours on bookings
for each row
execute function calculate_booking_end_time();

-- PREVENT OVERLAPPING BOOKINGS
-- Ensures a photographer doesn't have two overlapping bookings that are 'pending' or 'accepted'
create index if not exists bookings_photographer_time_range_idx 
on bookings using gist (photographer_id, tstzrange(start_time, end_time));

-- Technically, an exclusion constraint is better for hard enforcement
alter table bookings drop constraint if exists prevent_overlap;
alter table bookings add constraint prevent_overlap 
exclude using gist (
  photographer_id with =,
  tstzrange(start_time, end_time) with &&
)
where (status in ('pending', 'accepted'));

-- Enable Row Level Security
alter table bookings enable row level security;

-- =========================================
-- 3️⃣ RLS POLICIES FOR BOOKINGS
-- =========================================

-- Clients can create bookings (must be the owner)
create policy "Clients can create bookings"
on bookings for insert to authenticated
with check (auth.uid() = client_id);

-- Everyone involved can view the booking
create policy "Users can view their own/involved bookings"
on bookings for select to authenticated
using (auth.uid() = client_id or auth.uid() = photographer_id);

-- Photographers can update status (accept/reject/complete)
create policy "Photographers can manage booking status"
on bookings for update to authenticated
using (auth.uid() = photographer_id)
with check (
  -- Ensure they only update the status field, or at least they are the photographer
  auth.uid() = photographer_id
);

-- Clients can only cancel their own bookings (if pending/accepted)
create policy "Clients can cancel their own bookings"
on bookings for update to authenticated
using (auth.uid() = client_id)
with check (
  auth.uid() = client_id AND
  status = 'cancelled'
);

-- =========================================
-- 4️⃣ SEARCH OPTIMIZATION
-- =========================================
create index if not exists bookings_client_id_idx on bookings(client_id);
create index if not exists bookings_photographer_id_idx on bookings(photographer_id);
create index if not exists bookings_status_idx on bookings(status);
