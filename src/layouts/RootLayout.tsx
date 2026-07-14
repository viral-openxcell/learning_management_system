import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useUiStore } from '@/store/ui.store'

export function RootLayout() {
  const theme = useUiStore((s) => s.theme)

  return (
    <ErrorBoundary>
      <Outlet />
      <Toaster richColors position="top-right" theme={theme} />
    </ErrorBoundary>
  )
}
