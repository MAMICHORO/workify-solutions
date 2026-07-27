begin;

revoke insert, update, delete, truncate
on table public.projects
from anon;

revoke truncate
on table public.projects
from authenticated;

grant select
on table public.projects
to anon, authenticated;

grant insert, update, delete
on table public.projects
to authenticated;

drop policy if exists "Admins manage projects"
on public.projects;

create policy "Admins manage projects"
on public.projects
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'super_admin'
      and profiles.active = true
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'super_admin'
      and profiles.active = true
  )
);

commit;
