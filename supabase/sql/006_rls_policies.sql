-- Security-definer helpers so policies can check the caller's role without
-- recursively re-triggering RLS on the profiles table.
create or replace function is_staff(uid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = uid and role in ('super_admin', 'admin', 'instructor')
  );
$$;

create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = uid and role in ('super_admin', 'admin')
  );
$$;

alter table profiles enable row level security;
alter table course_categories enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;

-- profiles: everyone can read their own row; admins can read/update everyone.
create policy "profiles_select_own" on profiles
  for select using (id = auth.uid() or is_admin(auth.uid()));

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid() or is_admin(auth.uid()));

create policy "profiles_admin_delete" on profiles
  for delete using (is_admin(auth.uid()));

-- course_categories: any authenticated user can read; only admins manage them.
create policy "categories_select_authenticated" on course_categories
  for select using (auth.role() = 'authenticated');

create policy "categories_admin_write" on course_categories
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- courses: published courses are visible to everyone; staff manage their own,
-- admins manage all.
create policy "courses_select_published_or_own" on courses
  for select using (
    status = 'published' or instructor_id = auth.uid() or is_admin(auth.uid())
  );

create policy "courses_instructor_insert" on courses
  for insert with check (instructor_id = auth.uid() and is_staff(auth.uid()));

create policy "courses_instructor_update" on courses
  for update using (instructor_id = auth.uid() or is_admin(auth.uid()));

create policy "courses_instructor_delete" on courses
  for delete using (instructor_id = auth.uid() or is_admin(auth.uid()));

-- enrollments: students manage their own enrollment; staff can view/manage
-- enrollments for courses they teach; admins manage all.
create policy "enrollments_select_own_or_staff" on enrollments
  for select using (
    student_id = auth.uid()
    or is_admin(auth.uid())
    or exists (select 1 from courses c where c.id = course_id and c.instructor_id = auth.uid())
  );

create policy "enrollments_student_insert" on enrollments
  for insert with check (student_id = auth.uid());

create policy "enrollments_manage" on enrollments
  for update using (
    student_id = auth.uid()
    or is_admin(auth.uid())
    or exists (select 1 from courses c where c.id = course_id and c.instructor_id = auth.uid())
  );

create policy "enrollments_delete" on enrollments
  for delete using (student_id = auth.uid() or is_admin(auth.uid()));
