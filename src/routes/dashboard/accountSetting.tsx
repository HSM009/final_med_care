import { createFileRoute } from '@tanstack/react-router'
import { ViewAndUpdateAccountSetting } from '#/components/accountSettings/viewAndUpdate'
import { authClient } from '#/lib/auth-client'
import { Loader2 } from 'lucide-react' // ✅ Import a nice loading spinner
import {
  cellNoUpdateSchema,
  emailUpdateSchema,
  nameUpdateSchema,
  passwordUpdateSchema,
  qualificationUpdateSchema,
} from '@/schemas/auth'
import { ViewAndUpdateAccountSettingPassword } from '@/components/accountSettings/viewAndUpdatePassword'

export const Route = createFileRoute('/dashboard/accountSetting')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: sessionData, isPending } = authClient.useSession()
  const user = sessionData?.user

  if (isPending) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm">Loading your account settings...</p>
      </div>
    )
  }
  if (!user) {
    return (
      <div className="text-center text-red-500 mt-10">
        Please sign in to access these settings.
      </div>
    )
  }
  return (
    <div>
      <div>
        <div className="text-3xl font-bold text-white mb-10 text-center">
          Account Settings
        </div>
        <ViewAndUpdateAccountSetting
          fId={'name'}
          Title={'Name'}
          data={user?.name || ''}
          validatorHandler={nameUpdateSchema}
        />
        <ViewAndUpdateAccountSetting
          fId={'email'}
          Title={'Email'}
          data={user?.email || ''}
          validatorHandler={emailUpdateSchema}
        />
        <ViewAndUpdateAccountSetting
          fId={'cellNo'}
          Title={'Cell Number'}
          data={user?.cellNo || ''}
          validatorHandler={cellNoUpdateSchema}
        />
        <ViewAndUpdateAccountSetting
          fId={'qualification'}
          Title={'Qualification'}
          data={user?.qualification || ''}
          validatorHandler={qualificationUpdateSchema}
        />
        <ViewAndUpdateAccountSettingPassword
          validatorHandler={passwordUpdateSchema}
        />
      </div>
    </div>
  )
}
