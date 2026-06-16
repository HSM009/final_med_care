import { Button } from '#/components/ui/button'
import { useForm } from '@tanstack/react-form'
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
import { Link, useNavigate } from '@tanstack/react-router'
import { emailUpdateSchema, resetPasswordUpdateSchema } from '#/schemas/auth'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from './ui/carousel'
import { useState } from 'react'

export function ForgotPassword({}: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate()

  const [api, setApi] = useState<CarouselApi>()
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: emailUpdateSchema, // (not updating just using same validation for forgot password)
    },
    onSubmit: async ({ value }) => {
      toast.loading('Sending the verification code ...', {
        id: 'auth-flow',
      })
      await authClient.emailOtp.requestPasswordReset({
        email: value.email,
        fetchOptions: {
          onSuccess: () => {
            toast.success(
              'If that email matches an account, a code has been sent!',
              {
                id: 'auth-flow',
              },
            )
            api?.scrollNext()
          },
          onError: ({ error }) => {
            console.log(error.message)
            toast.error(error.message || 'An unexpected error occurred.', {
              id: 'auth-flow',
            })
          },
        },
      })
    },
  })
  const passwordForm = useForm({
    defaultValues: {
      password: '',
    },
    validators: { onSubmit: resetPasswordUpdateSchema },
    onSubmit: async ({ value }) => {
      toast.loading('Reseting the password', { id: 'reset-flow' })
      await authClient.emailOtp.resetPassword({
        email: form.state.values.email,
        otp: otp,
        password: value.password,
        fetchOptions: {
          onSuccess: () => {
            toast.success('New Password updated.', { id: 'reset-flow' })
            navigate({
              to: '/login',
            })
          },
          onError: ({ error }) => {
            console.log(error.message)
            toast.error(error.message || 'An unexpected error occurred.', {
              id: 'reset-flow',
            })
          },
        },
      })
    },
  })
  const handleVerifyOtp = async (e: React.SubmitEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 6) {
      toast.error('Please input a complete 6-digit confirmation code.')
      return
    }
    setIsVerifying(true)
    toast.loading('Verifying the OTP code.', { id: 'otp-flow' })
    const { error } = await authClient.emailOtp.checkVerificationOtp({
      email: form.state.values.email,
      type: 'forget-password',
      otp: otp,
    })
    setIsVerifying(false)
    if (error) {
      toast.error('Invalid or expired code.', { id: 'otp-flow' })
      return
    }
    toast.success('Otp is verfied.', { id: 'otp-flow' })
    api?.scrollNext()
  }

  const handleResendOtp = async () => {
    const email = form.state.values.email
    if (!email) return

    toast.loading('Resending the verification code...', { id: 'resend-otp' })

    const { error } = await authClient.emailOtp.requestPasswordReset({
      email: email,
    })
    if (error) {
      toast.error(error.message || 'Failed to resend the email code.', {
        id: 'resend-otp',
      })
    } else {
      toast.success('New verification code sent.', { id: 'resend-otp' })
    }
  }

  const formatFieldErrors = (errors: any[]) => {
    return errors.map((err) => {
      if (err && typeof err === 'object' && 'message' in err) {
        return { message: String(err.message) }
      }
      return { message: String(err) }
    })
  }
  return (
    <div>
      <Carousel setApi={setApi} opts={{ watchDrag: false }}>
        <CarouselContent>
          <CarouselItem>
            <Card>
              <CardHeader>
                <CardTitle>Forgot your password</CardTitle>
                <CardDescription>
                  Enter your email below to resend the password
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
                            const manualError =
                              field.state.meta.errorMap.onSubmit
                            const isInvalid =
                              field.state.meta.isTouched &&
                              (!field.state.meta.isValid || !!manualError)
                            const formattedErrors = formatFieldErrors(
                              field.state.meta.errors,
                            )
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Email
                                </FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="hsm@hsm.com"
                                  autoComplete="off"
                                  type="email"
                                  disabled={isSubmitting}
                                />
                                {isInvalid && formattedErrors.length > 0 && (
                                  <FieldError errors={formattedErrors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <FieldGroup>
                          <Field>
                            <Button
                              className="cursor-pointer"
                              disabled={isSubmitting}
                              type="submit"
                            >
                              {isSubmitting ? 'Verification Step...' : 'Next'}
                            </Button>
                            <FieldDescription className="px-6 text-center">
                              Already have an account?{' '}
                              <Link to="/login">Login</Link>
                            </FieldDescription>
                          </Field>
                        </FieldGroup>
                      </FieldGroup>
                    )}
                  ></form.Subscribe>
                </form>
              </CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card>
              <CardHeader>
                <CardTitle>Verification</CardTitle>
                <CardDescription>
                  Enter the 6 digit email OTP
                  <form.Subscribe selector={(state) => state.values.email}>
                    {(email) => (
                      <span className="font-semibold text-foreground">
                        {'  '}
                        {email}
                      </span>
                    )}
                  </form.Subscribe>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyOtp}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="otpInput">One-Time Code</FieldLabel>
                      <Input
                        id="otpInput"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ''))
                        }
                        disabled={isVerifying}
                        autoComplete="one-time-code"
                        className="tracking-widest text-center text-lg font-mono"
                      />
                    </Field>
                    <Field>
                      <Button
                        className="w-full cursor-pointer"
                        type="submit"
                        disabled={isVerifying || otp.length < 6}
                      >
                        {isVerifying ? 'Verifying Code...' : 'Next'}
                      </Button>
                      <Button
                        variant="link"
                        type="button"
                        className="w-full mt-2 text-xs cursor-pointer"
                        onClick={handleResendOtp}
                      >
                        Didn't receive a code? Resend
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card>
              <CardHeader>
                <CardTitle>New Password</CardTitle>
                <CardDescription>
                  Enter your new password to change password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    passwordForm.handleSubmit()
                  }}
                >
                  <passwordForm.Subscribe
                    selector={(state) => [state.isSubmitting]}
                    children={([isSubmitting]) => (
                      <FieldGroup>
                        <passwordForm.Field
                          name="password"
                          children={(field) => {
                            const manualError =
                              field.state.meta.errorMap.onSubmit
                            const isInvalid =
                              field.state.meta.isTouched &&
                              (!field.state.meta.isValid || !!manualError)
                            const formattedErrors = formatFieldErrors(
                              field.state.meta.errors,
                            )
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Password
                                </FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="********"
                                  autoComplete="off"
                                  type="password"
                                  disabled={isSubmitting}
                                />
                                {isInvalid && formattedErrors.length > 0 && (
                                  <FieldError errors={formattedErrors} />
                                )}
                              </Field>
                            )
                          }}
                        />
                        <FieldGroup>
                          <Field>
                            <Button
                              className="cursor-pointer"
                              disabled={isSubmitting}
                              type="submit"
                            >
                              {isSubmitting ? 'Updating Email...' : 'Update'}
                            </Button>
                          </Field>
                        </FieldGroup>
                      </FieldGroup>
                    )}
                  ></passwordForm.Subscribe>
                </form>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  )
}
