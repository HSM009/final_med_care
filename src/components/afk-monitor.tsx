import { useEffect } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { handleAfkSignOut } from '#/server/afk-killSession'
import { toast } from 'sonner' // ⚡ Import your existing Sonner toast instance
import type { Roles } from '#/generated/prisma/enums'
import type { AuthUser } from '#/lib/types'
import { showToast } from '#/lib/showToast'

// Constants calculated in milliseconds
const TOTAL_TIMEOUT_MS = 1000 * 60 * 10 // 15 Minutes total session duration
const WARNING_THRESHOLD_MS = 1000 * 60 * 3 // 5 Minutes warning threshold
const QUIET_DURATION_MS = TOTAL_TIMEOUT_MS - WARNING_THRESHOLD_MS // 10 Minutes silent mode

interface AfkInterface {
  type: Roles
  user: AuthUser | null | undefined
  children: React.ReactNode
}

export function AfkMonitor({ type, user, children }: AfkInterface) {
  const router = useRouter()
  const navigate = useNavigate()
  const userTrackingKey = user?.id || (user ? 'authenticated' : null)

  useEffect(() => {
    if (!userTrackingKey || typeof window === 'undefined') return

    let quietTimer: NodeJS.Timeout // Tracks the first 10 minutes of silence
    let countdownInterval: NodeJS.Timeout // Tracks the 1-second interval for the last 5 minutes
    let secondsRemaining = 0
    const handleAfkTimeout = async () => {
      try {
        toast.dismiss('afk-session-warning')
        await handleAfkSignOut(type, navigate)
        await router.invalidate()
        // window.location.href = `/login?type=${type}&reason=Afk+sign+out`
      } catch (error) {
        window.location.href = '/login'
      }
    }

    const renderCountdownToast = (totalSecs: number) => {
      const minutes = Math.floor(totalSecs / 60)
      const seconds = totalSecs % 60
      const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`

      // ⚡ Sonner matches toasts by 'id'. Re-calling this with the same ID
      showToast.error('Inactivity Warning', {
        id: 'afk-session-warning',
        description: (
          <span className=" ">
            You will be automatically logged out in{' '}
            <span className="text-red-600 font-bold animate-pulse">
              {formattedTime}
            </span>{' '}
            due to inactivity.
          </span>
        ),
        duration: Infinity,
      })
    }

    const startWarningCountdown = () => {
      secondsRemaining = WARNING_THRESHOLD_MS / 1000 // Start at 300 seconds

      renderCountdownToast(secondsRemaining)

      countdownInterval = setInterval(() => {
        secondsRemaining -= 1

        if (secondsRemaining <= 0) {
          clearInterval(countdownInterval)
          handleAfkTimeout()
        } else {
          renderCountdownToast(secondsRemaining)
        }
      }, 1000)
    }

    const resetTimer = () => {
      // 1. Wipe out all active tracking timelines
      clearTimeout(quietTimer)
      clearInterval(countdownInterval)

      toast.dismiss('afk-session-warning')

      quietTimer = setTimeout(startWarningCountdown, QUIET_DURATION_MS)
    }

    const activityEvents = [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'scroll',
    ]

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, true)
    })

    resetTimer()

    return () => {
      clearTimeout(quietTimer)
      clearInterval(countdownInterval)
      toast.dismiss('afk-session-warning')
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer, true)
      })
    }
  }, [userTrackingKey, type, router])

  return <>{children}</>
}
