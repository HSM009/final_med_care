import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { loginSchema } from '@/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function LoginForm() {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await authClient.signIn.email({
          email: value.email,
          password: value.password,
          fetchOptions: {
            onSuccess: () => {
              navigate({ to: '/dashboard' })
              toast.success('Logged in successfully')
            },
            onError: ({ error }) => {
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
            form.handleSubmit()
          }}
        >
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
                      disabled={isPending}
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
                      disabled={isPending}
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
                disabled={isPending}
                type="submit"
              >
                {isPending ? 'Logging in...' : 'Login'}
              </Button>

              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link to="/signUp">Sign up</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
