import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Field, FieldError } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { routeAdminSearchSchema } from '#/schemas/auth' // Now updated to an object schema!
import { Button } from '#/components/ui/button'
import { useState, useTransition } from 'react'
import { formatDateToDMY } from '#/lib/types'
import { AppPagination } from '#/components/appPagination'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { getPatientsFn, autoBanMaliciousUserFn } from '#/lib/admin-actions'
import { getSessionFn } from '#/data/session'
import { EditAdminDialog } from '#/components/adminUser/editDialog'

var o_PAGE_SIZE = 8

export const Route = createFileRoute('/dashboard/administerUser')({
  beforeLoad: async () => {
    const session = await getSessionFn()

    if (
      !session ||
      !session.user ||
      session.user.role.toLocaleLowerCase() !== 'admin'
    ) {
      const emailToBan = session?.user?.email
      if (emailToBan) {
        await autoBanMaliciousUserFn({
          data: {
            email: emailToBan,
            reason:
              'Unauthorized malicious attempt to access admin dashboard panels.',
          },
        })
      }
      throw redirect({
        to: '/login',
        search: {
          error: 'banned_unauthorized',
        },
      })
    }
    return {
      userId: session.user.id as string,
      sessionName: session.user.name as string,
    }
  },
  validateSearch: (search) => routeAdminSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, context: { userId } }) => {
    return await getPatientsFn({
      data: {
        ...search,
        userId,
      },
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { items, totalCount } = Route.useLoaderData()
  const { search, page = 1 } = Route.useSearch()
  const [activeTab, setActiveTab] = useState<string>('Overview')
  const { userId, sessionName } = Route.useRouteContext()
  const navigate = useNavigate({ from: Route.fullPath })
  const [isPending, startTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      search: search || '',
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await navigate({
          search: (prev) => ({
            ...prev,
            search: value.search.trim() || undefined,
            page: 1,
            userId: userId || '',
          }),
        })
        setActiveTab('Overview')
      })
    },
  })
  const handlePageChange = (newPage: number) => {
    startTransition(async () => {
      await navigate({
        search: (prev) => ({
          ...prev,
          page: newPage,
          userId: userId || '',
        }),
      })
    })
  }
  return (
    <div className="p-8">
      <div className="text-3xl font-bold text-white mb-4 text-center">
        Administer User Records
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm flex w-full">
            <span> Search User:</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-10 mb-6"
          >
            <form.Field
              name="search"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex gap-2">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Search by Name or Role ..."
                        type="text"
                        autoComplete="off"
                        disabled={isPending}
                      />
                      <Button
                        disabled={isPending}
                        type="submit"
                        className="cursor-pointer"
                      >
                        {isPending ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </form>
        </CardContent>
      </Card>

      <Card className="">
        <CardHeader>
          <CardTitle className="text-sm flex w-full">
            <span> User Record:</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className=" w-full "
          >
            <TabsList>
              <TabsTrigger value="Overview">Overview</TabsTrigger>
              <TabsTrigger
                value="Details"
                className={`${activeTab === 'Overview' ? 'hidden' : ''}`}
              >
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Overview">
              <div className="relative overflow-x-auto shadow-xs rounded-t-2xl border">
                <table className="w-full text-sm text-left text-body">
                  <thead className="text-sm text-body bg-neutral-600 border-b">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Qualification
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Registered Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium text-right"
                      >
                        <span className="sr-only ">View&Edit</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((userData) => (
                      <tr
                        key={userData.id}
                        className="border-b hover:bg-neutral-600/50 transition-colors "
                      >
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.title}
                          {userData.name}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.qualification}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.cellNo}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.email}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 rounded text-xs ${
                              userData.role?.toLowerCase() === 'admin'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {userData?.role
                              ? userData.role.charAt(0).toUpperCase() +
                                userData.role.slice(1)
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {formatDateToDMY(userData.createdAt)}
                        </td>
                        <td className="px-6 py-3 flex items-center justify-end gap-3 whitespace-nowrap">
                          <span
                            className=" cursor-pointer font-medium text-blue-500 hover:underline"
                            onClick={() => {
                              setActiveTab('Details')
                            }}
                          >
                            View
                          </span>
                          <EditAdminDialog
                            data={{
                              editDialog: 1,
                              userId: userData.id,
                              usertitle: userData.title || 'N/A',
                              userEmail: userData.email || 'N/A',
                              userEmailVerified: userData.emailVerified,
                              userBanned: userData.banned || false,
                              userRole: userData.role || 'N/A',
                              userCellNo: userData.cellNo || 'N/A',
                              userQualification:
                                userData.qualification || 'N/A',
                              userFailedAttempts: userData.failedAttempts,
                              sessionName: sessionName,
                            }}
                          >
                            <span className="font-medium text-red-500 hover:underline cursor-pointer select-none">
                              Edit
                            </span>
                          </EditAdminDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && (
                  <li className="text-center py-8 text-indigo-300/70 italic">
                    No users match your search criteria.
                  </li>
                )}
              </div>
              <AppPagination
                page={page}
                totalCount={totalCount}
                pageSize={o_PAGE_SIZE}
                isPending={isPending}
                onPageChange={handlePageChange}
              />
            </TabsContent>

            <TabsContent value="Details">
              <div className="relative overflow-x-auto shadow-xs rounded-t-2xl border">
                <table className="w-full text-sm text-left text-body">
                  <thead className="text-sm text-body bg-neutral-600 border-b">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Email Verified
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Banned
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Banned Expires
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Banned Reason
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium dark:text-primary text-secondary"
                      >
                        Failed Login Attempts
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium text-right"
                      >
                        <span className="sr-only ">View&Edit&New</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((userData) => (
                      <tr
                        key={userData.id}
                        className="border-b hover:bg-neutral-600/50 transition-colors "
                      >
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.title}
                          {userData.name}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.emailVerified ? (
                            <span className="px-2 rounded text-xs bg-green-500/20 text-green-400">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 rounded text-xs bg-red-500/20 text-red-400">
                              Not Verified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.banned ? (
                            <span className="px-2 rounded text-xs bg-red-500/20 text-red-400">
                              True
                            </span>
                          ) : (
                            <span className="px-2 rounded text-xs bg-green-500/20 text-green-400">
                              false
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.banExpires
                            ? formatDateToDMY(userData.banExpires)
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.banReason || 'Null'}
                        </td>
                        <td className="px-6 py-3 dark:text-primary text-secondary">
                          {userData.failedAttempts || '0'}
                        </td>
                        <td className="px-6 py-3 flex items-center justify-end gap-3 whitespace-nowrap">
                          <EditAdminDialog
                            data={{
                              editDialog: 2,
                              userId: userData.id,
                              usertitle: userData.title || 'N/A',
                              userEmail: userData.email || 'N/A',
                              userEmailVerified: userData.emailVerified,
                              userBanned: userData.banned || false,
                              userRole: userData.role || 'N/A',
                              userCellNo: userData.cellNo || 'N/A',
                              userQualification:
                                userData.qualification || 'N/A',
                              userFailedAttempts: userData.failedAttempts,

                              sessionName: sessionName,
                            }}
                          >
                            <span className="font-medium text-red-500 hover:underline cursor-pointer select-none">
                              Edit
                            </span>
                          </EditAdminDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
