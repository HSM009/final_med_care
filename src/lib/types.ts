import { type LucideIcon } from 'lucide-react'
import { authClient } from './auth-client'
import { toast } from 'sonner'
import {
  useNavigate,
  type RegisteredRouter,
  type RouteIds,
} from '@tanstack/react-router'
import { type User } from 'better-auth'
import { Gender } from '@/generated/prisma/browser'
import type { UploadedFileInfo } from './vercel-action'
import type { MedicineItem } from '#/components/addPatientMedicineDialog'

export interface navUserProps {
  user: User
}

export interface extendedUser extends navUserProps {
  role: string
}

export interface NavPrimaryProps {
  items: {
    title: string
    to: RouteIds<RegisteredRouter['routeTree']>
    icon: LucideIcon
    activeOptions: { exact: boolean }
  }[]
}

export interface NavPatientProps {
  name: string
  med_care_id: string
  age: Date
  phone: string
  email: string
  gender: Gender
}

export interface NavAdminProps {
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

//------------Handle Signout------------------
export const useHandleSignOut = () => {
  const navigate = useNavigate()
  return async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: '/',
          })
          toast.success('Signed out Successfully')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    })
  }
}

export function formatDateToDMY(dateString: Date | string | number) {
  if (!dateString) return ''

  const dateObj = new Date(dateString)

  // 1. Format the date section: "28-MAY-2026"
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(dateObj)
    .replace(/ /g, '-')
    .toUpperCase()

  // 2. Format the time section: "09:15 PM"
  const timePart = new Intl.DateTimeFormat('en-US', {
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

export interface EditPatientDialogNavProps {
  Id: number
  name?: string | undefined | null
  email?: string | undefined | null
  age?: Date | null
  phone?: string | undefined | null
  gender?: string | undefined | null
}

export const prescriptionButtons = [
  { type: 'Save Prescription', val: false },
  { type: 'Finalize Prescription', val: true },
]

export interface AdminFieldCardProps {
  userId: string
  Title: string
  currentData: string | Boolean | Number
  sessionName?: string
  validatorHandler: any
}

export interface SinglePrescription {
  id: number
  med_care_id: string | null
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

export enum LoginType {
  Patient = 'Patient',
  Doctor = 'Doctor',
}
