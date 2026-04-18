-- Enabling RLS just in case
alter table public.payouts enable row level security;

-- Policy 1 (Users can view payouts in their groups)
create policy "Users can view payouts in their groups"
  on public.payouts for select
  using (
    group_id in (
      select group_id from public.group_members 
      where user_id = auth.uid()
    )
  );

-- Policy 2 (Treasurers can create payouts)
create policy "Treasurers can create payouts"
  on public.payouts for insert
  with check (
    exists (
      select 1 from public.group_members
      where group_id = payouts.group_id
      and user_id = auth.uid()
      and role = 'treasurer'
    )
  );

-- Policy 3 (Treasurers can update payout status)
create policy "Treasurers can update payouts"
  on public.payouts for update
  using (
    exists (
      select 1 from public.group_members
      where group_id = payouts.group_id
      and user_id = auth.uid()
      and role = 'treasurer'
    )
  );