import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { authFnMiddleware } from '#/middlewares/auth'
import { Field, FieldError } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { patientSearchSchema, routeSearchSchema } from '#/schemas/auth' // Now updated to an object schema!
import { Button } from '#/components/ui/button'
import { useState, useTransition } from 'react'
import { formatDateToDMY } from '#/lib/types'
import { EditPatientDialog } from '#/components/editPatientDialog'
import { AppPagination } from '#/components/appPagination'
import { calculateAge } from '#/components/datePicker'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import GetPrescriptions from '#/components/getPrescriptionTab'

var o_PAGE_SIZE = 8
const getPatients = createServerFn({ method: 'GET' })
  .validator(patientSearchSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const searchString = data?.search?.trim()
    const currentPage = data?.page || 1
    const PAGE_SIZE = o_PAGE_SIZE

    const whereClause = {
      activeStatus: true,

      ...(searchString
        ? {
            AND: [
              {
                OR: [
                  {
                    med_care_id: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    name: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    phone: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    }

    const [items, totalCount] = await Promise.all([
      prisma.patientRecord.findMany({
        where: whereClause,
        skip: (currentPage - 1) * PAGE_SIZE, // Skips records based on active index page
        take: PAGE_SIZE, //
        orderBy: { id: 'asc' },
      }),
      prisma.patientRecord.count({ where: whereClause }),
    ])

    return { items, totalCount }
  })

export const Route = createFileRoute('/dashboard/viewPatients')({
  validateSearch: (search) => routeSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => await getPatients({ data: search }),
  component: RouteComponent,
})

function RouteComponent() {
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
            search: value.search.trim() || undefined,
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
          <CardTitle className="text-sm flex w-full">
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className=" w-full mt-6"
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
          <Card className="">
            <CardHeader>
              <CardTitle className="text-sm flex w-full">
                <span> Patient Record:</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                              handleMedId(patient.med_care_id || ' ')
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
                            to="/dashboard/patientPrescription/$id"
                            params={{ id: String(patient.id) }}
                            search={{
                              name: patient.name,
                              med_care_id: patient.med_care_id,
                              age: patient.age,
                              phone: patient.phone,
                              email: patient.email,
                              gender: patient.gender,
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
                  <li className="text-center py-8 text-indigo-300/70 italic">
                    No patients match your search criteria.
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Precsription">
          <GetPrescriptions medCareId={medId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
