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
import { lazy, Suspense, useState } from 'react'
import { Gender } from '#/generated/prisma/enums'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const DateOfBirthPicker = lazy(() =>
  import('#/components/datePicker').then((mod) => ({
    default: mod.DateOfBirthPicker,
  })),
)

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
      cellNo: '',
      role: type,
      gender: Gender.Other as Gender,
      dateOfBirth: new Date(),
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email({
        name: value.fullName,
        email: value.email,
        password: value.password,
        role: type,
        gender: value.gender,
        dateOfBirth: value.dateOfBirth,
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
              // Auto-navigate back to step 1 where the email field lives
              api?.scrollTo(0)
            } else {
              console.log(error.message)
              toast.error(error.message || 'An unexpected error occurred.')
            }
          },
        },
      })
    },
  })

  // Validate step 1 fields dynamically before moving forward via "Next" button
  const handleStepOneNext = async () => {
    form.setFieldMeta('fullName', (prev) => ({ ...prev, isTouched: true }))
    form.setFieldMeta('email', (prev) => ({ ...prev, isTouched: true }))
    form.setFieldMeta('password', (prev) => ({ ...prev, isTouched: true }))

    await form.validateAllFields('submit')

    const state = form.state
    const hasStepOneErrors =
      (state.fieldMeta.fullName?.errors?.length ?? 0) ||
      (state.fieldMeta.email?.errors?.length ?? 0) ||
      (state.fieldMeta.password?.errors?.length ?? 0)

    if (!hasStepOneErrors) {
      api?.scrollNext()
    } else {
      toast.error('Please resolve the errors on this page first.')
    }
  }

  const handleMasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // 🎯 OPTIMIZATION 1: Run validation EXACTLY ONCE for the entire form
    await form.validateAllFields('submit')
    const state = form.state

    // Isolate Step 1 Error Metrics
    const stepOneErrors =
      (state.fieldMeta.fullName?.errors?.length ?? 0) ||
      (state.fieldMeta.email?.errors?.length ?? 0) ||
      (state.fieldMeta.password?.errors?.length ?? 0)

    if (stepOneErrors) {
      form.setFieldMeta('fullName', (prev) => ({ ...prev, isTouched: true }))
      form.setFieldMeta('email', (prev) => ({ ...prev, isTouched: true }))
      form.setFieldMeta('password', (prev) => ({ ...prev, isTouched: true }))

      toast.error('Please correct the validation errors on Step 1.')
      api?.scrollTo(0)
      return
    }

    // Isolate Step 2 Error Metrics
    const stepTwoErrors =
      (state.fieldMeta.gender?.errors?.length ?? 0) ||
      (state.fieldMeta.dateOfBirth?.errors?.length ?? 0)

    if (stepTwoErrors) {
      form.setFieldMeta('gender', (prev) => ({ ...prev, isTouched: true }))
      form.setFieldMeta('dateOfBirth', (prev) => ({ ...prev, isTouched: true }))

      toast.error('Please fill out all required profile information on Step 2.')
      api?.scrollTo(1)
      return
    }

    // Everything is clean -> Submit immediately
    form.handleSubmit()
  }
  const handleVerifyOtp = async (e: React.FormEvent) => {
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
    toast.success('Account Created Successfully.')
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
      <form noValidate onSubmit={handleMasterSubmit}>
        <Carousel setApi={setApi} opts={{ watchDrag: false }}>
          <CarouselContent>
            {/* ================= STEP 1 ================= */}
            <CarouselItem>
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Enter your information below to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                          <Field className="flex gap-2 mt-2">
                            <Button
                              className="cursor-pointer"
                              disabled={isSubmitting}
                              type="button"
                              onClick={handleStepOneNext}
                            >
                              Next
                            </Button>
                            <Button variant="outline" type="button">
                              Sign up with Google
                            </Button>
                          </Field>
                          <FieldDescription className="text-center mt-2">
                            Already have an account?{' '}
                            <Link to="/login" search={{ type: type }}>
                              Login
                            </Link>
                          </FieldDescription>
                        </FieldGroup>
                      </FieldGroup>
                    )}
                  />
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem>
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>
                    Help us configure your context workspace profile setup.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FieldGroup>
                    <form.Field
                      name="cellNo"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Phone Number:
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
                              placeholder="03211234567"
                              autoComplete="off"
                              disabled={form.state.isSubmitting}
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <form.Field
                      name="gender"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field
                            orientation="responsive"
                            data-invalid={isInvalid}
                          >
                            <FieldLabel htmlFor={field.name}>
                              Gender:
                            </FieldLabel>
                            <Select
                              key={field.state.value}
                              value={field.state.value}
                              onValueChange={(value) => {
                                field.handleChange(value as Gender)
                              }}
                              onOpenChange={(open) => {
                                if (!open) {
                                  field.handleBlur()
                                }
                              }}
                            >
                              <SelectTrigger
                                id={field.name}
                                aria-invalid={isInvalid}
                                className="w-full cursor-pointer text-left"
                                disabled={form.state.isSubmitting}
                              >
                                <SelectValue placeholder="Select Gender">
                                  {field.state.value}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent position="popper">
                                {Object.values(Gender).map((gender) => (
                                  <SelectItem
                                    key={gender}
                                    value={gender as string}
                                    className="cursor-pointer"
                                  >
                                    {gender as string}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <form.Field
                      name="dateOfBirth"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field
                            orientation="responsive"
                            data-invalid={isInvalid}
                          >
                            <FieldLabel htmlFor={field.name}>
                              Date of Birth:
                            </FieldLabel>
                            <Suspense
                              fallback={
                                <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                              }
                            >
                              <DateOfBirthPicker
                                onDateChange={(date) =>
                                  field.handleChange(date ?? new Date())
                                }
                              />
                            </Suspense>
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                  </FieldGroup>

                  <Field className="flex items-center gap-2 mt-4">
                    <Button
                      className="cursor-pointer"
                      disabled={form.state.isSubmitting}
                      type="button"
                      variant="outline"
                      onClick={() => api?.scrollPrev()}
                    >
                      Previous
                    </Button>

                    <Button
                      className="cursor-pointer"
                      disabled={form.state.isSubmitting}
                      type="submit"
                    >
                      {form.state.isSubmitting
                        ? 'Submitting...'
                        : 'Register & Verify'}
                    </Button>
                  </Field>
                </CardContent>
              </Card>
            </CarouselItem>

            {/* ================= STEP 3 (OTP) ================= */}
            <CarouselItem>
              <Card>
                <CardHeader>
                  <CardTitle>Verification</CardTitle>
                  <CardDescription>
                    Enter the 6-digit email OTP sent to
                    <form.Subscribe selector={(state) => state.values.email}>
                      {(email) => (
                        <span className="font-semibold text-foreground ml-1">
                          {email}
                        </span>
                      )}
                    </form.Subscribe>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="otpInput">
                          One-Time Code
                        </FieldLabel>
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
                          type="button"
                          disabled={isVerifying || otp.length < 6}
                          onClick={(e) => handleVerifyOtp(e)}
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
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </form>
    </div>
  )
}
