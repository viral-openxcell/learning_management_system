import type { Database } from '@/types/supabase'
import type { ListParams, ListResult } from '@/services/api/base.repository'
import { SEED_DATA } from './seedData'

export type TableName = keyof Database['public']['Tables']
type MockDatabase = { [K in TableName]: Database['public']['Tables'][K]['Row'][] }

const STORAGE_KEY = 'lms-mock-db-v1'

function loadDb(): MockDatabase {
  if (typeof localStorage === 'undefined') return structuredClone(SEED_DATA)
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return structuredClone(SEED_DATA)
  try {
    return JSON.parse(raw) as MockDatabase
  } catch {
    return structuredClone(SEED_DATA)
  }
}

let db = loadDb()

function persist() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- rows are dynamically shaped per table, see base.repository.ts's comment for why
function rowsOf(name: TableName): any[] {
  return db[name]
}

function matchesSearch(row: Record<string, unknown>, columns: string[], search: string) {
  const needle = search.toLowerCase()
  return columns.some((col) =>
    String(row[col] ?? '')
      .toLowerCase()
      .includes(needle),
  )
}

function matchesFilters(row: Record<string, unknown>, filters: ListParams['filters']) {
  if (!filters) return true
  return Object.entries(filters).every(([key, value]) => {
    if (value === undefined || value === null || value === '') return true
    return row[key] === value
  })
}

export const mockDb = {
  list<T>(name: TableName, params: ListParams = {}): ListResult<T> {
    const { page = 1, pageSize = 10, search, searchColumns, filters, orderBy } = params
    let rows = [...rowsOf(name)]

    if (search && searchColumns?.length) {
      rows = rows.filter((row) => matchesSearch(row, searchColumns, search))
    }
    rows = rows.filter((row) => matchesFilters(row, filters))

    if (orderBy) {
      const { column, ascending = true } = orderBy
      rows.sort((a, b) => {
        if (a[column] === b[column]) return 0
        const result = a[column] > b[column] ? 1 : -1
        return ascending ? result : -result
      })
    }

    const count = rows.length
    const start = (page - 1) * pageSize
    const paged = rows.slice(start, start + pageSize)

    return {
      data: paged as T[],
      count,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(count / pageSize)),
    }
  },

  getById<T>(name: TableName, id: string): T {
    const row = rowsOf(name).find((r) => r.id === id)
    if (!row) throw new Error(`Mock record not found in "${name}" for id "${id}"`)
    return row as T
  },

  insert<T>(name: TableName, payload: Record<string, unknown>): T {
    const now = new Date().toISOString()
    const row = { id: crypto.randomUUID(), created_at: now, updated_at: now, ...payload }
    rowsOf(name).push(row)
    persist()
    return row as T
  },

  update<T>(name: TableName, id: string, payload: Record<string, unknown>): T {
    const rows = rowsOf(name)
    const index = rows.findIndex((r) => r.id === id)
    if (index === -1) throw new Error(`Mock record not found in "${name}" for id "${id}"`)
    const updated = { ...rows[index], ...payload, updated_at: new Date().toISOString() }
    rows[index] = updated
    persist()
    return updated as T
  },

  remove(name: TableName, id: string): void {
    const rows = rowsOf(name)
    const index = rows.findIndex((r) => r.id === id)
    if (index !== -1) rows.splice(index, 1)
    persist()
  },

  findProfileByEmail(email: string) {
    const needle = email.toLowerCase()
    return rowsOf('profiles').find((p) => String(p.email).toLowerCase() === needle) ?? null
  },

  getProfileById(id: string) {
    return rowsOf('profiles').find((p) => p.id === id) ?? null
  },

  reset() {
    db = structuredClone(SEED_DATA)
    persist()
  },
}
