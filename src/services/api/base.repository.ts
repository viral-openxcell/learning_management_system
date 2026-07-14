import { supabase } from '@/services/supabase/client'
import { USE_MOCK_DATA } from '@/lib/mockConfig'
import { createMockRepository } from '@/mocks/mockRepository'
import type { Database } from '@/types/supabase'

type TableName = keyof Database['public']['Tables']

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  searchColumns?: string[]
  filters?: Record<string, string | number | boolean | null | undefined>
  orderBy?: { column: string; ascending?: boolean }
}

export interface ListResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  pageCount: number
}

export function createRepository<T extends TableName>(table: T) {
  if (USE_MOCK_DATA) return createMockRepository(table)
  return createSupabaseRepository(table)
}

/**
 * supabase-js's query builder generics can't resolve a table name passed as
 * a type parameter (T extends TableName) back to a literal — every method
 * collapses to `never`. We keep the *public* API of this factory strongly
 * typed via Row/Insert/Update, and only drop to `any` for the internal
 * query-building calls themselves.
 */
function createSupabaseRepository<T extends TableName>(table: T) {
  type Row = Database['public']['Tables'][T]['Row']
  type Insert = Database['public']['Tables'][T]['Insert']
  type Update = Database['public']['Tables'][T]['Update']

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see comment above
  const from = () => (supabase.from as (table: string) => any)(table)

  return {
    async list(params: ListParams = {}): Promise<ListResult<Row>> {
      const { page = 1, pageSize = 10, search, searchColumns, filters, orderBy } = params
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      let query = from().select('*', { count: 'exact' })

      if (search && searchColumns?.length) {
        const orFilter = searchColumns.map((col) => `${col}.ilike.%${search}%`).join(',')
        query = query.or(orFilter)
      }

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value)
          }
        }
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
      }

      const { data, error, count } = await query.range(start, end)
      if (error) throw error

      return {
        data: (data ?? []) as Row[],
        count: count ?? 0,
        page,
        pageSize,
        pageCount: Math.ceil((count ?? 0) / pageSize),
      }
    },

    async getById(id: string): Promise<Row> {
      const { data, error } = await from().select('*').eq('id', id).single()
      if (error) throw error
      return data as Row
    },

    async create(payload: Insert): Promise<Row> {
      const { data, error } = await from().insert(payload).select().single()
      if (error) throw error
      return data as Row
    },

    async update(id: string, payload: Update): Promise<Row> {
      const { data, error } = await from().update(payload).eq('id', id).select().single()
      if (error) throw error
      return data as Row
    },

    async remove(id: string): Promise<void> {
      const { error } = await from().delete().eq('id', id)
      if (error) throw error
    },
  }
}
