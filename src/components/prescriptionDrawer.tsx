import { formatDateToDMY } from '@/lib/types'
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
import { Gender } from '@/generated/prisma/browser'

interface MedicineItem {
  medicineContentEnglish: string
  medicineContentUrdu: string
  Dosage: string
  idTime: string
}
interface PescriptionDrawerProps {
  med_care_id: string
  createdPrescription: Date
  prescriptionsContent: string | MedicineItem[]
  doctorName: string
  doctorQualification: string
  doctorCellNo: string
  doctorNote: string
  patientName: string
  patientAge: Date
  patientPhone: string
  patientGender: Gender
  children: React.ReactNode
}

export function PescriptionDrawer({
  createdPrescription,
  prescriptionsContent,
  med_care_id,
  doctorName,
  doctorQualification,
  doctorCellNo,
  doctorNote,
  patientName,
  patientAge,
  patientPhone,
  patientGender,
  children,
}: PescriptionDrawerProps) {
  const medicines: MedicineItem[] = (() => {
    if (!prescriptionsContent) return []
    if (typeof prescriptionsContent === 'string') {
      try {
        return JSON.parse(prescriptionsContent)
      } catch (e) {
        console.error('Failed parsing prescription text content:', e)
        return []
      }
    }
    return prescriptionsContent
  })()
  const atAge = () => {
    const birthDayAge = calculateAge(patientAge) || 0
    const prescriptionAge = calculateAge(createdPrescription) || 0
    const getAge = birthDayAge - prescriptionAge
    return getAge
  }
  const componentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Prescription-${patientName?.replace(/\s+/g, '-')}`,
  })

  return (
    <>
      <Drawer direction="right">
        <DrawerTrigger asChild>{children}</DrawerTrigger>

        <DrawerContent className="h-full w-full sm:min-w-[33.333333%] sm:w-auto ml-auto flex flex-col rounded-none">
          <DrawerHeader>
            <DrawerTitle>{med_care_id}</DrawerTitle>
            <DrawerDescription>
              {formatDateToDMY(createdPrescription)}
            </DrawerDescription>
          </DrawerHeader>
          <div className="no-scrollbar overflow-y-auto px-4 flex-1">
            <Card className="  mt-3">
              <CardHeader className=" px-3 text-xs"> Details:</CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                  <table className="w-full text-sm text-left text-body">
                    <tr className="  border-2 text-center">
                      <td
                        scope="col"
                        className=" bg-gray-600 font-bold px-4 py-4"
                      >
                        Med Care Id
                      </td>
                      <td> {med_care_id} </td>
                    </tr>
                    <tr className="  border-2 text-center">
                      <td
                        scope="col"
                        className="  bg-gray-600 font-bold px-4 py-4"
                      >
                        Patient Name
                      </td>
                      <td> {patientName}</td>
                    </tr>
                    <tr className="  border-2 text-center">
                      <td
                        scope="col"
                        className="  bg-gray-600 font-bold px-4 py-4"
                      >
                        Patient Age / Gender
                      </td>
                      <td>
                        {' '}
                        {atAge()} yrs {patientGender.charAt(0)}
                      </td>
                    </tr>
                    <tr className="  border-2 text-center">
                      <td
                        scope="col"
                        className="  bg-gray-600 font-bold  px-4 py-4"
                      >
                        Doctor Name
                      </td>
                      <td> {doctorName} </td>
                    </tr>
                    <tr className="  border-2 text-center">
                      <td
                        scope="col"
                        className="  bg-gray-600 font-bold  px-4 py-4"
                      >
                        Prescription Date
                      </td>
                      <td> {formatDateToDMY(createdPrescription)} </td>
                    </tr>
                  </table>
                </div>
              </CardContent>
            </Card>
            <Card className=" mt-3">
              <CardTitle className="px-3 pt-3 text-sm font-semibold">
                Doctor Notes
              </CardTitle>
              <CardContent className="p-3 text-sm text-muted-foreground">
                {doctorNote}
              </CardContent>
            </Card>
            <Card className=" mt-3">
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
                          <th className="px-4 py-2 ">Dosage</th>
                          <th className="px-4 py-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((med, index) => (
                          <tr
                            key={index}
                            className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className=" flex justify-between">
                              <span className="px-4 py-2.5 ">
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
                                  ?.time ||
                                  dosageTime[0]?.time ||
                                  '1+1+1'}
                              </span>
                              <span>
                                {dosageTime.find((d) => d.time === med.idTime)
                                  ?.uTime ||
                                  dosageTime[0]?.uTime ||
                                  'ایک صبح، ایک دوپہر، ایک رات'}
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
          </div>
          <DrawerFooter>
            <Button
              className=" bg-blue-500 hover:bg-blue-500/80 text-white cursor-pointer"
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
            name: patientName,
            med_care_id: med_care_id,
            age: atAge(),
            phone: patientPhone,
            gender: patientGender || 'Not Specified',
          }}
          doctorNote={doctorNote}
          createdPrescription={createdPrescription}
          medicines={medicines}
          doctorData={{
            qualification:
              doctorQualification || 'Doctor Qualification Not Provided',
            cellNo: doctorCellNo || 'Doctor Cell No. Not Provided',
            user: {
              name: doctorName || 'Doctor Name',
            },
          }}
          printType="Copy"
        />
      </div>
    </>
  )
}
