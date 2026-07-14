import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { TagInput } from '@/components/forms/TagInput'
import { ListInput } from '@/components/forms/ListInput'
import { ImageUpload } from '@/components/forms/ImageUpload'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { coursesService } from '@/services/api/courses.service'
import {
  COURSE_LEVEL_LABELS,
  COURSE_LEVELS,
  COURSE_STATUSES,
  COURSE_STATUS_LABELS,
} from '@/constants/courseLevels'
import { slugify } from '@/utils/slugify'
import { toast } from '@/utils/toast'
import { courseSchema, type CourseFormValues } from '../course.schema'

interface CourseFormProps {
  defaultValues?: Partial<CourseFormValues>
  thumbnailUrl?: string | null
  onSubmit: (values: CourseFormValues, thumbnailUrl: string | null) => Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
}

export function CourseForm({
  defaultValues,
  thumbnailUrl: initialThumbnailUrl,
  onSubmit,
  isSubmitting,
  submitLabel = 'Save course',
}: CourseFormProps) {
  const { data: categories } = useCategoriesQuery()
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const thumbnailUrl = initialThumbnailUrl ?? null
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      category_id: '',
      level: 'beginner',
      status: 'draft',
      tags: [],
      price: 0,
      duration_hours: 0,
      language: 'English',
      requirements: [],
      learning_outcomes: [],
      ...defaultValues,
    },
  })

  const title = watch('title')

  async function handleFormSubmit(values: CourseFormValues) {
    let finalThumbnailUrl = thumbnailUrl

    if (thumbnailFile) {
      setIsUploadingThumbnail(true)
      try {
        finalThumbnailUrl = await coursesService.uploadThumbnail(thumbnailFile)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to upload thumbnail')
        setIsUploadingThumbnail(false)
        return
      }
      setIsUploadingThumbnail(false)
    }

    await onSubmit(values, finalThumbnailUrl)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <FormField label="Thumbnail" hint="Recommended size 1280x720px">
        <ImageUpload
          value={thumbnailUrl}
          onFileSelect={setThumbnailFile}
          isUploading={isUploadingThumbnail}
        />
      </FormField>

      <FormField label="Title" htmlFor="title" error={errors.title?.message} required>
        <Input
          id="title"
          {...register('title', {
            onChange: (event) => {
              const currentSlug = watch('slug')
              if (!currentSlug || currentSlug === slugify(title ?? '')) {
                setValue('slug', slugify(event.target.value))
              }
            },
          })}
        />
      </FormField>

      <FormField
        label="Slug"
        htmlFor="slug"
        error={errors.slug?.message}
        hint="Used in the course URL"
        required
      >
        <Input id="slug" {...register('slug')} />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" rows={4} {...register('description')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Category"
          htmlFor="category_id"
          error={errors.category_id?.message}
          required
        >
          <Select
            id="category_id"
            placeholder="Select a category"
            options={(categories?.data ?? []).map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            {...register('category_id')}
          />
        </FormField>

        <FormField label="Level" htmlFor="level" error={errors.level?.message} required>
          <Select
            id="level"
            options={COURSE_LEVELS.map((level) => ({
              label: COURSE_LEVEL_LABELS[level],
              value: level,
            }))}
            {...register('level')}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
          <Select
            id="status"
            options={COURSE_STATUSES.map((status) => ({
              label: COURSE_STATUS_LABELS[status],
              value: status,
            }))}
            {...register('status')}
          />
        </FormField>

        <FormField label="Price (USD)" htmlFor="price" error={errors.price?.message} required>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Duration (hours)"
          htmlFor="duration_hours"
          error={errors.duration_hours?.message}
          required
        >
          <Input
            id="duration_hours"
            type="number"
            step="0.5"
            min="0"
            {...register('duration_hours', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Language" htmlFor="language" error={errors.language?.message} required>
          <Input id="language" {...register('language')} />
        </FormField>
      </div>

      <FormField label="Tags" error={errors.tags?.message}>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
        />
      </FormField>

      <FormField
        label="Requirements"
        error={errors.requirements?.message}
        hint="What students should know before starting"
      >
        <Controller
          control={control}
          name="requirements"
          render={({ field }) => (
            <ListInput
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. Basic HTML & CSS knowledge"
            />
          )}
        />
      </FormField>

      <FormField
        label="Learning outcomes"
        error={errors.learning_outcomes?.message}
        hint="What students will be able to do after finishing"
      >
        <Controller
          control={control}
          name="learning_outcomes"
          render={({ field }) => (
            <ListInput
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. Build components with JSX and props"
            />
          )}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting || isUploadingThumbnail}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
