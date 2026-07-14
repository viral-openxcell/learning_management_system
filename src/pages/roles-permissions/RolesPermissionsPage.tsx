import { Check, RotateCcw, X } from 'lucide-react'
import { NAV_GROUPS } from '@/constants/navConfig'
import { ROLES, ROLE_LABELS, type Role } from '@/constants/roles'
import { Switch } from '@/components/ui/Switch'
import { useAuth } from '@/hooks/useAuth'
import { usePermissionsStore, getEffectiveRoles } from '@/store/permissions.store'
import { toast } from '@/utils/toast'

export function RolesPermissionsPage() {
  const { role: currentRole } = useAuth()
  const isSuperAdmin = currentRole === 'super_admin'
  const overrides = usePermissionsStore((s) => s.overrides)
  const setModuleRoles = usePermissionsStore((s) => s.setModuleRoles)
  const resetModule = usePermissionsStore((s) => s.resetModule)

  function handleToggle(path: string, defaultRoles: Role[], role: Role, nextChecked: boolean) {
    const current = getEffectiveRoles(overrides, path, defaultRoles)
    const nextRoles = nextChecked ? [...current, role] : current.filter((r) => r !== role)
    setModuleRoles(path, nextRoles)
    toast.success(
      `${ROLE_LABELS[role]} ${nextChecked ? 'can now access' : 'can no longer access'} this module`,
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Which role can access each module. This mirrors the live route guards — it isn't just
          documentation, it's what's actually enforced.
        </p>
        {!isSuperAdmin && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Only Super Admins can change these settings — you're viewing in read-only mode.
          </p>
        )}
      </div>

      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-56" />
                {ROLES.map((role) => (
                  <col key={role} className="w-28" />
                ))}
                {isSuperAdmin && <col className="w-10" />}
              </colgroup>
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="truncate px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                    {group.label}
                  </th>
                  {ROLES.map((role) => (
                    <th
                      key={role}
                      className="px-2 py-3 text-center font-medium text-slate-500 dark:text-slate-400"
                    >
                      {ROLE_LABELS[role]}
                    </th>
                  ))}
                  {isSuperAdmin && <th />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.items.map((item) => {
                  const effectiveRoles = getEffectiveRoles(overrides, item.path, item.allowedRoles)
                  const hasOverride = Boolean(overrides[item.path])
                  return (
                    <tr key={item.path}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate">{item.label}</span>
                        </div>
                      </td>
                      {ROLES.map((role) => {
                        const allowed = effectiveRoles.includes(role)
                        const isSuperAdminColumn = role === 'super_admin'
                        if (isSuperAdmin) {
                          return (
                            <td key={role} className="px-2 py-3">
                              <div className="flex justify-center">
                                <Switch
                                  checked={allowed}
                                  disabled={isSuperAdminColumn}
                                  onChange={(checked) =>
                                    handleToggle(item.path, item.allowedRoles, role, checked)
                                  }
                                  aria-label={`Toggle ${ROLE_LABELS[role]} access to ${item.label}`}
                                />
                              </div>
                            </td>
                          )
                        }
                        return (
                          <td key={role} className="px-2 py-3">
                            <div className="flex justify-center">
                              {allowed ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <X className="h-4 w-4 text-slate-300 dark:text-slate-700" />
                              )}
                            </div>
                          </td>
                        )
                      })}
                      {isSuperAdmin && (
                        <td className="px-1">
                          <div className="flex justify-center">
                            {hasOverride && (
                              <button
                                onClick={() => {
                                  resetModule(item.path)
                                  toast.success(`${item.label} reset to default permissions`)
                                }}
                                title="Reset to default"
                                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
