import { USE_MOCK_DATA } from '@/lib/mockConfig'
import { mockAuthService } from '@/mocks/mockAuthService'
import { supabaseAuthService } from './supabaseAuth.service'

export const authService = USE_MOCK_DATA ? mockAuthService : supabaseAuthService
