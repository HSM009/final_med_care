import { Gender } from '@/generated/prisma/enums'
import z from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const signupSchema = z.object({
  fullName: z.string().min(5),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8),
})
export const patientSearchSchema = z.object({
  search: z.string().default(''),
  page: z.number().catch(1).optional(),
})
export const routeSearchSchema = z.object({
  search: z.string().optional().catch(''),
  page: z.number().catch(1).optional(),
})
export const adminSearchSchema = z.object({
  search: z.string().default(''),
  page: z.number().catch(1).optional(),
  userId: z.string(),
})

export const routeAdminSearchSchema = z.object({
  search: z.string().optional().catch(''),
  page: z.number().catch(1).optional(),
  userId: z.string().optional().catch(''),
})

export const addPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  gender: z.nativeEnum(Gender),
  age: z.date({ message: 'A valid date of birth is required' }).refine(
    (birthDate) => {
      const today = new Date()
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--
      }
      return calculatedAge >= 1 && calculatedAge <= 120
    },
    {
      message: 'Patient must be between 1 and 120 years old',
    },
  ),
  phone: z.string().length(11, 'Phone number must be exactly 11 characters'),
})

export const medicineSearchSchema = z.object({
  search: z.string().default(''),
  page: z.number().catch(1).optional(),
})
export const routeMedicineSearchSchema = z.object({
  search: z.string().optional().catch(''),
  page: z.number().catch(1).optional(),
})

export const addOrUpdateMedicineSchema = z.object({
  medicineContentEnglish: z
    .string()
    .min(2, 'Name must be at least 2 characters'),
  medicineContentUrdu: z
    .string()
    .min(1, 'Description must be at least 1 characters'),
  Dosage: z.string().min(1, 'Dosage must be at least 1 characters'),
})

export const updateMedicineSchema = addOrUpdateMedicineSchema.extend({
  id: z.number(),
})

export const updatePatientSchema = addPatientSchema.extend({
  id: z.number(),
})

export const addPatientMedicineSearch = z.object({
  search: z.string().default(''),
})

export const emailUpdateSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const roleUpdateSchema = z.object({
  role: z.string(),
})
export const emailVerifiedUpdateSchema = z.object({
  emailVerified: z.boolean(),
})
export const bannedUpdateSchema = z.object({
  banned: z.boolean(),
})
export const failedAttemptsUpdateSchema = z.object({
  failedAttempts: z.number(),
})
export const nameUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export const cellNoUpdateSchema = z.object({
  cellNo: z
    .string()
    .min(11, 'Cell number must be at least 11 characters')
    .max(11, 'Cell number must be at most 11 characters'),
})
export const qualificationUpdateSchema = z.object({
  qualification: z
    .string()
    .min(2, 'Qualification must be at least 2 characters'),
})

export const passwordUpdateSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Current password must be at least 8 characters'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Your new password cannot be the same as your current password.',
    path: ['newPassword'],
  })

export const forceChangeEmailSchema = z.object({
  userId: z.string(),
  newEmail: z.string().email(),
})

// 2. Correct Zod Extension Syntax
export const forceChangeEmailSchemaExtended = forceChangeEmailSchema.extend({
  userName: z.string(),
  currentEmail: z.string(),
})

export const adminActionSchema = z.object({
  fId: z.string(),
  Title: z.string(),
  newValue: z.string().or(z.boolean()).or(z.number()),
})
