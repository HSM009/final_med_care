'use server'
// import { queryOptions } from '@tanstack/react-query'
import { prisma } from '#/db'
import { authFnMiddleware } from '#/middlewares/auth'
import {
  addOrUpdateMedicineSchema,
  addPatientMedicineSearch,
  CreateAppointmentSchema,
  cronJobLogSchema,
  DashboardDataSchema,
  DoctorIdSchema,
  // addPatientSchema,
  medicineSearchSchema,
  patientSearchSchema,
  SearchSchema,
  SlotsQuerySchema,
  SpecialtySchema,
  submitPrescriptionSchema,
  updateMedicineSchema,
  updatePrescriptionSchema,
  upsertDoctorSlotsSchema,
} from '#/schemas/auth'
import { createServerFn } from '@tanstack/react-start'
import { AppointmentStatus, DayOfWeek, Roles } from '#/generated/prisma/enums'
import { authClient } from '#/lib/auth-client'
import { queryOptions } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { showToast } from '#/lib/showToast'
import {
  formatMinutesToTimeStr,
  getInitialScheduleState,
  PRISMA_DAYS_ARRAY,
} from '#/lib/types'

export const addPatientAction = async (data: any) => {
  return await authClient.signUp.email({
    name: data.fullName,
    email: data.email,
    password: 'generatePassword',
    cellNo: data.cellNo,
    role: data.role,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
  })
}
export const getPatientPrescriptions = createServerFn({ method: 'GET' })
  .validator((medCareId: string) => medCareId)
  .middleware([authFnMiddleware])
  .handler(async ({ data: medCareId }) => {
    const prescriptions = await prisma.patientPrescription.findMany({
      where: {
        medCareId: medCareId,
      },
      orderBy: {
        createdPrescription: 'desc',
      },
      select: {
        id: true,
        medCareId: true,
        prescriptionsContent: true,
        createdPrescription: true,
        prescriptionSubmitted: true,
        relatedImages: true,
        note: true,
        doctor: {
          select: {
            name: true,
            qualification: true,
            cellNo: true,
          },
        },
        patient: {
          select: {
            name: true,
            dateOfBirth: true,
            email: true,
            cellNo: true,
            gender: true,
          },
        },
      },
    })

    if (prescriptions.length === 0) {
      throw new Error('No prescription records found for this patient ID')
    }

    return prescriptions.map((p) => ({
      id: p.id,
      medCareId: p.medCareId,
      prescriptionsContent: p.prescriptionsContent,
      createdPrescription: p.createdPrescription,
      prescriptionSubmitted: p.prescriptionSubmitted,
      patientImages: p.relatedImages,
      doctorNote: p.note || 'No note available',

      doctorName: p.doctor?.name || 'Unknown Doctor',
      doctorQualification: p.doctor?.qualification || 'Unknown Qualification',
      doctorCellNo: p.doctor?.cellNo || 'Unknown Cell Number',

      patientName: p.patient?.name || 'Unknown Patient',
      patientAge: p.patient?.dateOfBirth || new Date(),
      patientEmail: p.patient?.email,
      patientPhone: p.patient?.cellNo || 'Unknown Phone',
      patientGender: p.patient?.gender || 'Unknown Gender',
    }))
  })

export const patientPrescriptionsQueryOptions = (medCareId: string) =>
  queryOptions({
    queryKey: ['prescriptions', medCareId],
    queryFn: () => getPatientPrescriptions({ data: medCareId }),
    staleTime: 1000 * 60 * 5,
  })

export const addMedicineAction = createServerFn({ method: 'POST' })
  .validator(addOrUpdateMedicineSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    return await prisma.$transaction(async (tx) => {
      const newMedicine = await tx.medicineList.create({
        data: {
          medicineContentEnglish: data.medicineContentEnglish,
          medicineContentUrdu: data.medicineContentUrdu,
          Dosage: data.Dosage,
        },
      })
      return newMedicine
    })
  })

