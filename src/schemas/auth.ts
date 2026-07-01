import { DayOfWeek, Gender, Roles } from '@/generated/prisma/enums'
import z from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const signupSchema = z.object({
  fullName: z.string().min(5),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8),
  role: z.enum(Object.values(Roles) as [Roles, ...Roles[]]),
  gender: z.enum(Object.values(Gender) as [Gender, ...Gender[]]),
  dateOfBirth: z.date({ message: 'A valid date of birth is required' }).refine(
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
  cellNo: z
    .string()
    .min(11, 'Cell number must be at least 11 characters')
    .max(11, 'Cell number must be at most 11 characters'),
})

export const patientSearchSchema = z.object({
  search: z.string().optional(),
  page: z.number().catch(1).optional(),
  pagePerRows: z.number().optional(),
})

export const adminSearchSchema = z.object({
  // Catch any bad value or undefined and fall back to an empty string
  search: z.string().optional().catch(''),

  // Coerce incoming URL string params like '?page=2' into numbers, fall back to 1
  page: z.coerce.number().optional().catch(1),

  // pagePerRows will default to 8 if not present
  pagePerRows: z.number().optional().default(8),

  userId: z.string().optional().catch(''),
})

export type AdminSearchParamType = z.infer<typeof adminSearchSchema>

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
  role: z.enum(Roles).default(Roles.Patient),
})

export const medicineSearchSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  rowsPerPage: z.number().optional(),
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
  id: z.string(),
})

export const addPatientMedicineSearch = z.object({
  search: z.string().default(''),
})

export const emailUpdateSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const genderUpdateSchema = z.object({
  gender: z.enum(Gender),
})
export const roleUpdateSchema = z.object({
  role: z.enum(Roles),
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

export const dobUpdateSchema = z.object({
  dateOfBirth: z.date({ message: 'A valid date of birth is required' }).refine(
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

export const resetPasswordUpdateSchema = z.object({
  password: z.string().min(8, 'Current password must be at least 8 characters'),
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
  newValue: z.string().or(z.boolean()).or(z.number()).or(z.date()),
})

export const submitPrescriptionSchema = z.object({
  medCareId: z.string(),
  doctorId: z.string(),
  note: z.string(),
  prescriptionsContent: z.string(),
  prescriptionSubmitted: z.union([z.string(), z.boolean()]), // Handles 'string | true'
  relatedImages: z.string(),
})
export const updatePrescriptionSchema = submitPrescriptionSchema.extend({
  prescriptionId: z.string(),
})

export const downloadSchema = z.object({
  fileUrl: z.string().url(),
})

export const patientPrescriptionSearchSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  medCareId: z.string().optional(),
  age: z.any().optional(), // Keeps the incoming date or string safe
  phone: z.string().optional(),
  email: z.string().optional().nullable(),
  gender: z.string().optional(),
  note: z.string().optional().nullable(),
  prescriptionsContent: z.array(z.any()).catch([]).optional(),
  relatedImages: z.array(z.any()).catch([]).optional(),
  doctorName: z.string().optional(),
  doctorId: z.string().optional(),
  doctorQualification: z.string().optional(),
  doctorPhone: z.string().optional(),
})

export const loginErrorRedirect = z.object({
  type: z.string().optional(),
  redirect: z.string().optional(),
  reason: z.string().optional(),
})

export const signInType = z.object({
  type: z.string().optional(),
})

export const getDoctorSlotsSchema = z.object({
  doctorId: z.string(),
})

export const upsertDoctorSlotsSchema = z.object({
  slots: z.array(
    z.object({
      day: z.nativeEnum(DayOfWeek),
      startTimeMinutes: z.number().min(0).max(1440),
      endTimeMinutes: z.number().min(0).max(1440),
    }),
  ),
})
