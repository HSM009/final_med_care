import { type LucideIcon } from 'lucide-react'
import { Gender, Roles } from '@/generated/prisma/browser'
import type { UploadedFileInfo } from './vercel-action'
import type { MedicineItem } from '#/components/addPatientMedicineDialog'

export interface AuthUser {
  id: string
  name: string | undefined
  email: string | undefined
  qualification: string
  gender: Gender
  dateOfBirth: Date
  cellNo: string
  role: Roles
}

export interface AuthContextResult {
  auth: {
    user: AuthUser | null | undefined
  }
}

export interface NavUserProps {}

export interface NavPrimaryProps {
  items: {
    title: string
    to: string
    icon: LucideIcon
    activeOptions: { exact: boolean }
  }[]
}

export interface NavPatientProps {
  name: string
  medCareId: string
  age: Date
  phone: string
  email: string
  gender: Gender
}

export interface NavUserProps {
  editDialog: Number
  userId: string
  usertitle: string
  userEmail: string
  userEmailVerified: Boolean
  userBanned: Boolean
  userRole: string
  userQualification: string
  userCellNo: string
  userFailedAttempts: Number
  sessionName: string
}

export interface EditUserProps {
  userId: string
  userName: string
  userEmail: string
  userDateOfBirth: Date
  userCellNo: string
  gender: Gender
  sessionName: string
}

export function formatDateToDMY(dateString: Date | string | number) {
  if (!dateString) return ''
  const dateObj = new Date(dateString)
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(dateObj)
    .replace(/ /g, '-')
    .toUpperCase()

  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)

  // Combined Output: "28-MAY-2026 09:15 PM"
  return `${datePart} ${timePart}`
}

export interface AppPaginationNavProps {
  page: number
  totalCount: number
  pageSize?: number
  isPending?: boolean
  onPageChange: (newPage: number) => void
}

export interface EditMedicineDialogNavProps {
  Id: number
  medicineContentEnglish?: string | undefined | null
  medicineContentUrdu?: string | undefined | null
  Dosage?: string | undefined | null
}

export const prescriptionButtons = [
  { type: 'Save Prescription', val: false },
  { type: 'Finalize Prescription', val: true },
]

export interface UserFieldCardProps {
  userId: string
  Title: string
  currentData?: string | Boolean | Number | Date
  sessionName?: string
  validatorHandler: any
}

export interface SinglePrescription {
  id: number
  medCareId: string | null
  createdPrescription: Date
  prescriptionSubmitted: boolean
  prescriptionsContent: string | MedicineItem[] | null
  doctorName: string | null
  doctorQualification: string | null
  doctorCellNo: string | null
  doctorNote: string | null
  patientName: string | null
  patientAge: Date
  patientPhone: string | null
  patientGender: Gender | string | null
  patientImages: string | UploadedFileInfo[] | null
}
