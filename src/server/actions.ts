'use server'
import { queryOptions } from '@tanstack/react-query'
import { prisma } from '#/db'
import { authFnMiddleware } from '#/middlewares/auth'
import {
  addOrUpdateMedicineSchema,
  addPatientMedicineSearch,
  addPatientSchema,
  medicineSearchSchema,
  patientSearchSchema,
  submitPrescriptionSchema,
  updateMedicineSchema,
  updatePatientSchema,
  updatePrescriptionSchema,
} from '#/schemas/auth'
import { createServerFn } from '@tanstack/react-start'

export const addPatientAction = createServerFn({ method: 'POST' })
  .validator(addPatientSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    return await prisma.$transaction(async (tx) => {
      const currentYear = new Date().getFullYear()
      const lastPatientInYear = await tx.patientRecord.findFirst({
        where: {
          med_care_id: {
            startsWith: `MC-${currentYear}-`,
          },
        },
        orderBy: {
          med_care_id: 'desc',
        },
        select: {
          med_care_id: true,
        },
      })
      let nextSerial = 1

      if (lastPatientInYear && lastPatientInYear.med_care_id) {
        const parts = lastPatientInYear.med_care_id.split('-')
        const lastSerial = parseInt(parts[2], 10)
        if (!isNaN(lastSerial)) {
          nextSerial = lastSerial + 1
        }
      }

      const paddedSerial = String(nextSerial).padStart(5, '0')
      const generatedMedCareId = `MC-${currentYear}-${paddedSerial}`

      const newPatient = await tx.patientRecord.create({
        data: {
          name: data.name,
          email: data.email,
          age: data.age,
          med_care_id: generatedMedCareId,
          gender: data.gender,
          phone: data.phone,
        },
      })
      return newPatient
    })
  })

export const getPatientPrescriptions = createServerFn({ method: 'GET' })
  .validator((medCareId: string) => medCareId)
  .middleware([authFnMiddleware])
  .handler(async ({ data: medCareId }) => {
    const prescription = await prisma.patientPrescription.findMany({
      where: {
        med_care_id: medCareId,
      },
      orderBy: {
        createdPrescription: 'desc',
      },
      select: {
        id: true,
        med_care_id: true,
        prescriptionsContent: true,
        createdPrescription: true,
        prescriptionSubmitted: true,
        relatedImages: true,
        note: true,
        user: {
          select: {
            name: true,
            qualification: true,
            cellNo: true,
          },
        },
        patientRecord: {
          select: {
            name: true,
            age: true,
            phone: true,
            gender: true,
            email: true,
          },
        },
      },
    })
    if (!prescription) {
      throw new Error('Prescription record not found')
    }
    return prescription.map((p) => ({
      id: p.id,
      med_care_id: p.med_care_id,
      prescriptionsContent: p.prescriptionsContent,
      createdPrescription: p.createdPrescription,
      prescriptionSubmitted: p.prescriptionSubmitted,
      doctorName: p.user?.name || 'Unknown Doctor',
      doctorQualification: p.user?.qualification || 'Unknown Qualification',
      doctorCellNo: p.user?.cellNo || 'Unknown Cell Number',
      doctorNote: p.note || 'No note available',
      patientName: p.patientRecord?.name || ' Unknown Patient',
      patientAge: p.patientRecord?.age || new Date(),
      patientEmail: p.patientRecord?.email,
      patientPhone: p.patientRecord?.phone || 'Unknown Phone',
      patientGender: p.patientRecord?.gender || 'Unknown Gender',
      patientImages: p.relatedImages,
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

export const updatePatientAction = createServerFn({ method: 'POST' })
  .validator(updatePatientSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    return await prisma.$transaction(async (tx) => {
      const newPatient = await tx.patientRecord.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          age: data.age,
          phone: data.phone,
          gender: data.gender,
        },
      })
      return newPatient
    })
  })

export const addPrescriptionSubmission = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(submitPrescriptionSchema)
  .handler(async ({ data }: { data: any }) => {
    return await prisma.$transaction(async (tx) => {
      const newPrescription = await tx.patientPrescription.create({
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
    const PAGE_SIZE = data.rowsPerPage
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
    const PAGE_SIZE = data.pagePerRows

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
                    med_care_id: {
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
                    phone: {
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
      prisma.patientRecord.findMany({
        where: whereClause,
        skip: (currentPage - 1) * PAGE_SIZE, // Skips records based on active index page
        take: PAGE_SIZE, //
        orderBy: { id: 'asc' },
      }),
      prisma.patientRecord.count({ where: whereClause }),
    ])

    return { items, totalCount }
  })
