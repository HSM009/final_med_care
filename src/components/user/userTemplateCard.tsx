import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type UserFieldCardProps } from '@/lib/types'
import { Field, FieldError, FieldGroup } from '../ui/field'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { CheckIcon, EditIcon, Loader2, XIcon } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { lazy, Suspense, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import {
  adminActions,
  adminForceEmailChangeWithExpiryFn,
} from '@/lib/admin-actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Gender, Roles } from '#/generated/prisma/enums'
import { showToast } from '#/lib/showToast'

const DateOfBirthPicker = lazy(() =>
  import('#/components/datePicker').then((mod) => ({
    default: mod.DateOfBirthPicker,
  })),
)

const ENUM_OPTIONS_MAP: Record<string, string[]> = {
  role: Object.values(Roles),
  gender: Object.values(Gender),
}

export function UserTemplateCard({
  userId,
  Title,
  currentData,
  sessionName,
  validatorHandler,
}: UserFieldCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isForwarding, setIsForwarding] = useState(false)
  const { refetch } = authClient.useSession()
  const router = useRouter()

  const defTitle = Title.replace(/[- ]/g, '')
  const mTitle = Title.replace(/-/g, ' ')
  const lowerTitle = mTitle.toLowerCase()
  const initCTitle =
    mTitle.charAt(0).toUpperCase() + mTitle.slice(1).toLowerCase()

  const form = useForm({
    defaultValues: { [defTitle]: currentData },
    validators: { onChange: validatorHandler },
    onSubmit: async ({ value }) => {
      showToast.loading('Verification email sent!', { id: 'user-flow' })
      const targetValue = value[defTitle]
      try {
        if (lowerTitle === 'email') {
          await adminForceEmailChangeWithExpiryFn({
            data: {
              userId,
              newEmail: targetValue as string,
              userName: sessionName || 'N/A',
              currentEmail: currentData as string,
            },
          })
          showToast.success('Verification email sent!', { id: 'user-flow' })
        } else {
          await adminActions({
            data: {
              fId: userId,
              Title: defTitle,
              newValue: targetValue as
                | string
                | boolean
                | number
                | Date
                | Roles
                | Gender,
            },
          })
          showToast.success(
            `${initCTitle} "${targetValue}" updated successfully.`,
            { id: 'user-flow' },
          )
        }
        await refetch()
        await router.invalidate()
        setIsEditing(false)
        setIsForwarding(true)
      } catch (error) {
        console.error(error)
        showToast.error('Something went wrong saving the user changes.', {
          id: 'user-flow',
        })
      }
    },
  })

  const renderControls = (field: any) => {
    const isSubmitting = form.state.isSubmitting
    const hasChanged = field.state.value !== currentData

    if (!isEditing) {
      return (
        <Button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isSubmitting}
          onClick={() => {
            setIsEditing(true)
            setIsForwarding(false)
          }}
          title={`Edit ${mTitle}`}
        >
          <EditIcon className="size-4" />
        </Button>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white min-w-10"
          disabled={isSubmitting || !hasChanged}
          title={`Change ${mTitle}`}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckIcon className="size-4" />
          )}
        </Button>
        <Button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={isSubmitting}
          onClick={() => {
            field.setValue(currentData)
            setIsEditing(false)
          }}
          title="Cancel Changes"
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs">{initCTitle}:</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name={defTitle}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                const isDisabled = form.state.isSubmitting || !isEditing
                const enumOptions = ENUM_OPTIONS_MAP[lowerTitle]

                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1">
                        {/* 1. DATE PICKER FIELD */}
                        {currentData instanceof Date ? (
                          <Suspense
                            fallback={
                              <div className="h-10 w-full animate-pulse bg-gray-700 rounded" />
                            }
                          >
                            <DateOfBirthPicker
                              isPending={isDisabled}
                              currentDate={field.state.value as Date}
                              onDateChange={(date) =>
                                field.handleChange(date ?? new Date())
                              }
                            />
                          </Suspense>
                        ) : /* 2. DYNAMIC ENUM SELECT FIELDS (Unifies Roles & Gender) */
                        enumOptions ? (
                          <Select
                            name={field.name}
                            value={field.state.value as string}
                            disabled={isDisabled}
                            onValueChange={(val) => {
                              field.handleChange(val as any)
                            }}
                          >
                            <SelectTrigger
                              id={field.name}
                              onBlur={field.handleBlur}
                              className="w-full cursor-pointer"
                            >
                              <SelectValue
                                placeholder={`Select ${lowerTitle}`}
                              />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {enumOptions.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : /* 3. BOOLEAN SELECT FIELD */
                        typeof currentData === 'boolean' ? (
                          <Select
                            name={field.name}
                            value={String(field.state.value ?? '')}
                            disabled={isDisabled}
                            onValueChange={(val) =>
                              field.handleChange(val === 'true')
                            }
                          >
                            <SelectTrigger
                              id={field.name}
                              onBlur={field.handleBlur}
                              className="w-full cursor-pointer"
                            >
                              <SelectValue placeholder={`Select ${mTitle}`} />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : /* 4. NUMBER SELECT FIELD */
                        typeof currentData === 'number' ? (
                          <Select
                            name={field.name}
                            value={String(field.state.value ?? '')}
                            disabled={isDisabled}
                            onValueChange={(val) =>
                              field.handleChange(Number(val))
                            }
                          >
                            <SelectTrigger
                              id={field.name}
                              onBlur={field.handleBlur}
                              className="w-full cursor-pointer"
                            >
                              <SelectValue placeholder={`Select ${mTitle}`} />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="0">0</SelectItem>
                              {currentData !== 0 && (
                                <SelectItem value={String(currentData)}>
                                  {currentData}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          /* 5. STANDARD TEXT INPUT FALLBACK */
                          <Input
                            id={field.name}
                            name={field.name}
                            value={(field.state.value as string) ?? ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder={`Enter ${mTitle} here.`}
                            autoComplete="off"
                            disabled={isDisabled}
                          />
                        )}
                      </div>

                      {renderControls(field)}
                    </div>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}

                    {isForwarding && (
                      <div className="mt-2 text-sm text-green-600 italic">
                        {initCTitle} has been updated. Please allow a moment for
                        changes to update.
                      </div>
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
