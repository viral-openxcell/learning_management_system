import { createRepository, type ListParams } from './base.repository'
import { USE_MOCK_DATA } from '@/lib/mockConfig'
import type { Role } from '@/constants/roles'

const profilesRepository = createRepository('profiles')

export interface UserListFilters {
  role?: Role
}

export interface CreateUserPayload {
  full_name: string
  email: string
  role: Role
  phone?: string
  bio?: string
  department?: string
  location?: string
  is_active?: boolean
}

export const usersService = {
  list(params: ListParams & { filters?: UserListFilters } = {}) {
    return profilesRepository.list({
      ...params,
      searchColumns: params.search ? ['full_name', 'email'] : undefined,
      orderBy: params.orderBy ?? { column: 'created_at', ascending: false },
    })
  },
  getById: profilesRepository.getById,
  update: profilesRepository.update,
  remove: profilesRepository.remove,

  /**
   * Real account creation requires Supabase's Admin API (service_role key),
   * which must never ship in a client bundle — that path still needs a
   * Supabase Edge Function. In mock mode there's no such constraint, so we
   * let the demo create profiles directly against the mock repository.
   */
  async create(payload: CreateUserPayload) {
    if (!USE_MOCK_DATA) {
      throw new Error(
        'User creation must go through a server-side Edge Function using the service_role key.',
      )
    }
    return profilesRepository.create({
      id: crypto.randomUUID(),
      email: payload.email,
      full_name: payload.full_name,
      role: payload.role,
      avatar_url: null,
      phone: payload.phone ?? null,
      bio: payload.bio ?? null,
      department: payload.department ?? null,
      location: payload.location ?? null,
      is_active: payload.is_active ?? true,
    })
  },
}
