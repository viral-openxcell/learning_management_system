# Supabase SQL

Run these files in order against your Supabase project's SQL editor (or `supabase db push` if you set up the CLI). Nothing here has been executed yet — this project currently has no live Supabase backend, only `.env.example` placeholders.

1. `001_extensions_and_enums.sql`
2. `002_profiles.sql`
3. `003_course_categories.sql`
4. `004_courses.sql`
5. `005_enrollments.sql`
6. `006_rls_policies.sql`
7. `007_storage_buckets.sql`
8. `008_lms_core_modules.sql` — lessons, quizzes, assignments, submissions, batches, live_classes, certificates, attendance_records, notifications
9. `009_rls_core_modules.sql`

After running these against a real project:

1. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from your project settings.
2. Regenerate typed models to replace the hand-written stub:
   ```bash
   supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
   ```
3. Seed at least one `course_categories` row and promote your own profile to `admin` (or `super_admin`) directly in the table editor — new signups default to `student`.
