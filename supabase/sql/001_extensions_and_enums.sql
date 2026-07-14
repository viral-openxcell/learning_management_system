-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('super_admin', 'admin', 'instructor', 'student');
create type course_level as enum ('beginner', 'intermediate', 'advanced');
create type course_status as enum ('draft', 'published', 'archived');
create type enrollment_status as enum ('pending', 'active', 'completed', 'cancelled');
