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
import { signupSchema } from '#/schemas/auth'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from './ui/carousel'
import { useState } from 'react'
import { Roles } from '#/generated/prisma/enums'

interface prop {
  type: string | undefined
}

export function SignupForm({ type }: prop) {
  const navigate = useNavigate()

  const [api, setApi] = useState<CarouselApi>()
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: type,
      isApproved: false,
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      const isApprovedStatus = type !== Roles.Doctor

      await authClient.signUp.email({
        name: value.fullName,
        email: value.email,
        password: value.password,
        role: type || Roles.Patient,
        isApproved: isApprovedStatus,
        fetchOptions: {
          onSuccess: async () => {
            toast.loading('Sending the verification code ...', {
              id: 'auth-flow',
            })

            const { error: otpError } =
              await authClient.emailOtp.sendVerificationOtp({
                email: value.email,
                type: 'email-verification',
              })

            if (otpError) {
              toast.error(
                otpError.message || 'Failed to dispatch verification code',
                { id: 'auth-flow' },
              )
              return
            }

            toast.success('Verification code is sent! check your inbox', {
              id: 'auth-flow',
            })
            api?.scrollNext()
          },
          onError: ({ error }) => {
            if (error && error.message === 'USER_ALREADY_EXISTS') {
              toast.error(
                'Registration failed. Provided email is already in use.',
              )
              form.setFieldMeta('email', (prev) => ({
                ...prev,
                isTouched: true,
                errorMap: {
                  ...prev?.errorMap,
                  onSubmit: 'This email address is already in use.',
                },
              }))
            } else {
              console.log(error.message)
              toast.error(error.message || 'An unexpected error occurred.')
            }
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
    const { error } = await authClient.emailOtp.verifyEmail({
      email: form.state.values.email,
      otp: otp,
    })
    setIsVerifying(false)
    if (error) {
      toast.error('Invalid or expired code.')
      return
    }
    toast.success('Account Creates Successfully.')
    navigate({
      to: '/login',
      search: { type: type },
    })
  }

  const handleResendOtp = async () => {
    const email = form.state.values.email
    if (!email) return

    toast.loading('Resending the verification code...', { id: 'resend-otp' })

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: email,
      type: 'email-verification',
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
                  <form.Subscribe
                    selector={(state) => [state.isSubmitting]}
                    children={([isSubmitting]) => (
                      <FieldGroup>
                        <form.Field
                          name="fullName"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Full Name
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
                                  placeholder="HSM"
                                  autoComplete="off"
                                  disabled={isSubmitting}
                                />
                                {isInvalid && (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                )}
                              </Field>
                            )
                          }}
                        />
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
                        <form.Field
                          name="password"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
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
                                {isInvalid && (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
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
                            <Button variant="outline" type="button">
                              Sign up with Google
                            </Button>
                            <FieldDescription className="px-6 text-center">
                              Already have an account?{' '}
                              <Link to="/login" search={{ type: type }}>
                                Login
                              </Link>
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
                        {isVerifying ? 'Verifying Code...' : 'Verify Email'}
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
        </CarouselContent>
      </Carousel>
    </div>
  )
}
