-- Enabling RLS again just in case
alter table public.contributions enable row level security;

-- Policy 1 (Members can view their own contributions)
create policy "Users can view their own contributions"
  on public.contributions for select
  using (user_id = auth.uid());

-- Policy 2 (Members can view contributions in their groups)
create policy "Users can view group contributions"
  on public.contributions for select
  using (
    group_id in (
      select group_id from public.group_members 
      where user_id = auth.uid()
    )
  );

-- Policy 3 (Members can insert their own contributions)
create policy "Users can add their own contributions"
  on public.contributions for insert
  with check (user_id = auth.uid());

-- Policy 4 (Treasurers can update contribution status)
create policy "Treasurers can update contributions"
  on public.contributions for update
  using (
    exists (
      select 1 from public.group_members
      where group_id = contributions.group_id
      and user_id = auth.uid()
      and role = 'treasurer'
    )
  );