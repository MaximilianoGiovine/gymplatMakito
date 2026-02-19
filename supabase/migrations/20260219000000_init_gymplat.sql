-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'premium')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EXERCISES (Admin managed, Public read)
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  video_url text, -- Premium users only for detailed guides
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  is_premium boolean default false,
  equipment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WORKOUTS (User created)
create table workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WORKOUT LOGS
create table workout_logs (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references workouts(id) on delete cascade not null,
  exercise_id uuid references exercises(id) not null,
  sets int not null,
  reps int not null,
  weight numeric not null,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RECIPES
create table recipes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  ingredients jsonb not null, -- Array of strings
  instructions text,
  is_premium boolean default false,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STREAKS (Gamification)
create table streaks (
  user_id uuid references profiles(id) primary key,
  current_streak int default 0,
  last_activity_date date default CURRENT_DATE,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES

-- Profiles: Users can view their own, Admin can view all (simplified for now)
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Exercises: Public read
alter table exercises enable row level security;
create policy "Exercises are public" on exercises for select using (true);

-- Workouts: Users manage their own
alter table workouts enable row level security;
create policy "Users manage own workouts" on workouts for all using (auth.uid() = user_id);

-- Logs: Users manage their own logs via workout ownership
alter table workout_logs enable row level security;
create policy "Users manage own logs" on workout_logs for all using (
  exists (select 1 from workouts w where w.id = workout_logs.workout_id and w.user_id = auth.uid())
);

-- Recipes: Public read (App logic handles Premium gating)
alter table recipes enable row level security;
create policy "Recipes are public" on recipes for select using (true);

-- Streaks: Users view own
alter table streaks enable row level security;
create policy "Users view own streaks" on streaks for select using (auth.uid() = user_id);

-- TRIGGER: Create profile on auth.signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  insert into public.streaks (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
