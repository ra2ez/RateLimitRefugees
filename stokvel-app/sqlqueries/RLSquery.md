alter table public.profiles enable row level security;

create policy "User can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "User can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
