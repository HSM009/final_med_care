import React from 'react'
import { dosageTime } from '@/data/dosageTime'
import { formatDateToDMY } from '@/lib/types'

interface PrintProps {
  patientData: {
    name: string
    med_care_id: string
    age: Number
    phone: string
    gender: string
  }
  doctorNote: string
  createdPrescription: Date
  medicines: any[]
  doctorData: {
    qualification: string
    cellNo: string
    user: {
      name: string
    }
  }
  printType: string
}

export const PrescriptionPrintTemplate = React.forwardRef<
  HTMLDivElement,
  PrintProps
>(
  (
    {
      patientData,
      createdPrescription,
      medicines,
      doctorData,
      printType,
      doctorNote,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className="p-12 text-black bg-white min-h-[297mm] w-[210mm] flex flex-col justify-between font-sans"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden opacity-[0.08]">
          <span className="text-center -rotate-45 text-7xl font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            {printType}
          </span>
        </div>
        <div>
          <div className="flex justify-between items-start border-b-2 border-blue-600 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 tracking-wide">
                MEDCARE CLINIC
              </h1>
              <p className="text-sm text-gray-500">
                123 Health Avenue, Islamabad, Pakistan
              </p>
              <p className="text-sm text-gray-500">Tel: +92 51 1234567</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">
                {doctorData.user.name}
              </h2>
              <p className="text-xs text-gray-500">
                {doctorData.qualification}
              </p>
              <p className="text-xs text-gray-400">Ph: {doctorData.cellNo}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 my-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
            <div>
              <strong>Med Care ID:</strong>{' '}
              <p className="text-gray-700">{patientData.med_care_id}</p>
            </div>
            <div>
              <strong>Patient Name:</strong>{' '}
              <p className="text-gray-700">{patientData.name}</p>
            </div>
            <div>
              <strong>Age / Gender:</strong>{' '}
              <p className="text-gray-700">
                {patientData.age.toString()} Yrs{' '}
                {patientData.gender.charAt(0).toUpperCase() +
                  patientData.gender.slice(1).toLowerCase()}
              </p>
            </div>
            <div className="text-right">
              <strong>Date:</strong>{' '}
              <p className="text-gray-700">
                {formatDateToDMY(createdPrescription)}
              </p>
            </div>
          </div>
          <div className=" flex grid-cols-1 gap-4 my-6 p-4">
            <div className="text-4xl font-serif font-bold text-blue-900 my-4 select-none">
              R
              <span className="text-2xl font-sans font-light text-blue-600">
                x
              </span>
            </div>
            <div className="text-sm ml-4 text-gray-700 whitespace-pre-wrap">
              <p className=" font-bold text-lg">Doctor Note:</p>
              <p>{doctorNote}</p>
            </div>
          </div>
          <table className="w-full text-left mt-2">
            <thead>
              <tr className="border-b-2 border-gray-300 text-sm font-semibold uppercase text-gray-600">
                <th className="py-2 w-[10%]">#</th>
                <th className="py-2 w-[45%]">Medicine / Formula</th>
                <th className="py-2 w-[20%] pr-6">Dosage Schedule</th>
                <th className="py-2 w-[25%] text-right">Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-base">
              {medicines.map((med, index) => (
                <tr key={med.id} className="align-middle">
                  <td className="text-gray-500 font-medium">{index + 1}</td>
                  <td className="">
                    <div className="font-bold text-sm text-gray-900">
                      {med.medicineContentEnglish}
                    </div>
                    <div
                      className="text-xs text-gray-500 font-medium mt-0.5"
                      dir="rtl"
                    >
                      {med.medicineContentUrdu}
                    </div>
                  </td>
                  <td className=" text-gray-700 text-sm font-medium pr-6">
                    {med.Dosage || '—'}
                  </td>
                  <td className=" w-full bg-blue-50 text-right inline-block rounded border border-blue-200">
                    <span className=" text-black font-bold px-2.5  text-xs">
                      {med.idTime || '1+1+1'}
                    </span>
                    <br />
                    <span
                      className="  text-black font-bold px-2.5  text-xs"
                      dir="rtl" // Added RTL support so Urdu text reads naturally left-to-right/right-to-left where appropriate
                    >
                      {dosageTime.find(
                        (u) => u.time === medicines[index]?.idTime,
                      )?.uTime || 'ایک صبح، ایک دوپہر، ایک رات'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {medicines.length === 0 && (
            <div className="text-center py-12 text-gray-400 italic">
              No medications specified for this print output sheet.
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 pt-8 mt-12 flex justify-between items-end text-xs text-gray-400">
          <div>
            <p>• Substitutions allowed unless specifically cross-indicated.</p>
            <p>• Valid for 3 months from the date of issuance printed above.</p>
          </div>
          <div className="text-center w-48 border-t border-dashed border-gray-400 pt-2 mt-12">
            <p className="text-gray-600 font-semibold text-sm">
              Authorized Signature
            </p>
          </div>
        </div>
      </div>
    )
  },
)

PrescriptionPrintTemplate.displayName = 'PrescriptionPrintTemplate'
