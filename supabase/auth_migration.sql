-- ============================================================
-- StudyRev — Auth Migration
-- Run this in Supabase > SQL Editor
-- Run AFTER your existing seed.sql / seed_cs_full.sql
-- ============================================================

-- ── User profiles ─────────────────────────────────────────────

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- ── User bookmarks ────────────────────────────────────────────

create table if not exists user_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  item_id uuid not null,
  item_type text check (item_type in ('question', 'topic')),
  created_at timestamptz default now(),
  unique(user_id, item_id, item_type)
);

-- ── User progress ─────────────────────────────────────────────

create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  topic_id uuid references topics(id) on delete cascade,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, topic_id)
);

-- ── User notes ────────────────────────────────────────────────

create table if not exists user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  topic_id uuid references topics(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, topic_id)
);

-- ── User quiz results ─────────────────────────────────────────

create table if not exists user_quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  topic_id uuid references topics(id) on delete cascade,
  score integer not null,
  total integer not null,
  created_at timestamptz default now()
);

-- ── RLS Policies ──────────────────────────────────────────────

alter table user_profiles enable row level security;
alter table user_bookmarks enable row level security;
alter table user_progress enable row level security;
alter table user_notes enable row level security;
alter table user_quiz_results enable row level security;

-- user_profiles: users can read/write their own row
create policy "Users read own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on user_profiles for update
  using (auth.uid() = id);

create policy "Users insert own profile"
  on user_profiles for insert
  with check (auth.uid() = id);

-- Admin can read all profiles
create policy "Admins read all profiles"
  on user_profiles for select
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- user_bookmarks: own rows only
create policy "Users manage own bookmarks"
  on user_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_progress: own rows only
create policy "Users manage own progress"
  on user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_notes: own rows only
create policy "Users manage own notes"
  on user_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_quiz_results: own rows only
create policy "Users manage own quiz results"
  on user_quiz_results for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── RLS for content tables: admins can write ──────────────────

-- Allow authenticated admins to insert/update/delete subjects
create policy "Admins write subjects"
  on subjects for all
  using (
    exists (select 1 from user_profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from user_profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins write topics"
  on topics for all
  using (
    exists (select 1 from user_profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from user_profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins write questions"
  on questions for all
  using (
    exists (select 1 from user_profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from user_profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins write notes"
  on notes for all
  using (
    exists (select 1 from user_profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from user_profiles where id = auth.uid() and is_admin = true)
  );

-- ── Auto-create profile on signup ─────────────────────────────

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, display_name, is_admin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- AFTER RUNNING THIS:
--
-- 1. To make yourself admin:
--    UPDATE user_profiles SET is_admin = true WHERE email = 'your@email.com';
--
-- 2. Sign up at /signup on your site with your email
--    Then run the UPDATE above in SQL Editor
--
-- 3. Optionally disable email confirmation:
--    Supabase > Authentication > Settings > Disable "Enable email confirmations"
--    (Good for testing, optional for production)
-- ============================================================
