import { formatDateToDMY, type SinglePrescription } from '#/lib/types' // Adjusted to match your absolute path mapping
import { Button } from './ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { dosageTime } from '@/data/dosageTime'
import { calculateAge } from './datePicker'
import { PrescriptionPrintTemplate } from '@/components/prescriptionPrintTemplate'
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { getDownloadUrl, type UploadedFileInfo } from '#/lib/vercel-action'
import { DownloadCloudIcon } from 'lucide-react'
import { toast } from 'sonner'

interface MedicineItem {
  medicineContentEnglish: string
  medicineContentUrdu: string
  Dosage: string
  idTime: string
}

interface PescriptionDrawerProps {
  prescription: SinglePrescription
  children: React.ReactNode
}

export function PescriptionDrawer({
  prescription,
  children,
}: PescriptionDrawerProps) {
  const medicines: MedicineItem[] = (() => {
    if (!prescription.prescriptionsContent) return []
    if (typeof prescription.prescriptionsContent === 'string') {
      try {
        return JSON.parse(prescription.prescriptionsContent)
      } catch (e) {
        console.error('Failed parsing prescription text content:', e)
        return []
      }
    }
    return prescription.prescriptionsContent
  })()

  const imagesAttached: UploadedFileInfo[] = (() => {
    if (!prescription.patientImages) return []
    if (typeof prescription.patientImages === 'string') {
      try {
        return JSON.parse(prescription.patientImages)
      } catch (e) {
        console.error('Failed parsing prescription attachments string:', e)
        return []
      }
    }
    return prescription.patientImages as UploadedFileInfo[]
  })()

  const atAge = () => {
    const birthDayAge = calculateAge(prescription.patientAge) || 0
    const prescriptionAge = calculateAge(prescription.createdPrescription) || 0
    return birthDayAge - prescriptionAge
  }

  const componentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Prescription-${(prescription.patientName || 'Records').replace(/\s+/g, '-')}`,
  })

  const handleDownloadUrl = async (fileUrl: string) => {
    try {
      toast.loading('Preparing download...', { id: 'download-status' })
      const result = await getDownloadUrl({ data: { fileUrl } })

      if (!result.ok) {
        toast.error('Download Failed: File inaccessible.', {
          id: 'download-status',
        })
        return
      }
      const blob = await result.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const filename = fileUrl.split('/').pop() || 'prescription-attachment'
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', filename)

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      toast.success('Download complete!', { id: 'download-status' })
    } catch (error) {
      console.error('Client download error:', error)
      toast.error('An unexpected download error occurred.', {
        id: 'download-status',
      })
    }
  }

  return (
    <>
      <Drawer direction="right">
        <DrawerTrigger asChild>{children}</DrawerTrigger>

        <DrawerContent className="h-full w-full sm:min-w-[33.333333%] sm:w-auto ml-auto flex flex-col rounded-none">
          <DrawerHeader>
            <DrawerTitle>
              {prescription.medCareId || 'No ID Assigned'}
            </DrawerTitle>
            <DrawerDescription>
              {formatDateToDMY(prescription.createdPrescription)}
            </DrawerDescription>
          </DrawerHeader>

          <div className="no-scrollbar overflow-y-auto px-4 flex-1">
            <Card className="mt-3">
              <CardHeader className="px-3 text-xs"> Details:</CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                  <table className="w-full text-sm text-left text-body">
                    <tbody>
                      <tr className="border-2 text-center">
                        <td className="bg-gray-600 font-bold px-4 py-4">
                          Med Care Id
                        </td>
                        <td>{prescription.medCareId || 'N/A'}</td>
                      </tr>
                      <tr className="border-2 text-center">
                        <td className="bg-gray-600 font-bold px-4 py-4">
                          Patient Name
                        </td>
                        <td>{prescription.patientName || 'Anonymous'}</td>
                      </tr>
                      <tr className="border-2 text-center">
                        <td className="bg-gray-600 font-bold px-4 py-4">
                          Patient Age / Gender
                        </td>
                        <td>
                          {atAge()} yrs{' '}
                          {prescription.patientGender
                            ? prescription.patientGender.charAt(0)
                            : 'U'}
                        </td>
                      </tr>
                      <tr className="border-2 text-center">
                        <td className="bg-gray-600 font-bold px-4 py-4">
                          Doctor Name
                        </td>
                        <td>{prescription.doctorName || 'N/A'}</td>
                      </tr>
                      <tr className="border-2 text-center">
                        <td className="bg-gray-600 font-bold px-4 py-4">
                          Prescription Date
                        </td>
                        <td>
                          {formatDateToDMY(prescription.createdPrescription)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-3">
              <CardTitle className="px-3 pt-3 text-sm font-semibold">
                Doctor Notes
              </CardTitle>
              <CardContent className="p-3 text-sm text-muted-foreground">
                {prescription.doctorNote ||
                  'No diagnostic remarks written down.'}
              </CardContent>
            </Card>

            <Card className="mt-3">
              <CardTitle className="px-3 pt-3 text-sm font-semibold">
                Medicine Details
              </CardTitle>
              <CardContent className="p-3">
                {medicines.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No medicines written down in this file log record.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-base border">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted text-xs uppercase tracking-wider border-b text-center">
                        <tr>
                          <th className="px-4 py-2">Medicine / Formula</th>
                          <th className="px-4 py-2">Dosage</th>
                          <th className="px-4 py-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((med, index) => (
                          <tr
                            key={index}
                            className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="flex justify-between">
                              <span className="px-4 py-2.5">
                                {med.medicineContentEnglish}
                              </span>
                              <span className="px-4 py-2.5 text-right text-base dir-rtl font-arabic">
                                {med.medicineContentUrdu}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground font-mono text-center">
                              {med.Dosage}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground font-mono flex justify-between">
                              <span>
                                {dosageTime.find((d) => d.time === med.idTime)
                                  ?.time || '1+1+1'}
                              </span>
                              <span>
                                {dosageTime.find((d) => d.time === med.idTime)
                                  ?.uTime || 'ایک صبح، ایک دوپہر، ایک رات'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-3">
              <CardTitle className="px-3 pt-3 text-sm font-semibold">
                Attached Files
              </CardTitle>
              <CardContent className="p-3">
                {imagesAttached.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No images attached in this file log record.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-base border">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted text-xs uppercase tracking-wider border-b text-center">
                        <tr>
                          <th className="px-4 py-2">Attachments</th>
                          <th className="sr-only">Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {imagesAttached.map((img, index) => (
                          <tr
                            key={index}
                            className="flex justify-between items-center border-b last:border-0 hover:bg-muted/30 transition-colors w-full"
                          >
                            <td className="px-4 py-2.5 min-w-0 flex-1 text-left">
                              <span className="font-medium text-foreground block truncate">
                                {img.name}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 cursor-pointer text-blue-600 flex shrink-0 items-center">
                              <DownloadCloudIcon
                                className="h-5 w-5"
                                onClick={() => handleDownloadUrl(img.url)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DrawerFooter>
            <Button
              className="bg-blue-500 hover:bg-blue-500/80 text-white cursor-pointer"
              onClick={() => handlePrint()}
            >
              Print Prescription
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="hidden">
        <PrescriptionPrintTemplate
          ref={componentRef}
          patientData={{
            name: prescription.patientName || 'Anonymous',
            medCareId: prescription.medCareId || 'N/A',
            age: atAge(),
            phone: prescription.patientPhone || 'N/A',
            gender: String(prescription.patientGender || 'Not Specified'),
          }}
          doctorNote={prescription.doctorNote || ''}
          createdPrescription={prescription.createdPrescription}
          medicines={medicines}
          doctorData={{
            qualification:
              prescription.doctorQualification ||
              'Doctor Qualification Not Provided',
            cellNo: prescription.doctorCellNo || 'Doctor Cell No. Not Provided',
            user: {
              name: prescription.doctorName || 'Doctor Name',
            },
          }}
          printType="Copy"
        />
      </div>
    </>
  )
}
