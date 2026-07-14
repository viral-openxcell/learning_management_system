alter table lessons enable row level security;
alter table quizzes enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table batches enable row level security;
alter table live_classes enable row level security;
alter table certificates enable row level security;
alter table attendance_records enable row level security;
alter table notifications enable row level security;

-- Content tables (lessons/quizzes/assignments/batches/live_classes): readable by
-- anyone authenticated (students need to see what's assigned to them), writable
-- only by staff.
create policy "lessons_select_all" on lessons for select using (auth.role() = 'authenticated');
create policy "lessons_staff_write" on lessons for all using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create policy "quizzes_select_all" on quizzes for select using (auth.role() = 'authenticated');
create policy "quizzes_staff_write" on quizzes for all using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create policy "assignments_select_all" on assignments for select using (auth.role() = 'authenticated');
create policy "assignments_staff_write" on assignments for all using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create policy "batches_select_all" on batches for select using (auth.role() = 'authenticated');
create policy "batches_staff_write" on batches for all using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create policy "live_classes_select_all" on live_classes for select using (auth.role() = 'authenticated');
create policy "live_classes_staff_write" on live_classes for all using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

-- Submissions: students manage their own; staff manage/grade all.
create policy "submissions_select_own_or_staff" on submissions
  for select using (student_id = auth.uid() or is_staff(auth.uid()));
create policy "submissions_student_insert" on submissions
  for insert with check (student_id = auth.uid());
create policy "submissions_update_own_or_staff" on submissions
  for update using (student_id = auth.uid() or is_staff(auth.uid()));

-- Certificates: students see their own; staff see/issue all.
create policy "certificates_select_own_or_staff" on certificates
  for select using (student_id = auth.uid() or is_staff(auth.uid()));
create policy "certificates_staff_write" on certificates
  for all using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

-- Attendance: students see their own records; staff manage all.
create policy "attendance_select_own_or_staff" on attendance_records
  for select using (student_id = auth.uid() or is_staff(auth.uid()));
create policy "attendance_staff_write" on attendance_records
  for all using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

-- Notifications: strictly private to the recipient.
create policy "notifications_select_own" on notifications
  for select using (user_id = auth.uid());
create policy "notifications_update_own" on notifications
  for update using (user_id = auth.uid());
create policy "notifications_insert_staff" on notifications
  for insert with check (is_staff(auth.uid()) or auth.uid() = user_id);
