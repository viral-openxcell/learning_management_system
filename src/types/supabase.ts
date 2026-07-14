/**
 * Hand-written stub matching supabase/sql/*.sql.
 * Replace with `supabase gen types typescript --project-id <id> > src/types/supabase.ts`
 * once a live project exists.
 */

export type UserRole = 'super_admin' | 'admin' | 'instructor' | 'student'
export type CourseLevelEnum = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatusEnum = 'draft' | 'published' | 'archived'
export type EnrollmentStatusEnum = 'pending' | 'active' | 'completed' | 'cancelled'
export type LessonTypeEnum = 'video' | 'pdf' | 'text' | 'live'
export type QuizStatusEnum = 'draft' | 'published'
export type SubmissionStatusEnum = 'pending' | 'submitted' | 'graded' | 'late'
export type LiveClassStatusEnum = 'upcoming' | 'live' | 'ended' | 'cancelled'
export type AttendanceStatusEnum = 'present' | 'absent' | 'late'
export type BatchStatusEnum = 'upcoming' | 'active' | 'completed'
export type NotificationTypeEnum = 'info' | 'success' | 'assignment' | 'enrollment' | 'certificate'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          phone: string | null
          bio: string | null
          department: string | null
          location: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string
          email: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      course_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['course_categories']['Row']> & {
          name: string
          slug: string
        }
        Update: Partial<Database['public']['Tables']['course_categories']['Row']>
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          category_id: string | null
          instructor_id: string
          level: CourseLevelEnum
          status: CourseStatusEnum
          tags: string[]
          thumbnail_url: string | null
          price: number
          duration_hours: number
          language: string
          rating: number
          requirements: string[]
          learning_outcomes: string[]
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['courses']['Row']> & {
          title: string
          slug: string
          instructor_id: string
        }
        Update: Partial<Database['public']['Tables']['courses']['Row']>
      }
      enrollments: {
        Row: {
          id: string
          course_id: string
          student_id: string
          batch_id: string | null
          status: EnrollmentStatusEnum
          progress_percent: number
          completed_at: string | null
          enrolled_at: string
        }
        Insert: Partial<Database['public']['Tables']['enrollments']['Row']> & {
          course_id: string
          student_id: string
        }
        Update: Partial<Database['public']['Tables']['enrollments']['Row']>
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          type: LessonTypeEnum
          duration_minutes: number
          order_index: number
          description: string | null
          is_free_preview: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['lessons']['Row']> & {
          course_id: string
          title: string
        }
        Update: Partial<Database['public']['Tables']['lessons']['Row']>
      }
      quizzes: {
        Row: {
          id: string
          course_id: string
          title: string
          questions_count: number
          duration_minutes: number
          status: QuizStatusEnum
          description: string | null
          pass_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['quizzes']['Row']> & {
          course_id: string
          title: string
        }
        Update: Partial<Database['public']['Tables']['quizzes']['Row']>
      }
      assignments: {
        Row: {
          id: string
          course_id: string
          title: string
          due_date: string
          max_score: number
          description: string | null
          max_attempts: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['assignments']['Row']> & {
          course_id: string
          title: string
          due_date: string
        }
        Update: Partial<Database['public']['Tables']['assignments']['Row']>
      }
      submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          status: SubmissionStatusEnum
          score: number | null
          feedback: string | null
          graded_at: string | null
          submitted_at: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['submissions']['Row']> & {
          assignment_id: string
          student_id: string
        }
        Update: Partial<Database['public']['Tables']['submissions']['Row']>
      }
      batches: {
        Row: {
          id: string
          name: string
          course_id: string
          instructor_id: string
          start_date: string
          end_date: string
          capacity: number
          status: BatchStatusEnum
          schedule_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['batches']['Row']> & {
          name: string
          course_id: string
          instructor_id: string
        }
        Update: Partial<Database['public']['Tables']['batches']['Row']>
      }
      live_classes: {
        Row: {
          id: string
          course_id: string
          batch_id: string | null
          title: string
          scheduled_at: string
          duration_minutes: number
          meeting_url: string | null
          status: LiveClassStatusEnum
          description: string | null
          recording_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['live_classes']['Row']> & {
          course_id: string
          title: string
          scheduled_at: string
        }
        Update: Partial<Database['public']['Tables']['live_classes']['Row']>
      }
      certificates: {
        Row: {
          id: string
          student_id: string
          course_id: string
          issued_at: string
          certificate_code: string
          grade: string | null
          final_score: number | null
        }
        Insert: Partial<Database['public']['Tables']['certificates']['Row']> & {
          student_id: string
          course_id: string
        }
        Update: Partial<Database['public']['Tables']['certificates']['Row']>
      }
      attendance_records: {
        Row: {
          id: string
          batch_id: string
          student_id: string
          session_date: string
          status: AttendanceStatusEnum
          check_in_time: string | null
          notes: string | null
        }
        Insert: Partial<Database['public']['Tables']['attendance_records']['Row']> & {
          batch_id: string
          student_id: string
          session_date: string
        }
        Update: Partial<Database['public']['Tables']['attendance_records']['Row']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          is_read: boolean
          type: NotificationTypeEnum
          link_path: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          user_id: string
          title: string
          message: string
        }
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
    }
  }
}
