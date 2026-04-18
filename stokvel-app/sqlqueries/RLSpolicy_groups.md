-- Enabling RLS again just in case
alter table public.groups enable row level security;

-- Policy 1 (Group Access)
create policy "Users can view groups they are members of"
  on public.groups for select
  using (
    id in (
      select group_id from public.group_members 
      where user_id = auth.uid()
    )
  );

-- Policy 2 (Only group admins can update groups)
create policy "Group admins can update their groups"
  on public.groups for update
  using (
    created_by = auth.uid()
  );

-- Policy 3 (Only authenticated users can create groups)
create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() is not null);

-- I have not added any policy for delete, this means groups cannot be deleted by default