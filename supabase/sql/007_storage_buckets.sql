insert into storage.buckets (id, name, public)
values ('course-thumbnails', 'course-thumbnails', true),
       ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "course_thumbnails_public_read" on storage.objects
  for select using (bucket_id = 'course-thumbnails');

create policy "course_thumbnails_staff_write" on storage.objects
  for insert with check (bucket_id = 'course-thumbnails' and is_staff(auth.uid()));

create policy "course_thumbnails_staff_update" on storage.objects
  for update using (bucket_id = 'course-thumbnails' and is_staff(auth.uid()));

create policy "course_thumbnails_staff_delete" on storage.objects
  for delete using (bucket_id = 'course-thumbnails' and is_staff(auth.uid()));

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and owner = auth.uid());

create policy "avatars_owner_update" on storage.objects
  for update using (bucket_id = 'avatars' and owner = auth.uid());

create policy "avatars_owner_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and owner = auth.uid());
