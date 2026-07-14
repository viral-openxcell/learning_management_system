import type { Role } from '@/constants/roles'
import type { Profile } from './auth.types'

export type UserRecord = Profile

export interface UserFormValues {
  full_name: string
  role: Role
}
