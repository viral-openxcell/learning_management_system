import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { PromoBanner } from '@/components/layout/PromoBanner'

function PageLoader() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
    </div>
  )
}

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-app-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-4 pt-4 sm:px-6">
          <Topbar />
        </div>
        <main className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 sm:px-6">
          <PromoBanner />
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
