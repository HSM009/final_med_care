import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Field, FieldError } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { patientSearchSchema } from '#/schemas/auth'
import { Button } from '#/components/ui/button'
import { useState, useTransition } from 'react'
import { formatDateToDMY } from '#/lib/types'
import { EditPatientDialog } from '#/components/editPatientDialog'
import { AppPagination } from '#/components/appPagination'
import { calculateAge } from '#/components/datePicker'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import GetPrescriptions from '#/components/getPrescriptionTab'
import { getPatients } from '#/server/actions'

var o_PAGE_SIZE = 8

export const Route = createFileRoute('/dashboard/viewPatients')({
  validateSearch: (search) =>
    patientSearchSchema.parse({ page: 1, pagePerRows: o_PAGE_SIZE, ...search }),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => await getPatients({ data: search }),
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()

  const { items, totalCount } = Route.useLoaderData()
  const { search, page = 1 } = Route.useSearch()
  const [activeTab, setActiveTab] = useState<string>('Overview')
  const navigate = useNavigate({ from: Route.fullPath })
  const [isPending, startTransition] = useTransition()
  const [medId, setMedId] = useState(' ')
  const form = useForm({
    defaultValues: {
      search: search || '',
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await navigate({
          search: (prev) => ({
            ...prev,
            search: value.search.trim(),
            page: 1,
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
        }),
      })
    })
  }

  const handleMedId = (id: string) => {
    setMedId(id)
  }
  return (
    <div className="p-8">
      <div className="text-3xl font-bold text-white mb-4 text-center">
        View Patient Records
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xs flex w-full">
            <span> Search Patient:</span>
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
                        placeholder="Search by Name or Medical Care ID or Phone ..."
                        type="text"
                        autoComplete="off"
                        disabled={isPending}
                      />
                      <Button
                        disabled={isPending}
                        type="submit"
                        className="cursor-pointer"
                        // onClick={() => setActiveTab('Overview')}
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

      <Card className=" mt-6">
        <CardHeader>
          <CardTitle className="text-xs flex w-full">
            <span> Patient Record:</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {search === undefined ? (
            <div className="text-center py-8 text-indigo-300/70 italic border-b bg-neutral-900/10">
              <span>Please type a search term above to view patients.</span>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className=" w-full"
            >
              <TabsList>
                <TabsTrigger value="Overview">Overview</TabsTrigger>
                <TabsTrigger
                  value="Precsription"
                  className={`${activeTab === 'Overview' ? 'hidden' : ''}`}
                >
                  Precsription
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
                          Med Care Id
                        </th>
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
                          Age
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
                          Registered Date
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
                      {items.map((patient) => (
                        <tr
                          key={patient.id}
                          className="border-b hover:bg-neutral-600/50 transition-colors "
                        >
                          <td className="px-6 py-3 text-primary">
                            {patient.med_care_id}
                          </td>
                          <td className="px-6 py-3 dark:text-primary text-secondary">
                            {patient.name}
                          </td>
                          <td className="px-6 py-3 dark:text-primary text-secondary">
                            {calculateAge(patient.age)}
                          </td>
                          <td className="px-6 py-3 dark:text-primary text-secondary">
                            {patient.phone}
                          </td>
                          <td className="px-6 py-3 dark:text-primary text-secondary">
                            {patient.email}
                          </td>
                          <td className="px-6 py-3 dark:text-primary text-secondary">
                            {formatDateToDMY(patient.createdProfile)}
                          </td>

                          <td className="px-6 py-3 flex items-center justify-end gap-3 whitespace-nowrap">
                            <span
                              className=" bg-transparent hover:bg-transparent cursor-pointer font-medium text-blue-500 hover:underline"
                              onClick={() => {
                                setActiveTab('Precsription')
                                setTimeout(() => {
                                  handleMedId(patient.med_care_id || ' ')
                                }, 0)
                              }}
                            >
                              View
                            </span>

                            <EditPatientDialog
                              Id={patient.id}
                              name={patient.name}
                              email={patient.email}
                              age={patient.age}
                              phone={patient.phone}
                              gender={patient.gender}
                            >
                              <span className="font-medium text-red-500 hover:underline cursor-pointer select-none">
                                Edit
                              </span>
                            </EditPatientDialog>

                            <Link
                              to="/dashboard/patientPrescription"
                              search={{
                                name: patient.name || '',
                                med_care_id: patient.med_care_id || '',
                                age: patient.age,
                                phone: patient.phone || '',
                                email: patient.email,
                                gender: patient.gender,
                                note: '',
                                prescriptionsContent: [],
                                relatedImages: [],
                                doctorName: auth.user?.name,
                                doctorQualification:
                                  auth.user?.qualification || ' ',
                                doctorPhone: auth.user?.cellNo || ' ',
                                id: patient.id,
                                doctorId: auth.user?.id,
                              }}
                              mask={{
                                to: '/dashboard/patientPrescription',
                              }}
                              className="font-medium text-green-500 hover:underline"
                            >
                              New
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {items.length === 0 && (
                    <div className="text-center py-8 text-indigo-300/70 italic">
                      No patients match your search criteria.
                    </div>
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

              <TabsContent value="Precsription" tabIndex={-1}>
                <GetPrescriptions
                  medCareId={medId}
                  userId={auth.user?.id || ' '}
                  doctorName={auth.user?.name || ' '}
                  doctorQualification={auth.user?.qualification || ' '}
                  doctorCellNo={auth.user?.cellNo || ' '}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
