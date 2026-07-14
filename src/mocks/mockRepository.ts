import type { Database } from '@/types/supabase'
import type { ListParams, ListResult } from '@/services/api/base.repository'
import { mockDb, type TableName } from './mockDb'

export function createMockRepository<T extends TableName>(table: T) {
  type Row = Database['public']['Tables'][T]['Row']
  type Insert = Database['public']['Tables'][T]['Insert']
  type Update = Database['public']['Tables'][T]['Update']

  return {
    list(params: ListParams = {}): Promise<ListResult<Row>> {
      return Promise.resolve(mockDb.list<Row>(table, params))
    },

    getById(id: string): Promise<Row> {
      return Promise.resolve(mockDb.getById<Row>(table, id))
    },

    create(payload: Insert): Promise<Row> {
      return Promise.resolve(mockDb.insert<Row>(table, payload as Record<string, unknown>))
    },

    update(id: string, payload: Update): Promise<Row> {
      return Promise.resolve(mockDb.update<Row>(table, id, payload as Record<string, unknown>))
    },

    remove(id: string): Promise<void> {
      mockDb.remove(table, id)
      return Promise.resolve()
    },
  }
}
