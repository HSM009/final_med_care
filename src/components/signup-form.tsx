import { Button } from '@/components/ui/button'
import { useForm } from '@tanstack/react-form'
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
import { Link, useNavigate } from '@tanstack/react-router'
import { signupSchema } from '@/schemas/auth'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function SignupForm({}: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await authClient.signUp.email({
          name: value.fullName,
          email: value.email,
          password: value.password,
          // callbackURL: '/dashboard',
          fetchOptions: {
            onSuccess: () => {
              toast.success('Account Creates Successfully.')
              navigate({
                to: '/login',
              })
            },
            onError: ({ error }) => {
              if (error && error.message === 'USER_ALREADY_EXISTS') {
                toast.error('Registration failed. Email already exists.')
                form.setFieldMeta('email', (prev) => ({
                  ...prev,
                  isTouched: true,
                  errorMap: {
                    onSubmit: 'This email address is already in use.',
                  },
                }))
              } else {
                toast.error(error.message || 'An unexpected error occurred.')
              }
            },
          },
        })
      })
    },
  })

  const formatFieldErrors = (errors: any[]) => {
    return errors.map((err) => {
      if (err && typeof err === 'object' && 'message' in err) {
        return { message: String(err.message) }
      }
      return { message: String(err) }
    })
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
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
          <FieldGroup>
            <form.Field
              name="fullName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="HSM"
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
              name="email"
              children={(field) => {
                const manualError = field.state.meta.errorMap.onSubmit
                const isInvalid =
                  field.state.meta.isTouched &&
                  (!field.state.meta.isValid || !!manualError)
                const formattedErrors = formatFieldErrors(
                  field.state.meta.errors,
                )
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
                      placeholder="hsm@gmail.com"
                      autoComplete="off"
                      type="email"
                      disabled={isPending}
                    />
                    {isInvalid && formattedErrors.length > 0 && (
                      <FieldError errors={formattedErrors} />
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
                      autoComplete="off"
                      type="password"
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <FieldGroup>
              <Field>
                <Button
                  className="cursor-pointer"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? 'Creating User...' : 'Sign Up'}
                </Button>{' '}
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link to="/login">Login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

// hoseinsirat@gmail.com
