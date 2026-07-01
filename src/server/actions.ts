'use server'
// import { queryOptions } from '@tanstack/react-query'
import { prisma } from '#/db'
import { authFnMiddleware } from '#/middlewares/auth'
import {
  addOrUpdateMedicineSchema,
  addPatientMedicineSearch,
  getDoctorSlotsSchema,
  // addPatientSchema,
  medicineSearchSchema,
  patientSearchSchema,
  submitPrescriptionSchema,
  updateMedicineSchema,
  updatePrescriptionSchema,
  upsertDoctorSlotsSchema,
} from '#/schemas/auth'
import { createServerFn } from '@tanstack/react-start'
import { Roles } from '#/generated/prisma/enums'
import { authClient } from '#/lib/auth-client'
import { queryOptions } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { showToast } from '#/lib/showToast'

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

export const getDoctorSlots = createServerFn({ method: 'GET' })
  .validator(getDoctorSlotsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const records = await prisma.doctorSlots.findMany({
      where: {
        doctorId: data.doctorId,
      },
      select: {
        day: true,
        startTimeMinutes: true,
        endTimeMinutes: true,
      },
      orderBy: { day: 'asc' },
    })

    // Converts total minutes into "HH:MM" for both start and end bounds
    const items = records.map((record) => {
      const startH = Math.floor(record.startTimeMinutes / 60)
        .toString()
        .padStart(2, '0')
      const startM = (record.startTimeMinutes % 60).toString().padStart(2, '0')

      const endH = Math.floor(record.endTimeMinutes / 60)
        .toString()
        .padStart(2, '0')
      const endM = (record.endTimeMinutes % 60).toString().padStart(2, '0')

      return {
        day: record.day,
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
      }
    })

    return { items }
  })

export const upsertDoctorSlots = createServerFn({ method: 'POST' })
  .validator(upsertDoctorSlotsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const doctorId = context.session.user.id

    if (!doctorId) {
      throw new Error('Unauthorized operational access.')
    }

    // Isolate operations inside a database transaction block
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Purge current rows for this specific provider
      await tx.doctorSlots.deleteMany({
        where: { doctorId },
      })

      // Step B: If new slots exist, write the updated record array matrix
      if (data.slots.length > 0) {
        return await tx.doctorSlots.createMany({
          data: data.slots.map((slot) => ({
            doctorId,
            day: slot.day,
            startTimeMinutes: slot.startTimeMinutes,
            endTimeMinutes: slot.endTimeMinutes,
          })),
        })
      }

      return { count: 0 }
    })
    return { success: true, recordsUpdated: result.count }
  })