export const searchPatientMedicineAction = createServerFn({ method: 'GET' })
  .validator(addPatientMedicineSearch)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const searchString = data?.search?.trim()
    if (!searchString) return []

    return await prisma.medicineList.findMany({
      where: {
        medicineContentEnglish: {
          contains: searchString,
          mode: 'insensitive',
        },
      },
      take: 10, // Safeguard performance by limiting rows returned
    })
  })

export const updateMedicineAction = createServerFn({ method: 'POST' })
  .validator(updateMedicineSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    return await prisma.$transaction(async (tx) => {
      const newMedicine = await tx.medicineList.update({
        where: { id: data.id }, // Fixed: id pulled safely from validator
        data: {
          medicineContentEnglish: data.medicineContentEnglish,
          medicineContentUrdu: data.medicineContentUrdu,
          Dosage: data.Dosage,
        },
      })
      return newMedicine
    })
  })

export const addPrescriptionSubmission = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(submitPrescriptionSchema)
  .handler(async ({ data }: { data: any }) => {
    return await prisma.$transaction(async (tx) => {
      const newPrescription = await tx.patientPrescription.create({
        data: {
          medCareId: data.medCareId,
          prescriptionsContent: data.prescriptionsContent,
          prescriptionSubmitted: data.prescriptionSubmitted,
          doctorId: data.doctorId,
          note: data.note,
          relatedImages: data.relatedImages,
        },
      })
      return newPrescription
    })
  })

export const updatePrescriptionSubmission = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(updatePrescriptionSchema)
  .handler(async ({ data }: { data: any }) => {
    return await prisma.$transaction(async (tx) => {
      const newPrescription = await tx.patientPrescription.update({
        where: { id: Number(data.prescriptionId) },
        data: {
          med_care_id: data.med_care_id,
          prescriptionsContent: data.prescriptionsContent,
          prescriptionSubmitted: data.prescriptionSubmitted,
          doctorId: data.doctorId,
          note: data.note,
          relatedImages: data.relatedImages,
        },
      })
      return newPrescription
    })
  })

export const getMedicineList = createServerFn({ method: 'GET' })
  .validator(medicineSearchSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const searchString = data?.search
    const currentPage = data?.page || 1
    const PAGE_SIZE = data.rowsPerPage || 8
    if (searchString === undefined) {
      return { items: [], totalCount: 0 }
    }
    const whereClause = {
      activeStatus: true,
      ...(searchString
        ? {
            AND: [
              {
                OR: [
                  {
                    medicineContentEnglish: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    medicineContentUrdu: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    Dosage: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    }

    const [items, totalCount] = await Promise.all([
      prisma.medicineList.findMany({
        where: whereClause,
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { id: 'asc' },
      }),
      prisma.medicineList.count({ where: whereClause }),
    ])

    return { items, totalCount }
  })

export const getPatients = createServerFn({ method: 'GET' })
  .validator(patientSearchSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const searchString = data?.search
    const currentPage = data?.page || 1
    const PAGE_SIZE = data.pagePerRows || 8

    if (searchString === undefined) {
      return { items: [], totalCount: 0 }
    }

    const whereClause = {
      role: Roles.Patient,
      banned: false,

      ...(searchString
        ? {
            AND: [
              {
                OR: [
                  {
                    medCareId: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    name: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    cellNo: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    }

    const [items, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          medCareId: true,
          name: true,
          email: true,
          cellNo: true,
          gender: true,
          dateOfBirth: true,
          createdAt: true,
        },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { medCareId: 'asc' },
      }),
      prisma.user.count({ where: whereClause }),
    ])

    return { items, totalCount }
  })

export const useHandleSignOut = () => {
  const navigate = useNavigate()
  return async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: '/',
          })
          showToast.success('Signed out Successfully')
        },
        onError: ({ error }) => {
          showToast.error(error.message)
        },
      },
    })
  }
}

export const upsertDoctorSlots = createServerFn({ method: 'POST' })
  .validator(upsertDoctorSlotsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const { doctorId, slots } = data
    if (!doctorId) throw new Error('Unauthorized operational access.')

    const result = await prisma.$transaction(async (tx) => {
      await tx.doctorSlots.deleteMany({ where: { doctorId } })

      if (slots.length > 0) {
        return await tx.doctorSlots.createMany({
          data: slots.map((s) => ({
            doctorId,
            day: s.day,
            startTimeMinutes: s.startTimeMinutes,
            endTimeMinutes: s.endTimeMinutes,
          })),
        })
      }
      return { count: 0 }
    })
    return { success: true, recordsUpdated: result.count }
  })

