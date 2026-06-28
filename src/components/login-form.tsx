import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { getSessionFn } from '#/data/session'
import { Roles } from '#/generated/prisma/enums'
import { authClient } from '#/lib/auth-client'
import { createAuthContext } from '#/lib/auth-injectors'
import { hasPermission } from '#/lib/roleBaseActions'
import { showToast } from '#/lib/showToast'
import { loginSchema } from '#/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'

interface prop {
  type: string | undefined
}
export function LoginForm({ type }: prop) {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email({
        email: value.email,
        password: value.password,
        fetchOptions: {
          onSuccess: async () => {
            const session = await getSessionFn()
            const { auth } = createAuthContext(session)
            const receivedRole = auth.user?.role as Roles
            const currentFormType = type as Roles

            if (receivedRole !== Roles.Admin) {
              if (currentFormType !== receivedRole) {
                toast.error('You are not authorized to access this portal.')
                await authClient.signOut()
                return
              }
            }
            if (hasPermission(receivedRole, Roles.Doctor)) {
              navigate({ to: '/dashboard' })
              showToast.success('Logged in successfully')
            } else if (hasPermission(receivedRole, Roles.Patient)) {
              navigate({ to: '/patientDashboard' })
              showToast.success('Logged in successfully')
            } else {
              console.log(3)
            }
          },
          onError: ({ error }) => {
            if (error.message?.startsWith('PENDING_REGISTRATION:')) {
              toast.error(
                'Your account is pending for approval from an administrator.',
              )
              return
            }
            if (error.message?.startsWith('ADMIN_BANNED:')) {
              toast.error('Your account has been banned by an administrator.')
              return
            }
            if (error.message?.startsWith('ADMIN_REJECT_REGISTRATION:')) {
              toast.error(
                'Your account approval has been rejected by an administrator.',
              )
              return
            }
            if (error.message?.startsWith('LOCKOUT_EXPIRY:')) {
              const parts = error.message.split(':')
              const expiryTimestamp = parseInt(parts[1], 10)
              const remainingMs = expiryTimestamp - Date.now()
              const remainingMinutes = Math.ceil(remainingMs / (60 * 1000))
              toast.error(
                `Too many failed attempts. Your account is locked for another ${remainingMinutes} minute(s).`,
              )
              return
            }
            if (
              error &&
              (error.status === 401 ||
                error.code === 'INVALID_EMAIL_OR_PASSWORD')
            ) {
              toast.error(
                'This email is not registered, or the password you entered is incorrect.',
              )
              return
            }

            toast.error(error.message || 'An unexpected error occurred.')
          },
        },
      })
    },
  })
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <FieldGroup>
                <form.Field
                  name="email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="hsm@hsm.com"
                          type="email"
                          autoComplete="off"
                          disabled={isSubmitting}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="********"
                          type="password"
                          autoComplete="off"
                          disabled={isSubmitting}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <Field>
                  <Button
                    className="cursor-pointer"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </Button>

                  <FieldDescription className="text-center border-b py-2">
                    <span>
                      Forgot your password?{' '}
                      <Link
                        to="/forgotPassword"
                        className=" underline hover:text-primary"
                      >
                        Forgot Password
                      </Link>
                    </span>
                  </FieldDescription>
                  <FieldDescription className=" text-center">
                    <span>
                      Don&apos;t have an account?
                      <Link
                        to="/signUp"
                        search={{ type: type }}
                        className=" underline hover:text-primary"
                      >
                        Sign Up
                      </Link>
                    </span>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            )}
          ></form.Subscribe>
        </form>
      </CardContent>
    </Card>
  )
}
