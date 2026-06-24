import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { handleAfkSignOut } from '#/server/afk-killSession'
import type { Roles } from '#/generated/prisma/enums'
import type { AuthUser } from '#/lib/types'

const AFK_TIMEOUT_MS = 1000 * 60 * 15 // 15 Minutes

interface AfkInterface {
  type: Roles
  user: AuthUser | null | undefined
  children: React.ReactNode
}

export function AfkMonitor({ type, user, children }: AfkInterface) {
  const router = useRouter()
  const { navigate } = useRouter()
  useEffect(() => {
    if (!user || typeof window === 'undefined') return

    let afkTimer: NodeJS.Timeout

    const handleAfkTimeout = async () => {
      await handleAfkSignOut(type, navigate)

      await router.invalidate()
    }

    const resetTimer = () => {
      clearTimeout(afkTimer)
      afkTimer = setTimeout(handleAfkTimeout, AFK_TIMEOUT_MS)
    }

    // Capture comprehensive interface events
    const activityEvents = [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'scroll',
    ]

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true })
    })

    // Initialize the tracker countdown
    resetTimer()

    return () => {
      clearTimeout(afkTimer)
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [router])

  return <>{children}</>
}
