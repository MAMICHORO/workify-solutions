begin;

revoke insert, update, delete, truncate
on table public.gallery_presentations, public.gallery_images
from anon;

revoke truncate
on table public.gallery_presentations, public.gallery_images
from authenticated;

grant select
on table public.gallery_presentations, public.gallery_images
to anon, authenticated;

grant insert, update, delete
on table public.gallery_presentations, public.gallery_images
to authenticated;

drop policy if exists "Admins manage gallery presentations"
on public.gallery_presentations;

create policy "Super admins manage gallery presentations"
on public.gallery_presentations
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

drop policy if exists "Admins manage gallery images"
on public.gallery_images;

create policy "Super admins manage gallery images"
on public.gallery_images
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

update storage.buckets
set public = false
where id = 'gallery-images';

drop policy if exists "Admins upload Workify files"
on storage.objects;

create policy "Admins upload Workify files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = any (
    array[
      'project-images',
      'cvs',
      'certificates',
      'company-documents'
    ]
  )
  and (select public.is_admin())
);

drop policy if exists "Admins update Workify files"
on storage.objects;

create policy "Admins update Workify files"
on storage.objects
for update
to authenticated
using (
  bucket_id = any (
    array[
      'project-images',
      'cvs',
      'certificates',
      'company-documents'
    ]
  )
  and (select public.is_admin())
)
with check (
  bucket_id = any (
    array[
      'project-images',
      'cvs',
      'certificates',
      'company-documents'
    ]
  )
  and (select public.is_admin())
);

drop policy if exists "Admins delete Workify files"
on storage.objects;

create policy "Admins delete Workify files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = any (
    array[
      'project-images',
      'cvs',
      'certificates',
      'company-documents'
    ]
  )
  and (select public.is_admin())
);

drop policy if exists "Public reads published gallery images"
on storage.objects;

create policy "Public reads published gallery images"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'gallery-images'
  and exists (
    select 1
    from public.gallery_images
    join public.gallery_presentations
      on gallery_presentations.id = gallery_images.gallery_id
    where gallery_images.storage_path = storage.objects.name
      and gallery_presentations.publication_status = 'published'
      and gallery_presentations.deleted_at is null
  )
);

drop policy if exists "Super admins manage gallery storage"
on storage.objects;

create policy "Super admins manage gallery storage"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'gallery-images'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'super_admin'
      and profiles.active = true
  )
)
with check (
  bucket_id = 'gallery-images'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'super_admin'
      and profiles.active = true
  )
);

commit;
