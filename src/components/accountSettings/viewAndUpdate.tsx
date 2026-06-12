import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { CheckIcon, EditIcon, Loader2, XIcon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export function ViewAndUpdateAccountSetting({
  fId,
  Title,
  data,
  validatorHandler,
}: {
  fId: string
  Title: string
  data: string
  validatorHandler: any
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isForwarding, setIsForwarding] = useState(false)
  const [currentInfo, setCurrentInfo] = useState(data || '')
  const [isSubmitting, startTransition] = useTransition()
  const { refetch } = authClient.useSession()
  const router = useRouter()
  const form = useForm({
    defaultValues: {
      [fId]: data,
    },
    validators: {
      onChange: validatorHandler,
    },
    onSubmit: async ({ value }) => {
      if (value[fId] === currentInfo) {
        toast.warning(`Please enter a new ${fId} to proceed.`)
        return
      }

      startTransition(async () => {
        try {
          if (fId === 'email') {
            await authClient.changeEmail({
              newEmail: value[fId],
            })
            toast.success(
              'Verification email sent! Please check your new inbox to confirm the change.',
            )
            await refetch()
            await router.invalidate()
            setIsEditing(false)
            setIsForwarding(true)
            return // Stop execution here since the DB hasn't changed yet
          }

          await authClient.updateUser({ [fId]: value[fId] })
          await refetch()
          await router.invalidate()
          setCurrentInfo(value[fId])
          toast.success(`${fId} ${value[fId]} updated successfully.`)
          setIsEditing(false)
          setIsForwarding(true)
        } catch (error) {
          value[fId] = currentInfo
          toast.error('Something went wrong saving the user changes.')
        }
      })
    },
  })
  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">{Title}:</CardTitle>
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
                name={fId}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      {/* <FieldLabel htmlFor={field.name}>{Title}</FieldLabel> */}
                      <div className="flex items-center gap-2">
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="John Doe"
                          autoComplete="off"
                          type="text"
                          disabled={isSubmitting || !isEditing}
                        />
                        {!isEditing ? (
                          <Button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={isSubmitting}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setIsEditing(true)
                              setIsForwarding(false)
                            }}
                            title={
                              'Edit ' +
                              field.name.charAt(0).toUpperCase() +
                              field.name.slice(1).toLowerCase()
                            }
                          >
                            <EditIcon className="size-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              type="submit"
                              className="bg-green-600 hover:bg-green-700 text-white min-w-10"
                              disabled={
                                isSubmitting ||
                                field.state.value === currentInfo
                              }
                              title={
                                'Change ' +
                                field.name.charAt(0).toUpperCase() +
                                field.name.slice(1).toLowerCase()
                              }
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
                          Your {fId} has been updated. Please allow a moment for
                          the changes to reflect across the application.
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
    </div>
  )
}
