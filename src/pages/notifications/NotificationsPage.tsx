import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Button } from '@/components/ui/Button'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useAuth } from '@/hooks/useAuth'
import { formatRelative } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

const { useListQuery, useUpdateMutation } = createEntityHooks('notifications')

export function NotificationsPage() {
  const { user } = useAuth()
  const { data, isLoading } = useListQuery({
    pageSize: 100,
    filters: { user_id: user?.id },
    orderBy: { column: 'created_at', ascending: false },
  })
  const updateMutation = useUpdateMutation()

  const notifications = data?.data ?? []
  const unreadCount = notifications.filter((n) => !n.is_read).length

  async function markAsRead(id: string) {
    await updateMutation.mutateAsync({ id, payload: { is_read: true } })
  }

  async function markAllAsRead() {
    await Promise.all(
      notifications
        .filter((n) => !n.is_read)
        .map((n) => updateMutation.mutateAsync({ id: n.id, payload: { is_read: true } })),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : "You're all caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      {isLoading && <LoadingSkeleton rows={5} />}

      {!isLoading && notifications.length === 0 && (
        <EmptyState
          title="No notifications"
          description="We'll let you know when something needs your attention."
        />
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
              className={cn(
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                !notification.is_read && 'bg-brand-50/50 dark:bg-brand-500/5',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  notification.is_read
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                    : 'bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
                )}
              >
                {notification.is_read ? (
                  <BellOff className="h-3.5 w-3.5" />
                ) : (
                  <Bell className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm',
                    notification.is_read
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'font-medium text-slate-900 dark:text-slate-100',
                  )}
                >
                  {notification.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatRelative(notification.created_at)}
                </p>
              </div>
              {!notification.is_read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