export const getDoctorNameById = createServerFn({ method: 'GET' })
  .validator(SearchSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const doctor = await prisma.user.findFirst({
      where: {
        id: data.search,
        role: Roles.Doctor,
      },
      select: {
        name: true,
      },
    })

    return doctor || null
  })

export const getAppointmentDashboardData = createServerFn({ method: 'GET' })
  .validator(DashboardDataSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const { doctorId, shouldFetchName, shouldFetchQualification } = data
    const loadedState = getInitialScheduleState()

    const doctorProfile = await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        name: shouldFetchName,
        qualification: shouldFetchQualification,
        doctorSlots: {
          select: {
            day: true,
            startTimeMinutes: true,
            endTimeMinutes: true,
          },
          orderBy: [{ day: 'asc' }, { startTimeMinutes: 'asc' }],
        },
      },
    })

    const dbSlots = doctorProfile?.doctorSlots || []

    for (let i = 0; i < dbSlots.length; i++) {
      const slot = dbSlots[i]
      const dayKey = slot.day as DayOfWeek

      const startH = Math.floor(slot.startTimeMinutes / 60)
        .toString()
        .padStart(2, '0')
      const startM = (slot.startTimeMinutes % 60).toString().padStart(2, '0')
      const endH = Math.floor(slot.endTimeMinutes / 60)
        .toString()
        .padStart(2, '0')
      const endM = (slot.endTimeMinutes % 60).toString().padStart(2, '0')

      if (loadedState[dayKey]) {
        loadedState[dayKey].push({
          startTime: `${startH}:${startM}`,
          endTime: `${endH}:${endM}`,
        })
      }
    }

    return {
      initialSchedule: loadedState,
    }
  })

export const getPatientDashboardOverview = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const overViewData = await prisma.appointment.findMany({
      where: {
        patientId: context.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        date: true,
        status: true,
        createdAt: true,
        doctor: {
          select: {
            name: true,
            qualification: true,
            specialties: true,
          },
        },
      },
    })

    return overViewData
  })

export const getPatientDashboardOverviewQueryOptions = () =>
  queryOptions({
    queryKey: ['overViewData'],
    queryFn: async () => {
      const response = await getPatientDashboardOverview()
      return response
    },
    staleTime: 1000 * 60 * 10,
  })

const serverGetDoctorsBySpecialty = createServerFn({ method: 'GET' })
  .validator((data: unknown) => SpecialtySchema.parse(data))
  .handler(async ({ data: chosenSpecialty }) => {
    return await prisma.user.findMany({
      where: {
        role: Roles.Doctor,
        specialties: {
          has: chosenSpecialty, // Matches your Specialty[] list setup perfectly
        },
        OR: [{ banned: false }, { banned: null }],
      },
      select: {
        id: true,
        name: true,
        title: true,
        qualification: true,
      },
      orderBy: { name: 'asc' },
    })
  })

const serverGetDoctorAvailableDates = createServerFn({ method: 'GET' })
  .validator(DoctorIdSchema)
  .handler(async ({ data: { doctorId } }) => {
    const activeSlots = await prisma.doctorSlots.findMany({
      where: { doctorId: doctorId, isBooked: false },
      select: { day: true },
      distinct: ['day'],
    })
    if (activeSlots.length === 0) {
      console.warn(
        `[Booking System] Doctor ID ${doctorId} has no records in DoctorSlots table.`,
      )
      return []
    }

    const activeDaysSet = new Set(activeSlots.map((s) => s.day))
    const results: { dateString: string; displayLabel: string }[] = []

    const baseDate = new Date()

    for (let i = 0; i < 7; i++) {
      const loopDate = new Date(baseDate)
      loopDate.setDate(baseDate.getDate() + i) // Pure independent offset calculation

      const dayNameInPrisma = PRISMA_DAYS_ARRAY[loopDate.getDay()]

      if (activeDaysSet.has(dayNameInPrisma)) {
        const year = loopDate.getFullYear()
        const month = String(loopDate.getMonth() + 1).padStart(2, '0')
        const day = String(loopDate.getDate()).padStart(2, '0')
        const isoDateString = `${year}-${month}-${day}`

        results.push({
          dateString: isoDateString,
          displayLabel: loopDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        })
      }
    }

    return results
  })

