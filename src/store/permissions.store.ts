import { create } from 'zustand'
import type { Role } from '@/constants/roles'

const STORAGE_KEY = 'lms-permission-overrides'

function loadOverrides(): Record<string, Role[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Role[]>) : {}
  } catch {
    return {}
  }
}

function persist(overrides: Record<string, Role[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

interface PermissionsState {
  overrides: Record<string, Role[]>
  setModuleRoles: (path: string, roles: Role[]) => void
  resetModule: (path: string) => void
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  overrides: loadOverrides(),
  setModuleRoles: (path, roles) => {
    const next = { ...get().overrides, [path]: roles }
    persist(next)
    set({ overrides: next })
  },
  resetModule: (path) => {
    const next = { ...get().overrides }
    delete next[path]
    persist(next)
    set({ overrides: next })
  },
}))

export function getEffectiveRoles(
  overrides: Record<string, Role[]>,
  path: string,
  defaultRoles: Role[],
): Role[] {
  return overrides[path] ?? defaultRoles
}
