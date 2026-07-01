import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  Activity,
  ClipboardList,
  Clock,
  ArrowUpRight,
  User,
  ShieldAlert,
} from 'lucide-react'

export const Route = createFileRoute('/patientDashboard/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const user = auth.user
  const stats = [
    {
      title: 'Next Appointment',
      value: 'Tom, 10:30 AM',
      icon: Calendar,
      description: 'Dr. Sarah Khan (Cardio)',
      color: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      title: 'Active Prescriptions',
      value: '3 Active Meds',
      icon: ClipboardList,
      description: '2 pending refills remaining',
      color: 'text-blue-600 bg-blue-500/10',
    },
    {
      title: 'Latest Vitals Status',
      value: '120/80 mmHg',
      icon: Activity,
      description: 'Recorded 2 days ago (Normal)',
      color: 'text-purple-600 bg-purple-500/10',
    },
  ]

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Khan',
      specialty: 'Cardiologist',
      date: 'July 02, 2026',
      time: '10:30 AM',
      status: 'Confirmed',
    },
    {
      id: 2,
      doctor: 'Dr. Asif Ali',
      specialty: 'Dermatologist',
      date: 'July 15, 2026',
      time: '02:15 PM',
      status: 'Pending Review',
    },
  ]

  const recentLogs = [
    {
      id: 1,
      type: 'Lab Result Released',
      detail: 'Complete Blood Count (CBC) Checkup',
      time: 'Yesterday at 4:30 PM',
    },
    {
      id: 2,
      type: 'Prescription Renewal',
      detail: 'Amoxicillin 500mg authorized by clinic',
      time: '3 days ago',
    },
    {
      id: 3,
      type: 'Invoice Paid',
      detail: 'Online clearing token for OPD Visit #4812',
      time: '1 week ago',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header Column Layout */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Welcome back, {user?.name}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Here is a quick breakdown of your current health tracking profile,
          metrics, and schedules.
        </p>
      </div>

      {/* Grid Stats Deck Matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.title}
              </span>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="size-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {stat.value}
              </span>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Split Console Layer Layout Matrix */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Double-Column Slot: Appointments Panel Container */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4.5 text-emerald-500" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Upcoming Consultations
              </h2>
            </div>
            <button className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer">
              Book Appointment <ArrowUpRight className="size-3" />
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
            {upcomingAppointments.map((appt) => (
              <div
                key={appt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                    <User className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
                      {appt.doctor}
                    </h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {appt.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {appt.date}
                    </p>
                    <p className="text-xs text-zinc-400">{appt.time}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appt.status === 'Confirmed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Slot: Medical Activity Feed Log */}
        <div className="p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
            <ShieldAlert className="size-4.5 text-blue-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Recent Timeline Health Actions
            </h2>
          </div>

          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="relative pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 last:pb-0"
              >
                <div className="absolute -left-1.25 top-1.5 size-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-[11px] text-zinc-400 block font-medium">
                  {log.time}
                </span>
                <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {log.type}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {log.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
