import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Moon, Sun } from 'lucide-react'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ImageUpload } from '@/components/forms/ImageUpload'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { ROLE_LABELS } from '@/constants/roles'
import { profileService } from '@/services/api/profile.service'
import { toast } from '@/utils/toast'

const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const { useUpdateMutation } = createEntityHooks('profiles')

export function SettingsPage() {
  const { profile, role } = useAuth()
  const setStoreProfile = useAuthStore((s) => s.setProfile)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const updateProfile = useUpdateMutation()

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  })

  async function onSubmit(values: ProfileFormValues) {
    if (!profile) return
    let avatarUrl = profile.avatar_url

    if (avatarFile) {
      setIsUploadingAvatar(true)
      try {
        avatarUrl = await profileService.uploadAvatar(avatarFile)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to upload avatar')
        setIsUploadingAvatar(false)
        return
      }
      setIsUploadingAvatar(false)
    }

    try {
      const updated = await updateProfile.mutateAsync({
        id: profile.id,
        payload: { full_name: values.full_name, avatar_url: avatarUrl },
      })
      setStoreProfile(updated)
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your profile and preferences.
        </p>
      </div>

      <div className="panel space-y-4 p-5">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Avatar">
            <ImageUpload
              value={profile?.avatar_url}
              onFileSelect={setAvatarFile}
              isUploading={isUploadingAvatar}
            />
          </FormField>

          <FormField
            label="Full name"
            htmlFor="full_name"
            error={errors.full_name?.message}
            required
          >
            <Input id="full_name" {...register('full_name')} />
          </FormField>

          <FormField label="Email">
            <Input value={profile?.email ?? ''} disabled />
          </FormField>

          <FormField label="Role">
            <div>{role && <Badge variant="info">{ROLE_LABELS[role]}</Badge>}</div>
          </FormField>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={updateProfile.isPending || isUploadingAvatar}>
              Save changes
            </Button>
          </div>
        </form>
      </div>

      <div className="panel space-y-4 p-5">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Appearance</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Theme</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch between light and dark mode.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
        </div>
      </div>
    </div>
  )
}
