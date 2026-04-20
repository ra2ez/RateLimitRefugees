# Master RLS Policies
Last updated: April 2026

All Row Level Security policies currently active on the Stokvel Management Platform database.

---

## Helper Functions

```sql
create or replace function public.get_user_group_ids(user_uuid uuid)
returns setof uuid
language sql
security definer
stable
as $$
  select group_id from public.group_members where user_id = user_uuid;
$$;

create or replace function public.is_group_admin(group_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.groups
    where id = group_uuid
    and created_by = auth.uid()
  );
$$;
```

---

## Profiles Table

```sql
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can read profiles of people in their groups
create policy "Users can read profiles of group members"
  on public.profiles for select
  using (
    id in (
      select group_members.user_id
      from group_members
      where group_members.group_id in (
        select group_members_1.group_id
        from group_members group_members_1
        where group_members_1.user_id = auth.uid()
      )
    )
  );

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

---

## Groups Table

```sql
alter table public.groups enable row level security;

-- Members can view groups they belong to
create policy "Users can view groups they are members of"
  on public.groups for select
  using (
    id in (
      select group_members.group_id
      from group_members
      where group_members.user_id = auth.uid()
    )
  );

-- Anyone can look up a group by invite code to join
create policy "Anyone can look up group by invite code"
  on public.groups for select
  using (invite_code is not null);

-- Any logged in user can create a group
create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() is not null);

-- Only group admins can update group settings
create policy "Group admins can update their groups"
  on public.groups for update
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = groups.id
      and group_members.user_id = auth.uid()
      and group_members.role = 'admin'
    )
  );

-- Only group admins can delete the group
create policy "Group admins can delete their groups"
  on public.groups for delete
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = groups.id
      and group_members.user_id = auth.uid()
      and group_members.role = 'admin'
    )
  );
```

---

## Group Members Table

```sql
alter table public.group_members enable row level security;

-- Members can see other members in their groups (uses helper function to avoid recursion)
create policy "Users can view members of their groups"
  on public.group_members for select
  using (
    group_id in (select get_user_group_ids(auth.uid()))
  );

-- Users can only add themselves as members
create policy "Users can insert themselves as members"
  on public.group_members for insert
  with check (user_id = auth.uid());

-- Only group admins can change member roles (uses helper function to avoid recursion)
create policy "Admins can update member roles"
  on public.group_members for update
  using (is_group_admin(group_id));

-- Group admins can remove any member
create policy "Admins can remove members"
  on public.group_members for delete
  using (
    group_id in (
      select groups.id from groups
      where groups.created_by = auth.uid()
    )
  );

-- Members can remove themselves (leave a group)
create policy "Members can leave groups"
  on public.group_members for delete
  using (user_id = auth.uid());
```

---

## Contributions Table

```sql
alter table public.contributions enable row level security;

-- Members see their own contributions, admins/treasurers see all group contributions
create policy "Users can view relevant contributions"
  on public.contributions for select
  using (
    user_id = auth.uid()
    or
    group_id in (
      select group_members.group_id
      from group_members
      where group_members.user_id = auth.uid()
    )
  );

-- Members can log their own contributions
create policy "Members can add their own contributions"
  on public.contributions for insert
  with check (user_id = auth.uid());

-- Members can update their own contributions
create policy "Members can update their own contributions"
  on public.contributions for update
  using (user_id = auth.uid());

-- Treasurers and admins can confirm or flag any contribution in their group
create policy "Treasurers can update contributions"
  on public.contributions for update
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = contributions.group_id
      and group_members.user_id = auth.uid()
      and group_members.role = any (array['treasurer', 'admin'])
    )
  );
```

---

## Payouts Table

```sql
alter table public.payouts enable row level security;

-- All group members can view payouts
create policy "Users can view payouts in their groups"
  on public.payouts for select
  using (
    group_id in (
      select group_members.group_id
      from group_members
      where group_members.user_id = auth.uid()
    )
  );

-- Only treasurers and admins can initiate payouts
create policy "Treasurers can create payouts"
  on public.payouts for insert
  with check (
    exists (
      select 1 from group_members
      where group_members.group_id = payouts.group_id
      and group_members.user_id = auth.uid()
      and group_members.role = any (array['treasurer', 'admin'])
    )
  );

-- Only treasurers and admins can update payout status
create policy "Treasurers can update payouts"
  on public.payouts for update
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = payouts.group_id
      and group_members.user_id = auth.uid()
      and group_members.role = any (array['treasurer', 'admin'])
    )
  );
```

---

## Meetings Table

```sql
alter table public.meetings enable row level security;

-- All group members can view meetings
create policy "Users can view meetings in their groups"
  on public.meetings for select
  using (
    group_id in (
      select group_members.group_id
      from group_members
      where group_members.user_id = auth.uid()
    )
  );

-- Only admins and treasurers can schedule meetings
create policy "Admins and treasurers can create meetings"
  on public.meetings for insert
  with check (
    exists (
      select 1 from group_members
      where group_members.group_id = meetings.group_id
      and group_members.user_id = auth.uid()
      and group_members.role = any (array['admin', 'treasurer'])
    )
  );

-- Only admins and treasurers can edit meetings
create policy "Admins and treasurers can update meetings"
  on public.meetings for update
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = meetings.group_id
      and group_members.user_id = auth.uid()
      and group_members.role = any (array['admin', 'treasurer'])
    )
  );

-- Only admins and treasurers can delete meetings
create policy "Admins can delete meetings"
  on public.meetings for delete
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = meetings.group_id
      and group_members.user_id = auth.uid()
      and group_members.role = any (array['admin', 'treasurer'])
    )
  );
```