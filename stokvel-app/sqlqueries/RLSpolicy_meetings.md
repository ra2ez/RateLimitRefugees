-- Enabling RLS just in case
alter table public.meetings enable row level security;

-- Policy 1 (Members can view meetings in their groups)
create policy "Users can view meetings in their groups"
  on public.meetings for select
  using (
    group_id in (
      select group_id from public.group_members 
      where user_id = auth.uid()
    )
  );

-- Policy 2 (Admins and treasurers can create meetings)
create policy "Admins can create meetings"
  on public.meetings for insert
  with check (
    exists (
      select 1 from public.group_members
      where group_id = meetings.group_id
      and user_id = auth.uid()
      and role in ('admin', 'treasurer')
    )
  );

-- Policy 3 (Admins and treasurers can update meetings)
create policy "Admins can update meetings"
  on public.meetings for update
  using (
    exists (
      select 1 from public.group_members
      where group_id = meetings.group_id
      and user_id = auth.uid()
      and role in ('admin', 'treasurer')
    )
  );