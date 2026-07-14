-- Additional enums for the core teaching/learning modules.
create type lesson_type as enum ('video', 'pdf', 'text', 'live');
create type quiz_status as enum ('draft', 'published');
create type submission_status as enum ('pending', 'submitted', 'graded', 'late');
create type live_class_status as enum ('upcoming', 'live', 'ended', 'cancelled');
create type attendance_status as enum ('present', 'absent', 'late');

create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  title text not null,
  type lesson_type not null default 'video',
  duration_minutes integer not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lessons_course_id_idx on lessons (course_id);
create trigger lessons_set_updated_at before update on lessons for each row execute function set_updated_at();

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  title text not null,
  questions_count integer not null default 0,
  duration_minutes integer not null default 0,
  status quiz_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quizzes_course_id_idx on quizzes (course_id);
create trigger quizzes_set_updated_at before update on quizzes for each row execute function set_updated_at();

create table assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  title text not null,
  due_date timestamptz not null,
  max_score integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index assignments_course_id_idx on assignments (course_id);
create trigger assignments_set_updated_at before update on assignments for each row execute function set_updated_at();

create table submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  status submission_status not null default 'pending',
  score integer,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);
create index submissions_assignment_id_idx on submissions (assignment_id);
create index submissions_student_id_idx on submissions (student_id);

create table batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid not null references courses (id) on delete cascade,
  instructor_id uuid not null references profiles (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  capacity integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index batches_course_id_idx on batches (course_id);
create index batches_instructor_id_idx on batches (instructor_id);
create trigger batches_set_updated_at before update on batches for each row execute function set_updated_at();

create table live_classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  batch_id uuid references batches (id) on delete set null,
  title text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  meeting_url text,
  status live_class_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index live_classes_course_id_idx on live_classes (course_id);
create index live_classes_batch_id_idx on live_classes (batch_id);
create trigger live_classes_set_updated_at before update on live_classes for each row execute function set_updated_at();

create table certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  issued_at timestamptz not null default now(),
  certificate_code text not null unique,
  unique (student_id, course_id)
);
create index certificates_student_id_idx on certificates (student_id);

create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references batches (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  session_date date not null,
  status attendance_status not null default 'present',
  unique (batch_id, student_id, session_date)
);
create index attendance_records_batch_id_idx on attendance_records (batch_id);
create index attendance_records_student_id_idx on attendance_records (student_id);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_id_idx on notifications (user_id);
