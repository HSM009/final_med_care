import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Calendar,
  FileText,
  Pill,
  Clock,
  Search,
  ArrowDownCircle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'

export const Route = createFileRoute('/patientDashboard/history')({
  component: RouteComponent,
})

type LogCategory = 'all' | 'consultations' | 'labs' | 'prescriptions'

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<LogCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Structured Medical History Mock Data Matrix
  const medicalLogs = [
    {
      id: 'log-1',
      date: 'June 18, 2026',
      type: 'consultations',
      title: 'Routine General Checkup',
      subtitle: 'Dr. Zainab Bilal — General Medicine',
      details:
        'Blood pressure balanced at 120/80. Patient reported occasional mild seasonal allergies. Advised maintaining current hydration thresholds.',
      status: 'Completed',
      actionLabel: 'View Summary Note',
    },
    {
      id: 'log-2',
      date: 'May 12, 2026',
      type: 'labs',
      title: 'Complete Blood Count (CBC) & Lipid Profile',
      subtitle: 'Med Care Diagnostic Lab Core',
      details:
        'Hemoglobin and platelet levels within optimal range. Cholesterol levels flagged slightly higher than median thresholds. Dietary adjustments recommended.',
      status: 'Released',
      actionLabel: 'Download PDF Report',
    },
    {
      id: 'log-3',
      date: 'April 05, 2026',
      type: 'prescriptions',
      title: 'Amoxicillin 500mg (Antibiotic Dose)',
      subtitle: 'Authorized by Dr. Sarah Khan',
      details:
        '1 capsule thrice daily after meals for a structural cycle of 7 days. Treatment course for acute upper respiratory inflammation completely concluded.',
      status: 'Expired',
      actionLabel: 'View Dosage Directions',
    },
    {
      id: 'log-4',
      date: 'February 20, 2026',
      type: 'consultations',
      title: 'Cardiology Diagnostics Consultation',
      subtitle: 'Dr. Sarah Khan — Cardiologist',
      details:
        'ECG pattern diagnostics evaluated cleanly. Exercising pulse tracking stabilized within target standard ranges. Next preventative checkup scheduled for mid-summer.',
      status: 'Completed',
      actionLabel: 'View Summary Note',
    },
  ]

  // Filter logs based on category tab selection and live search criteria inputs
  const filteredLogs = medicalLogs.filter((log) => {
    const matchesTab = activeTab === 'all' || log.type === activeTab
    const matchesSearch =
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Badge coloring matrix lookup helper
  const getCategoryMeta = (type: string) => {
    switch (type) {
      case 'consultations':
        return {
          label: 'Consultation',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          icon: Calendar,
        }
      case 'labs':
        return {
          label: 'Lab Result',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
          icon: FileText,
        }
      case 'prescriptions':
        return {
          label: 'Prescription',
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
          icon: Pill,
        }
      default:
        return {
          label: 'General',
          color: 'bg-zinc-500/10 text-zinc-600',
          icon: Clock,
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Medical History Logs
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Access your comprehensive timeline of past consultations, laboratory
          test assessments, and clinical prescription distributions.
        </p>
      </div>

      {/* Control Actions Panel Bar (Filter Tabs + Search Tool Input Field) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xs">
        {/* Navigation Category Filters */}
        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
          {(['all', 'consultations', 'labs', 'prescriptions'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize cursor-pointer ${
                  activeTab === tab
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {tab === 'all' ? 'All Records' : tab}
              </button>
            ),
          )}
        </div>

        {/* Live Filter Search Input Wrapper */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search records, doctors, labs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Timeline Layout Core Display */}
      {filteredLogs.length > 0 ? (
        <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800/80 ml-4 pl-6 sm:pl-8 space-y-6">
          {filteredLogs.map((log) => {
            const meta = getCategoryMeta(log.type)
            return (
              <div
                key={log.id}
                className="relative group animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {/* Timeline Target Dot Tracker */}
                <div className="absolute -left-8.75 sm:-left-10.75 top-1.5 size-6 sm:size-7 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-emerald-500 dark:group-hover:border-emerald-400 transition-colors duration-200">
                  <meta.icon className="size-3.5" />
                </div>

                {/* Log Entry Data Box Card */}
                <div className="p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xs space-y-3 hover:shadow-sm transition-shadow duration-200">
                  {/* Top Header Information Stack */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/40 pb-2.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                          <Clock className="size-3" /> {log.date}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-1">
                        {log.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {log.subtitle}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === 'Completed' ||
                          log.status === 'Released'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {log.status === 'Completed' ||
                        log.status === 'Released' ? (
                          <CheckCircle className="size-3" />
                        ) : null}
                        {log.status}
                      </span>
                    </div>
                  </div>

                  {/* Diagnostic Findings Paragraph Details */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {log.details}
                  </p>

                  {/* Conditional Attachment Action Links */}
                  <div className="pt-2 flex justify-start">
                    <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer group/btn">
                      {log.type === 'labs' ? (
                        <ArrowDownCircle className="size-3.5" />
                      ) : (
                        <ExternalLink className="size-3.5" />
                      )}
                      <span>{log.actionLabel}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State Fallback Frame Vector */
        <div className="text-center p-12 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40">
          <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
            No matching historical medical logs found matching search tokens.
          </p>
        </div>
      )}
    </div>
  )
}
