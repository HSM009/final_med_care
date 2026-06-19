import { useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { AppPagination } from './appPagination'
import { PescriptionDrawer } from './prescriptionDrawer'
import { formatDateToDMY } from '#/lib/types'
import { patientPrescriptionsQueryOptions } from '#/server/actions'

const o_PAGE_SIZE = 8

interface getPrescriptionProp {
  medCareId: string
  userId: string
  doctorName: string
  doctorQualification: string
  doctorCellNo: string
}

export default function GetPrescriptions({
  medCareId,
  userId,
  doctorName,
  doctorQualification,
  doctorCellNo,
}: getPrescriptionProp) {
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const { data: prescriptions = [], isLoading } = useQuery(
    patientPrescriptionsQueryOptions(medCareId),
  )

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
                          {!prescription.prescriptionSubmitted && (
                            <>
                              <div className="  text-yellow-400 hover:underline cursor-pointer font-medium">
                                <Link
                                  to="/dashboard/patientPrescription"
                                  search={{
                                    id: prescription.id,
                                    name: prescription.patientName,
                                    med_care_id: prescription.med_care_id || '',
                                    age: prescription.patientAge,
                                    phone: prescription.patientPhone,
                                    gender: prescription.patientGender,
                                    email: prescription.patientEmail,
                                    note: prescription.doctorNote,
                                    prescriptionsContent:
                                      prescription.prescriptionsContent
                                        ? JSON.parse(
                                            prescription.prescriptionsContent,
                                          )
                                        : [],
                                    relatedImages: prescription.patientImages
                                      ? JSON.parse(prescription.patientImages)
                                      : [],
                                    doctorName: doctorName,
                                    doctorQualification: doctorQualification,
                                    doctorPhone: doctorCellNo,
                                    doctorId: userId.toString(),
                                  }}
                                >
                                  Open
                                </Link>
                              </div>
                            </>
                          )}
                          <PescriptionDrawer prescription={prescription}>
                            <span className=" bg-transparent hover:bg-transparent cursor-pointer font-medium text-green-500 hover:underline">
                              View Details
                            </span>
                          </PescriptionDrawer>
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
