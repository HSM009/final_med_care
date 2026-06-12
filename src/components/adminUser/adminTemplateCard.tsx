import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminFieldCardProps } from '@/lib/types'
import { Field, FieldError, FieldGroup } from '../ui/field'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { CheckIcon, EditIcon, Loader2, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'
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

export function AdminTemplateCard({
  userId,
  Title,
  currentData,
  sessionName,
  validatorHandler,
}: AdminFieldCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isForwarding, setIsForwarding] = useState(false)
  const [currentInfo, setCurrentInfo] = useState(currentData || '')
  const { refetch } = authClient.useSession()
  const router = useRouter()
  var defTitle: string = ' '
  var mTitle: string = ' '
  if (Title.includes('-')) {
    defTitle = Title.replace('-', '')
    mTitle = Title.replace('-', ' ')
  } else {
    defTitle = Title
    mTitle = Title
  }

  const lowerTitle = mTitle.toLowerCase()
  const initCTitle =
    mTitle.charAt(0).toLocaleUpperCase() + mTitle.slice(1).toLowerCase()
  const form = useForm({
    defaultValues: {
      [defTitle]: currentData,
    },
    validators: {
      onChange: validatorHandler,
    },
    onSubmit: async ({ value }) => {
      if (Title.includes(' ')) {
        Title = Title.replace(' ', '')
      }
      try {
        if (lowerTitle === 'email') {
          await adminForceEmailChangeWithExpiryFn({
            data: {
              userId: userId,
              newEmail: value[defTitle] as string,
              userName: sessionName || 'N/A',
              currentEmail: currentData as string,
            },
          })
          toast.success('Verification email sent!')
          await refetch()
          await router.invalidate()
          setIsEditing(false)
          setIsForwarding(true)
          return
        } else {
          // console.log('i came with ' + value[defTitle])
          await adminActions({
            data: {
              fId: userId,
              Title: defTitle,
              newValue: value[defTitle] as string | boolean | number,
            },
          })
          await refetch()
          await router.invalidate()
          setCurrentInfo(value[defTitle])
          toast.success(
            `${initCTitle} "${value[defTitle]}" updated successfully.`,
          )
          setIsEditing(false)
          setIsForwarding(true)
        }
      } catch (error) {
        value[Title] = currentInfo
        console.log(error)
        toast.error('Something went wrong saving the user changes.')
      }
    },
  })

  return (
    <div className="">
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
              {typeof currentData === 'boolean' ? (
                <form.Field
                  name={defTitle}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    const selectValue =
                      field.state.value !== undefined
                        ? String(field.state.value)
                        : ''
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1">
                            <Select
                              name={field.name}
                              value={selectValue}
                              disabled={form.state.isSubmitting || !isEditing}
                              onValueChange={(val) => {
                                field.handleChange(val == 'true')
                              }}
                            >
                              <SelectTrigger
                                id={field.name}
                                onBlur={field.handleBlur}
                                aria-invalid={isInvalid}
                                className="w-full cursor-pointer"
                              >
                                <SelectValue placeholder={'Select ' + mTitle} />
                              </SelectTrigger>

                              <SelectContent position="popper">
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {!isEditing ? (
                            <Button
                              type="button"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              disabled={form.state.isSubmitting}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsEditing(true)
                                setIsForwarding(false)
                              }}
                              title={`Edit ${Title}`}
                            >
                              <EditIcon className="size-4" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white min-w-10"
                                disabled={
                                  form.state.isSubmitting ||
                                  field.state.value === currentInfo
                                }
                                title={`Change ${Title}`}
                              >
                                {form.state.isSubmitting ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <CheckIcon className="size-4" />
                                )}
                              </Button>

                              <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={form.state.isSubmitting}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  const booleanValue =
                                    String(currentInfo) === 'true'
                                  field.setValue(booleanValue)
                                  setIsEditing(false)
                                }}
                                title="Cancel Changes"
                              >
                                <XIcon className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        {isForwarding && (
                          <div className="mt-2 text-sm text-green-600 italic">
                            {initCTitle} has been updated. Please allow a moment
                            for the changes to reflect across the application.
                          </div>
                        )}
                      </Field>
                    )
                  }}
                />
              ) : typeof currentData === 'number' ? (
                <form.Field
                  name={defTitle}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    const selectValue =
                      field.state.value !== undefined
                        ? String(field.state.value)
                        : ''
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1">
                            <Select
                              name={field.name}
                              value={selectValue}
                              disabled={form.state.isSubmitting || !isEditing}
                              onValueChange={(val) => {
                                field.handleChange(Number(val))
                              }}
                            >
                              <SelectTrigger
                                id={field.name}
                                onBlur={field.handleBlur}
                                aria-invalid={isInvalid}
                                className="w-full cursor-pointer"
                              >
                                <SelectValue placeholder={'Select ' + mTitle} />
                              </SelectTrigger>

                              <SelectContent position="popper">
                                <SelectItem value="0">0</SelectItem>
                                {currentData !== 0 &&
                                  String(currentData) !== '0' && (
                                    <SelectItem value={String(currentData)}>
                                      {currentData}
                                    </SelectItem>
                                  )}
                              </SelectContent>
                            </Select>
                          </div>
                          {!isEditing ? (
                            <Button
                              type="button"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              disabled={form.state.isSubmitting}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsEditing(true)
                                setIsForwarding(false)
                              }}
                              title={`Edit ${Title}`}
                            >
                              <EditIcon className="size-4" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white min-w-10"
                                disabled={
                                  form.state.isSubmitting ||
                                  field.state.value === currentInfo
                                }
                                title={`Change ${Title}`}
                              >
                                {form.state.isSubmitting ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <CheckIcon className="size-4" />
                                )}
                              </Button>

                              <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={form.state.isSubmitting}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  field.setValue(Number(currentData))
                                  setIsEditing(false)
                                }}
                                title="Cancel Changes"
                              >
                                <XIcon className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        {isForwarding && (
                          <div className="mt-2 text-sm text-green-600 italic">
                            {initCTitle} has been updated. Please allow a moment
                            for the changes to reflect across the application.
                          </div>
                        )}
                      </Field>
                    )
                  }}
                />
              ) : lowerTitle === 'role' ? (
                <form.Field
                  name={defTitle}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1">
                            <Select
                              name={field.name}
                              value={field.state.value as string}
                              disabled={form.state.isSubmitting || !isEditing}
                              onValueChange={(val) => {
                                field.handleChange(val)
                              }}
                            >
                              <SelectTrigger
                                id={field.name}
                                onBlur={field.handleBlur}
                                aria-invalid={isInvalid}
                                className="w-full cursor-pointer"
                              >
                                <SelectValue placeholder="Select True/False" />
                              </SelectTrigger>

                              <SelectContent position="popper">
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {!isEditing ? (
                            <Button
                              type="button"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              disabled={form.state.isSubmitting}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsEditing(true)
                                setIsForwarding(false)
                              }}
                              title={`Edit ${Title}`}
                            >
                              <EditIcon className="size-4" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white min-w-10"
                                disabled={
                                  form.state.isSubmitting ||
                                  field.state.value === currentInfo
                                }
                                title={`Change ${Title}`}
                              >
                                {form.state.isSubmitting ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <CheckIcon className="size-4" />
                                )}
                              </Button>

                              <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={form.state.isSubmitting}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  field.setValue(currentInfo)
                                  setIsEditing(false)
                                }}
                                title="Cancel Changes"
                              >
                                <XIcon className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        {isForwarding && (
                          <div className="mt-2 text-sm text-green-600 italic">
                            {initCTitle} has been updated. Please allow a moment
                            for the changes to reflect across the application.
                          </div>
                        )}
                      </Field>
                    )
                  }}
                />
              ) : (
                <form.Field
                  name={defTitle}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center gap-2">
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value as string}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder={`Enter ${field} here.`}
                            autoComplete="off"
                            type="text"
                            disabled={form.state.isSubmitting || !isEditing}
                          />
                          {!isEditing ? (
                            <Button
                              type="button"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              disabled={form.state.isSubmitting}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsEditing(true)
                                setIsForwarding(false)
                              }}
                              title={`Edit ${Title}`}
                            >
                              <EditIcon className="size-4" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white min-w-10"
                                disabled={
                                  form.state.isSubmitting ||
                                  field.state.value === currentInfo
                                }
                                title={`Change ${Title}`}
                              >
                                {form.state.isSubmitting ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <CheckIcon className="size-4" />
                                )}
                              </Button>

                              <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={form.state.isSubmitting}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  field.setValue(currentInfo)
                                  setIsEditing(false)
                                }}
                                title="Cancel Changes"
                              >
                                <XIcon className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        {isForwarding && (
                          <div className="mt-2 text-sm text-green-600 italic">
                            {initCTitle} updated. Please allow a moment for the
                            changes to reflect across the application.
                          </div>
                        )}
                      </Field>
                    )
                  }}
                />
              )}
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
