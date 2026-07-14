import { create } from 'zustand'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('lms-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem('lms-theme', theme)
}

interface UiState {
  theme: Theme
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  promoBannerDismissed: boolean
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  dismissPromoBanner: () => void
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useUiStore = create<UiState>((set, get) => ({
  theme: initialTheme,
  sidebarOpen: false,
  sidebarCollapsed: false,
  promoBannerDismissed: localStorage.getItem('lms-promo-dismissed') === 'true',
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  dismissPromoBanner: () => {
    localStorage.setItem('lms-promo-dismissed', 'true')
    set({ promoBannerDismissed: true })
  },
}))
