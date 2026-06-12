import { createServerFn } from '@tanstack/react-start'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { authFnMiddleware } from '@/middlewares/auth'
import { prisma } from '@/db'
import { formatDateToDMY } from '@/lib/types'
import { AppPagination } from './appPagination'
import { useEffect, useState, useTransition } from 'react'
import { PescriptionDrawer } from './prescriptionDrawer'

var o_PAGE_SIZE = 8

// Server Function to fetch targeted prescription data logs
export const getPatientPrescriptions = createServerFn({ method: 'GET' })
  .inputValidator((medCareId: string) => medCareId)
  .middleware([authFnMiddleware])
  .handler(async ({ data: medCareId }) => {
    const prescriptions = await prisma.patientPrescription.findMany({
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
          },
        },
      },
    })

    return prescriptions.map((p) => ({
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
      patientPhone: p.patientRecord?.phone || 'Unknown Phone',
      patientGender: p.patientRecord?.gender || 'Unknown Gender',
    }))
  })

export default function GetPrescriptions({ medCareId }: { medCareId: string }) {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!medCareId || medCareId.trim() === '') {
      setPrescriptions([])
      return
    }

    async function loadPrescriptions() {
      try {
        setIsLoading(true)
        const data = await getPatientPrescriptions({ data: medCareId })
        setPrescriptions(data)
        setPage(1)
      } catch (error) {
        console.error('Failed to load patient prescriptions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPrescriptions()
  }, [medCareId])

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setPage(newPage)
    })
  }

  const totalCount = prescriptions.length
  const paginatedPrescriptions = prescriptions.slice(
    (page - 1) * o_PAGE_SIZE,
    page * o_PAGE_SIZE,
  )

  return (
    <>
      <div>
        <Card className="">
          <CardHeader>
            <CardTitle className="text-sm flex w-full">
              <span> Patient Prescription Records:</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto shadow-xs rounded-t-2xl border">
              <table className="w-full text-sm text-left text-body">
                <thead className="text-sm text-body bg-neutral-600 border-b">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium dark:text-primary text-secondary"
                    >
                      MED CARE ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium dark:text-primary text-secondary"
                    >
                      Doctor Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium dark:text-primary text-secondary"
                    >
                      Created Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium dark:text-primary text-secondary"
                    >
                      Prescription Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium text-right"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-indigo-300/70 text-sm "
                      >
                        Loading transaction histories...
                      </td>
                    </tr>
                  ) : (
                    paginatedPrescriptions.map((prescription) => (
                      <tr
                        key={prescription.id}
                        className="border-b hover:bg-neutral-600/50 transition-colors"
                      >
                        <td className="px-6 py-3 text-primary ">
                          {prescription.med_care_id}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {prescription.doctorName}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {formatDateToDMY(prescription.createdPrescription)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 rounded text-xs ${
                              prescription.prescriptionSubmitted
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {prescription.prescriptionSubmitted
                              ? 'Submitted'
                              : 'Pending'}
                          </span>
                        </td>

                        <td className="px-6 py-3 flex items-center justify-end gap-3 whitespace-nowrap">
                          {prescription.prescriptionSubmitted ? (
                            <PescriptionDrawer
                              createdPrescription={
                                prescription.createdPrescription
                              }
                              prescriptionsContent={
                                prescription.prescriptionsContent
                              }
                              med_care_id={prescription.med_care_id}
                              doctorName={prescription.doctorName}
                              doctorQualification={
                                prescription.doctorQualification
                              }
                              doctorCellNo={prescription.doctorCellNo}
                              doctorNote={prescription.doctorNote}
                              patientName={prescription.patientName}
                              patientAge={prescription.patientAge}
                              patientPhone={prescription.patientPhone}
                              patientGender={prescription.patientGender}
                            >
                              <span className=" bg-transparent hover:bg-transparent cursor-pointer font-medium text-green-500 hover:underline">
                                View Details
                              </span>
                            </PescriptionDrawer>
                          ) : (
                            <>
                              <span className=" bg-transparent hover:bg-transparent cursor-pointer font-medium text-yellow-400 mr-4 hover:underline">
                                Open
                              </span>
                              <PescriptionDrawer
                                createdPrescription={
                                  prescription.createdPrescription
                                }
                                prescriptionsContent={
                                  prescription.prescriptionsContent
                                }
                                med_care_id={prescription.med_care_id}
                                doctorName={prescription.doctorName}
                                doctorQualification={
                                  prescription.doctorQualification
                                }
                                doctorCellNo={prescription.doctorCellNo}
                                doctorNote={prescription.doctorNote}
                                patientName={prescription.patientName}
                                patientAge={prescription.patientAge}
                                patientPhone={prescription.patientPhone}
                                patientGender={prescription.patientGender}
                              >
                                <span className=" bg-transparent hover:bg-transparent cursor-pointer font-medium text-green-500 hover:underline">
                                  View Details
                                </span>
                              </PescriptionDrawer>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {!isLoading && prescriptions.length === 0 && (
                <div className="text-center py-8 text-indigo-300/70 text-sm list-none italic">
                  No records match your selection criteria.
                </div>
              )}
            </div>

            {!isLoading && totalCount > o_PAGE_SIZE && (
              <AppPagination
                page={page}
                totalCount={totalCount}
                pageSize={o_PAGE_SIZE}
                isPending={isPending}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
