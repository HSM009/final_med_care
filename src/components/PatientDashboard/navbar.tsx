import type { NavPrimaryProps } from '#/lib/types'
import { Link } from '@tanstack/react-router'
import {
  Edit3Icon,
  HistoryIcon,
  ViewIcon,
  UserIcon,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { useState, memo } from 'react'
import { motion } from 'framer-motion' // 🟢 Clean, native layout animation engine
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useHandleSignOut } from '#/server/actions'

const navItems: NavPrimaryProps['items'] = [
  {
    title: 'Overview',
    icon: ViewIcon,
    to: '/patientDashboard/overview',
    activeOptions: { exact: false },
  },
  {
    title: 'Appointment',
    icon: Edit3Icon,
    to: '/patientDashboard/appointment',
    activeOptions: { exact: false },
  },
  {
    title: 'History',
    icon: HistoryIcon,
    to: '/patientDashboard/history',
    activeOptions: { exact: false },
  },
]

export function PatientNavbar({ name }: { name: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2 sticky top-2 z-50">
      <div className="rounded-xl border border-white/20 bg-background dark:bg-background backdrop-blur-xl shadow-xs transition-colors duration-300">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <div className="text-xl font-bold tracking-wider text-zinc-900 dark:text-white">
            MED CARE
          </div>

          {/* Desktop Links Grid */}
          <div className="hidden md:flex items-center space-x-2">
            <nav className="relative flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  preload="intent"
                  to={item.to}
                  activeOptions={item.activeOptions}
                  className="nav-link-dynamic group"
                >
                  {/* TanStack's render props let us safely access active status natively */}
                  {({ isActive }) => (
                    <>
                      {/* 🦎 THE TRUE CRAWLING BACKDROP (No Layout Flash, No Rigid Widths) */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                          className="absolute inset-0 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 shadow-xs -z-10"
                        />
                      )}

                      <item.icon
                        className={`size-4.5 shrink-0 transition-colors duration-200 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white'}`}
                      />
                      <span
                        className={`transition-colors duration-200 ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white'}`}
                      >
                        {item.title}
                      </span>
                    </>
                  )}
                </Link>
              ))}
            </nav>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-4" />
            <UserDropdownMenu name={name} />
          </div>

          {/* Mobile Menu Open Trigger Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="absolute top-18 left-4 right-4 border border-zinc-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1.5 md:hidden rounded-xl shadow-xl">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={item.activeOptions}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium data-[active=true]:bg-emerald-500/10 data-[active=true]:text-emerald-600 dark:data-[active=true]:text-emerald-400 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="size-4.5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const UserDropdownMenu = memo(({ name }: { name: string }) => {
  const handleSignOut = useHandleSignOut()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100/60 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group">
        <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <UserIcon className="size-3.5" />
        </div>
        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-30 truncate">
          {name}
        </span>
        <ChevronDown className="size-3 text-zinc-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 mt-1 border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-lg shadow-lg"
      >
        {/* <DropdownMenuLabel className="text-2xs text-zinc-400 font-medium">
          My Management
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" /> */}
        <DropdownMenuItem className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-900 cursor-pointer">
          <Settings className="size-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer font-medium"
        >
          <LogOut className="size-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
UserDropdownMenu.displayName = 'UserDropdownMenu'