const serverGetDoctorTimeSlots = createServerFn({ method: 'GET' })
  .validator((data: unknown) => SlotsQuerySchema.parse(data))
  .handler(async ({ data: { doctorId, dateString } }) => {
    const targetDate = new Date(dateString)
    const dayOfWeekStr = PRISMA_DAYS_ARRAY[targetDate.getDay()]

    const baseSlots = await prisma.doctorSlots.findMany({
      where: { doctorId, day: dayOfWeekStr },
      orderBy: { startTimeMinutes: 'asc' },
    })

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

    const activeAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'Cancelled' },
      },
      select: { date: true },
    })

    const bookedMinutesStream = new Set(
      activeAppointments.map(
        (appt) => appt.date.getHours() * 60 + appt.date.getMinutes(),
      ),
    )

    return baseSlots
      .filter((slot) => !bookedMinutesStream.has(slot.startTimeMinutes))
      .map((slot) => ({
        rawMinutes: slot.startTimeMinutes,
        displayLabel: `${formatMinutesToTimeStr(slot.startTimeMinutes)} - ${formatMinutesToTimeStr(slot.endTimeMinutes)}`,
      }))
  })

export const medicalQueries = {
  all: ['medical-core-matrix'] as const,

  doctors: (specialty: string | undefined) =>
    queryOptions({
      queryKey: [...medicalQueries.all, 'doctors', specialty] as const,
      queryFn: () => serverGetDoctorsBySpecialty({ data: specialty! }),
      enabled: !!specialty,
      staleTime: 1000 * 60 * 15, // Cache doctor directory for 15 minutes
      gcTime: 1000 * 60 * 45,
    }),

  dates: (doctorId: string | undefined) =>
    queryOptions({
      queryKey: [...medicalQueries.all, 'dates', doctorId] as const,
      queryFn: () =>
        serverGetDoctorAvailableDates({ data: { doctorId: doctorId! } }),
      enabled: !!doctorId,
      staleTime: 1000 * 60 * 10, // Cache operational days for 10 minutes
      gcTime: 1000 * 60 * 30,
    }),

  slots: (doctorId: string | undefined, dateString: string | undefined) =>
    queryOptions({
      queryKey: [...medicalQueries.all, 'slots', doctorId, dateString] as const,
      queryFn: () =>
        serverGetDoctorTimeSlots({
          data: { doctorId: doctorId!, dateString: dateString! },
        }),
      enabled: !!doctorId && !!dateString,
      staleTime: 1000 * 15,
      gcTime: 1000 * 60 * 5,
    }),
}

export const postPatientAppointment = createServerFn({ method: 'POST' })
  .validator(CreateAppointmentSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const totalMinutes =
      typeof data.timeMinutes === 'string'
        ? parseInt(data.timeMinutes, 10)
        : data.timeMinutes

    const appointmentTimestamp = new Date(data.dateString)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    appointmentTimestamp.setHours(hours, minutes, 0, 0)

    const resolvedDayName = PRISMA_DAYS_ARRAY[appointmentTimestamp.getDay()]

    await prisma.$transaction(async (tx) => {
      await tx.appointment.create({
        data: {
          patientId: context.session.user.id, // Double-check if your middleware uses context.auth.user.id instead!
          doctorId: data.doctorId,
          date: appointmentTimestamp,
          status: AppointmentStatus.Upcoming,
        },
      })

      await tx.doctorSlots.update({
        where: {
          doctorId_day_startTimeMinutes: {
            doctorId: data.doctorId,
            startTimeMinutes: totalMinutes,
            day: resolvedDayName,
          },
        },
        data: { isBooked: true },
      })
    })

    return { success: true }
  })
