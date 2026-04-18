-- Enabling RLS just in case
alter table public.group_members enable row level security;

-- POlicy 1 (Users can see members of their own groups)
create policy "Users can view members of their groups"
  on public.group_members for select
  using (
    group_id in (
      select group_id from public.group_members 
      where user_id = auth.uid()
    )
  );

-- Policy 2 (Group admins can add members)
create policy "Group admins can add members"
  on public.group_members for insert
  with check (
    exists (
      select 1 from public.groups
      where id = group_id and created_by = auth.uid()
    )
  );

-- Policy 3 (Group admins can remove members)
create policy "Group admins can remove members"
  on public.group_members for delete
  using (
    exists (
      select 1 from public.groups
      where id = group_id and created_by = auth.uid()
    )
  );