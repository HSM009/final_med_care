import { prisma } from '#/db'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useTransition } from 'react'
import { authFnMiddleware } from '#/middlewares/auth'
import { medicineSearchSchema, routeMedicineSearchSchema } from '#/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { Field, FieldError, FieldGroup } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { MedicineDialog } from '#/components/addMedicineDialog'
import { AppPagination } from '#/components/appPagination'
import { EditMedicineDialog } from '#/components/editMedicineDialog'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
var o_PAGE_SIZE = 8

export const getMedicineList = createServerFn({ method: 'GET' })
  .validator(medicineSearchSchema)
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
                    medicineContentEnglish: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    medicineContentUrdu: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    Dosage: {
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
      prisma.medicineList.findMany({
        where: whereClause,
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { id: 'asc' },
      }),
      prisma.medicineList.count({ where: whereClause }),
    ])

    return { items, totalCount }
  })

export const Route = createFileRoute('/dashboard/viewMedicineList')({
  component: RouteComponent,

  validateSearch: (search) => routeMedicineSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) =>
    await getMedicineList({ data: search }),
  pendingComponent: () => (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-zinc-400">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-sm">Loading your Page...</p>
    </div>
  ),
  pendingMs: 1000,
})

function RouteComponent() {
  const { items, totalCount } = Route.useLoaderData()
  const { search, page = 1 } = Route.useSearch()
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
          }),
        })
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
  return (
    <div className="p-8">
      <div className="text-3xl font-bold text-white mb-4 text-center">
        View Medicine List
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className=" text-xs">Search Medicine:</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
                      {/* <FieldLabel htmlFor={field.name} className="text-xs">
                        Search Medicines:
                      </FieldLabel> */}
                      <div className="flex gap-2">
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Search by Medicine Name in English or Urdu or Dosage ..."
                          type="text"
                          autoComplete="off"
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
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className=" text-xs">Medicine List:</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="relative overflow-x-auto shadow-xs rounded-t-2xl border">
              <table className="w-full text-sm text-left text-body">
                <thead className="text-sm text-body bg-neutral-600 border-b">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium dark:text-primary text-secondary"
                    >
                      Medicine Content English
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium dark:text-primary text-secondary"
                    >
                      Medicine Content Urdu
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium dark:text-primary text-secondary"
                    >
                      Dosage
                    </th>
                    <th
                      scope="col"
                      className="  px-6 py-3 font-medium right-0 text-right "
                    >
                      <MedicineDialog>
                        <Button className=" cursor-pointer bg-primary hover:bg-primary/60">
                          Add New Medicine
                        </Button>
                      </MedicineDialog>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((medicine) => (
                    <tr
                      key={medicine.id}
                      className="border-b hover:bg-neutral-600/50 transition-colors "
                    >
                      <td className="px-6 py-3 text-primary">
                        {medicine.medicineContentEnglish}
                      </td>
                      <td className="px-6 py-3 text-primary">
                        {medicine.medicineContentUrdu}
                      </td>
                      <td className="px-6 py-3 text-primary">
                        {medicine.Dosage}
                      </td>
                      <td className="px-6 py-3 text-primary text-right">
                        <EditMedicineDialog
                          Id={medicine.id}
                          medicineContentEnglish={
                            medicine.medicineContentEnglish
                          }
                          medicineContentUrdu={medicine.medicineContentUrdu}
                          Dosage={medicine.Dosage}
                        >
                          <span className=" hover:underline cursor-pointer bg-transparent hover:bg-transparent text-red-500 ">
                            Edit
                          </span>
                        </EditMedicineDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getMedicineList.length === 0 && (
                <li className="text-center py-8 text-indigo-300/70 italic">
                  No medicines added or matched your search criteria.
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
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
