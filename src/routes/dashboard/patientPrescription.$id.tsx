import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '#/components/ui/button'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { type NavPatientProps, prescriptionButtons } from '#/lib/types'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  MedicineDialog,
  type MedicineItem,
} from '#/components/addPatientMedicineDialog'
import { useRef, useState } from 'react'
import DropdownMenuDosageSwitcher from '#/components/ui/dropdown-menu2'
import { useReactToPrint } from 'react-to-print'
import { PrescriptionPrintTemplate } from '#/components/prescriptionPrintTemplate'
import { getSessionFn } from '#/data/session'
import { calculateAge } from '#/components/datePicker'
import { SubmitPrescriptionDialog } from '#/components/submitPrecriptionDialog'
import { FileUploader } from '#/components/ui/file-uploader'

import { type UploadedFileInfo } from '#/lib/file-upload-action.ts'

export const Route = createFileRoute('/dashboard/patientPrescription/$id')({
  loader: async ({}) => {
    const session = await getSessionFn()
    return {
      user: session.user,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useLoaderData()
  const [attachments, setAttachments] = useState<File[]>([])
  const [uploadedAttachments, setUploadedAttachments] = useState<
    UploadedFileInfo[]
  >([])

  const componentRef = useRef<HTMLDivElement>(null)
  const { name, med_care_id, age, phone, gender } =
    Route.useSearch() as NavPatientProps

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Prescription-${name?.replace(/\s+/g, '-')}`,
  })

  const [selectedMedicines, setSelectedMedicines] = useState<MedicineItem[]>([])

  const handleAddMedicine = (newMed: MedicineItem) => {
    setSelectedMedicines((prev: any) => {
      const alreadyAdded = prev.some((med: any) => med.id === newMed.id)
      if (alreadyAdded) {
        toast.warning(
          `${newMed.medicineContentEnglish} ${newMed.Dosage} already added to prescription.`,
        )
        return prev
      }
      return [...prev, newMed]
    })
  }

  const updateMedicineDosage = (id: number, newDosage: string) => {
    setSelectedMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, idTime: newDosage } : med)),
    )
  }

  const handleRemoveMedicine = (id: number) => {
    setSelectedMedicines((prev: any) =>
      prev.filter((med: any) => med.id !== id),
    )
  }

  const [prescriptionState, setPrescriptionState] = useState(false)
  const [selectedPrescriptionType, setSelectedPrescriptionType] = useState('')

  const atAge = (val: Date) => {
    return calculateAge(val)
  }

  const [doctorNote, setDoctorNote] = useState<string>('')

  return (
    <div className="">
      <div className=" py-2 absolute top-12 left-4">
        <Link
          to="/dashboard/viewPatients"
          search={{ search: name || '' }}
          className={buttonVariants({ variant: 'secondary' })}
        >
          <ArrowLeft className=" size-4" /> Back to Patient List
        </Link>
      </div>
      <div className="text-3xl font-bold text-white mb-4 text-center">
        Patient Prescription
      </div>
      {!prescriptionState && (
        <>
          <Card className="mt-6">
            <CardContent>
              <div className=" flex gap-3 justify-center">
                <Card className=" w-1/4 bg-secondary/50 border-secondary/50 border-2">
                  <CardHeader>
                    <CardTitle className=" left-0.5 text-xs">
                      Med Care Id:
                    </CardTitle>
                  </CardHeader>
                  <CardContent className=" text-3xl text-center text-blue-500">
                    {med_care_id}
                  </CardContent>
                </Card>
                <Card className=" w-1/4 bg-secondary/50 border-secondary/50 border-2">
                  <CardHeader>
                    <CardTitle className=" left-0.5 text-xs">
                      Patient Name:
                    </CardTitle>
                  </CardHeader>
                  <CardContent className=" text-3xl text-center text-blue-500">
                    {name}
                  </CardContent>
                </Card>
                <Card className=" w-1/4 bg-secondary/50 border-secondary/50 border-2">
                  <CardHeader>
                    <CardTitle className=" left-0.5 text-xs">
                      Patient Age / Gender:
                    </CardTitle>
                  </CardHeader>
                  <CardContent className=" text-3xl text-center text-blue-500">
                    {(() => {
                      const numericAge = atAge(age)
                      if (numericAge === null) return 'N/A'
                      return numericAge > 1
                        ? `${numericAge} Yrs`
                        : `${numericAge} Yr`
                    })()}{' '}
                    {gender.toUpperCase().charAt(0) +
                      gender.slice(1).toLowerCase()}
                  </CardContent>
                </Card>
                <Card className=" w-1/4 bg-secondary/50 border-secondary/50 border-2">
                  <CardHeader>
                    <CardTitle className=" left-0.5 text-xs">
                      Patient Phone:
                    </CardTitle>
                  </CardHeader>
                  <CardContent className=" text-3xl text-center text-blue-500">
                    {phone}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className=" mt-6">
            <Card className=" border-secondary/50 border-2">
              <CardHeader>
                <CardTitle className="text-xs flex w-full">
                  <span>Doctor Note:</span>
                </CardTitle>
                <CardContent className=" py-3">
                  <textarea
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    placeholder="Type patient clinical observations, recommendations, or case notes here..."
                    className="w-full min-h-25 p-3 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 resize-y"
                  />
                </CardContent>
              </CardHeader>
            </Card>
          </div>

          <div className=" w-full ">
            <Card className="  border-secondary/50 border-2 mt-6">
              <CardHeader>
                <CardTitle className="text-xs flex w-full">
                  <span> Patient Medicine:</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=" overflow-x-auto shadow-xs rounded-t-2xl border">
                  <table className=" w-full table-fixed text-sm text-left text-body justify-center">
                    <thead className="text-sm text-body bg-neutral-600 border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium dark:text-primary text-secondary">
                          Sr No.
                        </th>
                        <th className="px-4 py-3 font-medium dark:text-primary text-secondary">
                          Medicine Name English
                        </th>
                        <th className="px-4 py-3 font-medium dark:text-primary text-secondary">
                          Medicine Name Urdu
                        </th>
                        <th className="px-4 py-3 font-medium dark:text-primary text-secondary">
                          Dosage
                        </th>
                        <th className="px-4 py-3 font-medium dark:text-primary text-secondary">
                          Times Per Day
                        </th>
                        <th className="  px-6 py-3 font-medium right-0 text-right ">
                          <MedicineDialog onSelectMedicine={handleAddMedicine}>
                            <Button className=" font-medium cursor-pointer">
                              Add Medicine Button
                            </Button>
                          </MedicineDialog>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMedicines.map((medicine: any, index: any) => (
                        <tr
                          key={medicine.id}
                          className="border-neutral-800 hover:bg-neutral-800/40 transition-colors"
                        >
                          <td className="px-4 py-1 text-neutral-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-1 dark:text-primary text-secondary">
                            {medicine.medicineContentEnglish}
                          </td>
                          <td className="px-4 py-1 dark:text-primary text-secondary">
                            {medicine.medicineContentUrdu}
                          </td>
                          <td className="px-4 py-1 dark:text-primary text-secondary">
                            {medicine.Dosage}
                          </td>
                          <td className="px-4 py-1 dark:text-primary text-secondary ">
                            <DropdownMenuDosageSwitcher
                              value={medicine.idTime || '1'}
                              onChange={(newTime) =>
                                updateMedicineDosage(medicine.id, newTime)
                              }
                            />
                          </td>
                          <td className="px-4 py-1 text-right">
                            <Button
                              variant="ghost"
                              onClick={() => handleRemoveMedicine(medicine.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 inline-flex items-center justify-center cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedMedicines.length === 0 && (
                    <div className="text-center py-12 text-neutral-500 italic">
                      No medicines have been added to this prescription yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="  border-secondary/50 border-2 mt-6">
              <CardHeader>
                <CardTitle className="text-xs flex w-full">
                  <span> Patient Attachment:</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploader
                  value={attachments}
                  onValueChange={setAttachments}
                  uploadedFiles={uploadedAttachments}
                  onRemoveUploadedFile={(index) => {
                    setUploadedAttachments((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }}
                  dropzoneOptions={{
                    maxFiles: 5,
                    maxSize: 1024 * 1024 * 5, // 5MB limit
                    accept: {
                      'image/*': ['.png', '.jpg', '.jpeg'],
                      'application/pdf': ['.pdf'],
                    },
                  }}
                />
              </CardContent>
            </Card>

            <CardFooter className=" flex justify-center gap-2 mt-8">
              {selectedMedicines.length !== 0 && (
                <>
                  {prescriptionButtons.map((btn) => (
                    <SubmitPrescriptionDialog
                      key={btn.type}
                      prescriptionType={btn.type}
                      med_care_id={med_care_id!}
                      doctorId={user?.id || ''}
                      note={doctorNote}
                      medicinesList={selectedMedicines}
                      prescriptionVal={btn.val}
                      existingUploadedImages={uploadedAttachments}
                      attachments={attachments}
                      onSuccess={(
                        state,
                        prescriptionTypeSelected,
                        finalizedImages,
                      ) => {
                        if (state) {
                          setPrescriptionState(true)
                        }
                        setSelectedPrescriptionType(prescriptionTypeSelected)
                        setUploadedAttachments(finalizedImages)
                        setAttachments([]) // Flush local staged state cache post-upload
                      }}
                    />
                  ))}
                </>
              )}
            </CardFooter>
          </div>
        </>
      )}
      {prescriptionState &&
        (selectedPrescriptionType === prescriptionButtons[0].type ? (
          <Card className="mt-6">
            <CardContent>
              {uploadedAttachments.length > 0 && (
                <p className="text-sm text-green-400 mb-2 font-medium">
                  ✓ {uploadedAttachments.length} file(s) securely staging inside
                  cloud networks.
                </p>
              )}
              <p>
                You have saved the prescription form{' '}
                <span className=" font-bold text-blue-600">
                  ({name.toUpperCase()})
                </span>
                .
              </p>
            </CardContent>
          </Card>
        ) : selectedPrescriptionType === prescriptionButtons[1].type ? (
          <Card className="mt-6">
            <CardContent>
              {uploadedAttachments.length > 0 && (
                <p className="text-xs text-green-400 mt-2 font-medium">
                  ✓ {uploadedAttachments.length} file(s) securely staged in
                  remote cloud storage.
                </p>
              )}
              <p>
                You have successfully submitted the presecription of patient{' '}
                <span className=" font-bold text-blue-600">
                  ({name.toUpperCase()})
                </span>
              </p>
            </CardContent>

            <CardFooter>
              <Button
                className="font-medium cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handlePrint()}
              >
                Print Prescription
              </Button>
            </CardFooter>
          </Card>
        ) : null)}

      <div className="hidden">
        <PrescriptionPrintTemplate
          ref={componentRef}
          patientData={{
            name,
            med_care_id,
            age: atAge(age) || 0,
            gender,
            phone,
          }}
          doctorNote={doctorNote}
          createdPrescription={new Date()}
          medicines={selectedMedicines}
          doctorData={{
            qualification:
              user?.qualification || 'Doctor Qualification Not Provided',
            cellNo: user?.cellNo || 'Doctor Cell No. Not Provided',
            user: {
              name: user?.name || 'Doctor Name',
            },
          }}
          printType="Original"
        />
      </div>
    </div>
  )
}
