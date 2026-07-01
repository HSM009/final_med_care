import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  Video,
  Building2,
} from 'lucide-react'

export const Route = createFileRoute('/patientDashboard/appointment')({
  component: RouteComponent,
})

// Types for structured scheduling logic
interface Doctor {
  id: string
  name: string
  specialty: string
  availability: string[]
  fee: string
}

function RouteComponent() {
  // Mock Data Sets
  const specialties = [
    'Cardiology',
    'Dermatology',
    'General Medicine',
    'Pediatrics',
  ]

  const doctors: Doctor[] = [
    {
      id: 'doc1',
      name: 'Dr. Sarah Khan',
      specialty: 'Cardiology',
      availability: ['Mon', 'Wed', 'Fri'],
      fee: 'Rs. 2,500',
    },
    {
      id: 'doc2',
      name: 'Dr. Asif Ali',
      specialty: 'Dermatology',
      availability: ['Tue', 'Thu'],
      fee: 'Rs. 2,000',
    },
    {
      id: 'doc3',
      name: 'Dr. Zainab Bilal',
      specialty: 'General Medicine',
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      fee: 'Rs. 1,500',
    },
    {
      id: 'doc4',
      name: 'Dr. Hamza Tariq',
      specialty: 'Pediatrics',
      availability: ['Mon', 'Thu'],
      fee: 'Rs. 1,800',
    },
  ]

  const timeSlots = [
    '09:00 AM',
    '10:30 AM',
    '11:00 AM',
    '02:00 PM',
    '03:30 PM',
    '04:00 PM',
  ]

  // Form Booking State Vectors
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [visitType, setVisitType] = useState<'clinic' | 'video'>('clinic')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  // Filter doctors list dynamically based on chosen specialization criteria
  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialty) return doctors
    return doctors.filter((doc) => doc.specialty === selectedSpecialty)
  }, [selectedSpecialty])

  // Get current active doctor data payload structure
  const selectedDoctor = useMemo(() => {
    return doctors.find((doc) => doc.id === selectedDoctorId)
  }, [selectedDoctorId])

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctorId || !selectedDate || !selectedTime) return

    // Process form logging / TanStack Mutation executions here
    setIsSubmitted(true)
  }

  if (isSubmitted && selectedDoctor) {
    return (
      <div className="mx-auto max-w-xl text-center p-8 rounded-xl border border-emerald-500/20 bg-white dark:bg-zinc-900 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto size-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Appointment Requested Successfully!
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your reservation request with{' '}
          <strong className="text-zinc-900 dark:text-white">
            {selectedDoctor.name}
          </strong>{' '}
          on{' '}
          <strong className="text-zinc-900 dark:text-white">
            {selectedDate}
          </strong>{' '}
          at{' '}
          <strong className="text-zinc-900 dark:text-white">
            {selectedTime}
          </strong>{' '}
          has been forwarded to the medical desk clearance teams.
        </p>
        <div className="pt-4">
          <button
            onClick={() => {
              setIsSubmitted(false)
              setSelectedDoctorId('')
              setSelectedDate('')
              setSelectedTime('')
              setNotes('')
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            Schedule Another Consultation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title Grid Layer */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Schedule Medical Care
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Select your specialization path, choose verified clinic officers, and
          lock your calendar target.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Side: Booking Configuration Console Engine (2 Columns) */}
        <form
          onSubmit={handleBookAppointment}
          className="lg:col-span-2 space-y-5 p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xs"
        >
          {/* Step 1: Filter Specialty */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="size-3.5 text-emerald-500" /> 1. Medical
              Specialization Department
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {specialties.map((spec) => (
                <button
                  type="button"
                  key={spec}
                  onClick={() => {
                    setSelectedSpecialty(spec)
                    setSelectedDoctorId('') // reset doctor selection on specialty branch shifts
                  }}
                  className={`p-2.5 text-xs font-medium border rounded-lg transition-all text-center cursor-pointer ${
                    selectedSpecialty === spec
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Choose Doctor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="size-3.5 text-emerald-500" /> 2. Available
              Medical Officers
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {filteredDoctors.map((doc) => (
                <button
                  type="button"
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-3.5 flex flex-col items-start gap-1 text-left border rounded-lg transition-all cursor-pointer w-full ${
                    selectedDoctorId === doc.id
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {doc.name}
                  </span>
                  <span className="text-xs text-zinc-400">{doc.specialty}</span>
                  <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50 text-[11px] text-zinc-400 font-normal">
                    <span>Days: {doc.availability.join(', ')}</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {doc.fee}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Schedule Date and Time Configuration */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 text-emerald-500" /> 3. Target
                Date Selector
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min="2026-06-30" // Locks selection limits below current timeline thresholds
                className="w-full text-sm p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="size-3.5 text-emerald-500" /> 4. Available
                Hour Block
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="" className="dark:bg-zinc-900">
                  Select a time window
                </option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot} className="dark:bg-zinc-900">
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 4: Mode of Consultation Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              5. Consultation Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisitType('clinic')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                  visitType === 'clinic'
                    ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}
              >
                <Building2 className="size-4" /> In-Person Physical Clinic Visit
              </button>
              <button
                type="button"
                onClick={() => setVisitType('video')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                  visitType === 'video'
                    ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}
              >
                <Video className="size-4" /> Telehealth Secure Video Feed
              </button>
            </div>
          </div>

          {/* Symptoms Notes Input Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              6. Medical Case Description / Reason for Visit
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Briefly detail any active symptoms, current medications, or consultation requirements..."
              rows={3}
              className="w-full text-sm p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </form>

        {/* Right Side: Real-Time Verification Check Summary Panel (1 Column) */}
        <div className="p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xs space-y-4 sticky top-24">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
            Reservation Summary Review
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">
                Department Assignment:
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {selectedSpecialty || 'Not Selected'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">
                Medical Professional:
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {selectedDoctor ? selectedDoctor.name : 'Not Selected'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">
                Target Schedule Date:
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {selectedDate || 'Not Selected'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">
                Allocated Time Block:
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {selectedTime || 'Not Selected'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">
                Consultation Strategy:
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">
                {visitType === 'clinic'
                  ? 'In-Clinic Checkup'
                  : 'Telehealth Stream'}
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-between items-center text-sm">
              <span className="font-semibold text-zinc-900 dark:text-white">
                Estimated Base Clearance:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {selectedDoctor ? selectedDoctor.fee : 'Rs. 0'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedDoctorId || !selectedDate || !selectedTime}
            onClick={handleBookAppointment}
            className="w-full py-2.5 text-xs font-semibold rounded-lg text-center tracking-wide text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            Confirm & Forward to Desk
          </button>
        </div>
      </div>
    </div>
  )
}
