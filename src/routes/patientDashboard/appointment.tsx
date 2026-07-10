import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  Video,
  Building2,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { medicalQueries, postPatientAppointment } from '#/server/actions'
import { showToast } from '#/lib/showToast'
import { useConfirm } from '#/hooks/confirm-context'
import { formatDateToDMY2 } from '#/lib/types'

export const Route = createFileRoute('/patientDashboard/appointment')({
  component: RouteComponent,
})

const AVAILABLE_SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'General_Medicine',
  'Pediatrics',
] as const

type LocalSpecialty = (typeof AVAILABLE_SPECIALTIES)[number]

function RouteComponent() {
  const [formData, setFormData] = useState({
    specialty: undefined as LocalSpecialty | undefined,
    doctorId: undefined as string | undefined,
    dateString: '',
    timeMinutes: '',
    timeLabel: '',
    visitType: 'clinic' as 'clinic' | 'video',
    notes: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery(
    medicalQueries.doctors(formData.specialty),
  )

  const { data: availableDates = [], isLoading: loadingDates } = useQuery(
    medicalQueries.dates(formData.doctorId),
  )

  const { data: dynamicTimeSlots = [], isLoading: loadingTimes } = useQuery(
    medicalQueries.slots(formData.doctorId, formData.dateString),
  )

  const selectedDoctor = useMemo(() => {
    return doctors.find((doc) => doc.id === formData.doctorId)
  }, [formData.doctorId, doctors])

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'specialty') {
        updated.doctorId = undefined
        updated.dateString = ''
        updated.timeMinutes = ''
        updated.timeLabel = ''
      }
      if (field === 'doctorId') {
        updated.dateString = ''
        updated.timeMinutes = ''
        updated.timeLabel = ''
      }
      if (field === 'dateString') {
        updated.timeMinutes = ''
        updated.timeLabel = ''
      }
      return updated
    })
  }
  const confirm = useConfirm()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.doctorId || !formData.dateString || !formData.timeMinutes)
      return
    try {
      const choice = await confirm({
        title: 'Confirmation Alert?',
        description: 'Are you sure you want to submit this appointment?.',
        confirmText: 'Confirm',
        variant: 'destructive', // Change to 'default' or 'emerald' if this isn't a deletion style action!
      })
      if (!choice) return
      showToast.loading('Creating the appointment.', { id: 'create-appoint' })
      const response = await postPatientAppointment({
        data: {
          doctorId: formData.doctorId,
          dateString: formData.dateString,
          timeMinutes: formData.timeMinutes,
        },
      })

      if (response?.success) {
        showToast.success('Appointment Created.', { id: 'create-appoint' })
        setIsSubmitted(true)
      }
    } catch (error) {
      showToast.error('Some error occurred during generation of appointment.', {
        id: 'create-appoint',
      })
      setIsSubmitted(false)
      console.error(
        '[Booking Pipeline Error]: Failure sending appointment payload.',
        error,
      )
    }
    setIsSubmitted(true)
  }

  if (isSubmitted && selectedDoctor) {
    return (
      <div className="mx-auto max-w-xl text-center p-8 rounded-2xl border border-emerald-500/20 bg-white dark:bg-zinc-900 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto size-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Appointment Confirmed
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your booking request has been successfully processed against our
            active registry.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-left text-sm space-y-3">
          <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
            <span className="font-semibold text-zinc-400 w-24 shrink-0">
              Practitioner:
            </span>
            <span>
              {selectedDoctor.title || 'Dr.'} {selectedDoctor.name}{' '}
              <span className="text-xs text-zinc-400">
                ({selectedDoctor.qualification || 'General Consultant'})
              </span>
            </span>
          </div>
          <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
            <span className="font-semibold text-zinc-400 w-24 shrink-0">
              Department:
            </span>
            <span>{formData.specialty?.replace('_', ' ')}</span>
          </div>
          <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
            <span className="font-semibold text-zinc-400 w-24 shrink-0">
              Date Target:
            </span>
            <span>{formatDateToDMY2(formData.dateString)}</span>
          </div>
          <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
            <span className="font-semibold text-zinc-400 w-24 shrink-0">
              Time Window:
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {formData.timeLabel}
            </span>
          </div>
          <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
            <span className="font-semibold text-zinc-400 w-24 shrink-0">
              Visit Vector:
            </span>
            <span>
              {formData.visitType === 'clinic'
                ? 'In-Person Facility Checkup'
                : 'Secure Video Telehealth Telemetry'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false)
            setFormData({
              specialty: undefined,
              doctorId: undefined,
              dateString: '',
              timeMinutes: '',
              timeLabel: '',
              visitType: 'clinic',
              notes: '',
            })
          }}
          className="w-full px-5 py-3 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          Book Another Session
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6"
    >
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Activity className="size-7 text-emerald-500 animate-pulse" />{' '}
          Outpatient Booking Portal
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Select target medical fields, cross-check direct practitioner
          schedules, and lock down secure time configurations.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Core Configurator Flow */}
        <div className="lg:col-span-2 space-y-6 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs">
          {/* Step 1: Specialty Array Selection */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="size-3.5 text-emerald-500" /> 1. Medical
              Specialty Area
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVAILABLE_SPECIALTIES.map((spec) => (
                <label
                  key={spec}
                  className="relative block cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name="specialty"
                    checked={formData.specialty === spec}
                    onChange={() => updateField('specialty', spec)}
                    className="peer sr-only"
                  />
                  <div className="p-3 text-xs font-medium text-center border rounded-xl transition-all text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/5 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400 peer-checked:font-semibold peer-checked:shadow-xs">
                    {spec.replace('_', ' ')}
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Step 2: Doctor Identity Resolution */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="size-3.5 text-emerald-500" /> 2. Available
              Medical Consultants
            </legend>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {!formData.specialty ? (
                <div className="sm:col-span-2 text-xs text-zinc-400 italic bg-zinc-50 dark:bg-zinc-950/40 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 text-center">
                  Select an operational medical department above to scan active
                  personnel.
                </div>
              ) : loadingDoctors ? (
                <div className="sm:col-span-2 text-xs text-zinc-400 animate-pulse py-3 text-center">
                  Streaming active medical consultant directory files...
                </div>
              ) : doctors.length === 0 ? (
                <div className="sm:col-span-2 text-xs text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-center">
                  No active clinicians found currently mapped to the{' '}
                  {formData.specialty.replace('_', ' ')} list filter.
                </div>
              ) : (
                doctors.map((doc) => (
                  <label
                    key={doc.id}
                    className="relative block cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="doctor"
                      checked={formData.doctorId === doc.id}
                      onChange={() => updateField('doctorId', doc.id)}
                      className="peer sr-only"
                    />

                    {/* Main Card Element */}
                    <div
                      className="p-4 flex flex-col border rounded-xl text-left transition-all relative overflow-hidden
            border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 
            peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 dark:peer-checked:bg-emerald-500/10 
            peer-checked:ring-2 peer-checked:ring-emerald-500/20 peer-checked:shadow-md
            
            /* 🟢 FORCE INTERNAL TEXT TO GREEN WHEN PEER IS CHECKED */
            peer-checked:[&_.doc-name]:text-emerald-600 dark:peer-checked:[&_.doc-name]:text-emerald-400
            peer-checked:[&_.doc-qual]:text-emerald-700/80 dark:peer-checked:[&_.doc-qual]:text-emerald-400/80"
                    >
                      {/* Dynamic Highlight Indicator Dot/Badge */}
                      <div
                        className="absolute top-3 right-3 size-2 rounded-full bg-transparent transition-all
              peer-checked:bg-emerald-500 peer-checked:scale-125"
                      />

                      {/* Mapped Identifier Classes applied below */}
                      <span className="doc-name text-sm font-bold text-zinc-900 dark:text-white transition-colors">
                        {doc.title || 'Dr.'} {doc.name}
                      </span>

                      <span className="doc-qual text-xs text-zinc-400 mt-1 truncate transition-colors">
                        {doc.qualification || 'General Specialist'}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </fieldset>

          {/* Steps 3 & 4: Date and Time Dropdown Allocators */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Step 3: Target Date Allocation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 text-emerald-500" /> 3. Target
                Date Allocation
              </label>
              <select
                disabled={!formData.doctorId || loadingDates}
                value={formData.dateString}
                onChange={(e) => updateField('dateString', e.target.value)}
                className={`w-full text-sm p-3 rounded-xl border transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed
        ${
          formData.dateString
            ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold ring-2 ring-emerald-500/20'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200'
        }`}
              >
                <option value="" className="text-zinc-400 dark:bg-zinc-900">
                  {loadingDates
                    ? 'Compiling system calendar records...'
                    : formData.doctorId
                      ? 'Choose a target operational date'
                      : 'Awaiting clinical selection parameter'}
                </option>
                {availableDates.map((d) => (
                  <option
                    key={d.dateString}
                    value={d.dateString}
                    className="text-zinc-800 dark:text-zinc-200 dark:bg-zinc-900 font-normal"
                  >
                    {d.displayLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Unbooked Session Hours */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="size-3.5 text-emerald-500" /> 4. Unbooked
                Session Hours
              </label>
              <select
                disabled={!formData.dateString || loadingTimes}
                value={formData.timeMinutes}
                onChange={(e) => {
                  const selectedIndex = e.target.selectedIndex
                  const displayLabel = e.target.options[selectedIndex].text
                  setFormData((prev) => ({
                    ...prev,
                    timeMinutes: e.target.value,
                    timeLabel: e.target.value ? displayLabel : '',
                  }))
                }}
                className={`w-full text-sm p-3 rounded-xl border transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed
        ${
          formData.timeMinutes
            ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold ring-2 ring-emerald-500/20'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200'
        }`}
              >
                <option value="" className="text-zinc-400 dark:bg-zinc-900">
                  {loadingTimes
                    ? 'Filtering conflicting schedule entries...'
                    : formData.dateString
                      ? 'Select an unbooked window'
                      : 'Awaiting confirmation of date string'}
                </option>
                {dynamicTimeSlots.map((slot) => (
                  <option
                    key={slot.rawMinutes}
                    value={slot.rawMinutes}
                    className="text-zinc-800 dark:text-zinc-200 dark:bg-zinc-900 font-normal"
                  >
                    {slot.displayLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 5: Consult Mechanism Type */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              5. Consultation Delivery Strategy
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative block cursor-pointer select-none">
                <input
                  type="radio"
                  name="visitType"
                  checked={formData.visitType === 'clinic'}
                  onChange={() => updateField('visitType', 'clinic')}
                  className="peer sr-only"
                />
                <div className="p-3.5 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/5 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400">
                  <Building2 className="size-4" /> Physical Facility Visit
                </div>
              </label>

              <label className="relative block cursor-pointer select-none">
                <input
                  type="radio"
                  name="visitType"
                  checked={formData.visitType === 'video'}
                  onChange={() => updateField('visitType', 'video')}
                  className="peer sr-only"
                />
                <div className="p-3.5 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/5 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400">
                  <Video className="size-4" /> Secure Video Feed
                </div>
              </label>
            </div>
          </fieldset>

          {/* Step 6: Intake Metadata */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              6. Patient Intake Manifest / Symptom Context
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Provide information regarding current prescriptions, chronic history items, or diagnostic reasons..."
              rows={3}
              className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all"
            />
          </div>
        </div>

        {/* Sticky System Verification Matrix Panel */}
        <aside className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs space-y-4 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5 flex items-center justify-between">
            <span>Appointment Status</span>
            <ChevronRight className="size-4 text-zinc-400" />
          </h3>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40 text-xs">
            <div className="flex justify-between items-center py-3">
              <span className="text-zinc-400 font-medium">Department:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {formData.specialty
                  ? formData.specialty.replace('_', ' ')
                  : 'Not Configured'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-zinc-400 font-medium">Practitioner:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-42.5">
                {selectedDoctor
                  ? `${selectedDoctor.title || 'Dr.'} ${selectedDoctor.name}`
                  : 'Not Configured'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-zinc-400 font-medium">Target Date:</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                {formatDateToDMY2(formData.dateString) || 'Not Configured'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-zinc-400 font-medium">Time Slot:</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 max-w-45 truncate">
                {formData.timeLabel || 'Not Configured'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-zinc-400 font-medium">Delivery Mode:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider">
                {formData.visitType === 'clinic'
                  ? 'Facility Unit'
                  : 'Digital Feed'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !formData.doctorId ||
              !formData.dateString ||
              !formData.timeMinutes
            }
            className="w-full py-3 text-xs font-bold rounded-xl text-center tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed font-mono shadow-md shadow-emerald-600/5"
          >
            Submit Appointment
          </button>
        </aside>
      </div>
    </form>
  )
}
