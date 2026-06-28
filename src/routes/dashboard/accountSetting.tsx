import { createFileRoute } from '@tanstack/react-router'
import {
  cellNoUpdateSchema,
  dobUpdateSchema,
  emailUpdateSchema,
  genderUpdateSchema,
  nameUpdateSchema,
  passwordUpdateSchema,
  qualificationUpdateSchema,
} from '@/schemas/auth'
import { ViewAndUpdateAccountSettingPassword } from '#/components/user/viewAndUpdatePassword'
import { UserTemplateCard } from '#/components/user/userTemplateCard'

export const Route = createFileRoute('/dashboard/accountSetting')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const data = auth.user

  if (!data) {
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
        <div className=" space-y-6 ">
          <UserTemplateCard
            userId={data.id}
            Title={'name'}
            currentData={data.name}
            validatorHandler={nameUpdateSchema}
          />
          <UserTemplateCard
            userId={data.id}
            Title={'email'}
            currentData={data.email}
            sessionName={data.name}
            validatorHandler={emailUpdateSchema}
          />
          <UserTemplateCard
            userId={data.id}
            Title={'date-Of-Birth'}
            currentData={data.dateOfBirth}
            validatorHandler={dobUpdateSchema}
          />
          <UserTemplateCard
            userId={data.id}
            Title={'cell-No'}
            currentData={data.cellNo}
            validatorHandler={cellNoUpdateSchema}
          />
          <UserTemplateCard
            userId={data.id}
            Title={'gender'}
            currentData={data.gender}
            validatorHandler={genderUpdateSchema}
          />
          <UserTemplateCard
            userId={data.id}
            Title={'qualification'}
            currentData={data.qualification}
            validatorHandler={qualificationUpdateSchema}
          />
        </div>
        <ViewAndUpdateAccountSettingPassword
          validatorHandler={passwordUpdateSchema}
        />
      </div>
    </div>
  )
}
