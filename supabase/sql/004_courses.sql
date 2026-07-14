create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid references course_categories (id) on delete set null,
  instructor_id uuid not null references profiles (id) on delete cascade,
  level course_level not null default 'beginner',
  status course_status not null default 'draft',
  tags text[] not null default '{}',
  thumbnail_url text,
  price numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_instructor_id_idx on courses (instructor_id);
create index courses_category_id_idx on courses (category_id);
create index courses_status_idx on courses (status);

create trigger courses_set_updated_at
  before update on courses
  for each row execute function set_updated_at();
