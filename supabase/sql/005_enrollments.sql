create table enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  status enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index enrollments_student_id_idx on enrollments (student_id);
create index enrollments_course_id_idx on enrollments (course_id);
