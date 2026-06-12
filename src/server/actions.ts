'use server'

import { prisma } from '#/db'
import { authFnMiddleware } from '#/middlewares/auth'
import { addPatientSchema } from '#/schemas/auth'
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
