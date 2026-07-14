import { Select } from '@/components/ui/Select'
import { ROLE_LABELS, rolesAssignableBy, type Role } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

interface RoleSelectProps {
  value: Role
  onChange: (role: Role) => void
  id?: string
}

export function RoleSelect({ value, onChange, id }: RoleSelectProps) {
  const { role: currentRole } = useAuth()
  const assignable = currentRole ? rolesAssignableBy(currentRole) : []

  return (
    <Select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as Role)}
      options={assignable.map((role) => ({ label: ROLE_LABELS[role], value: role }))}
    />
  )
}
