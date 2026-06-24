import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Roles } from '#/generated/prisma/enums'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/roleSelect/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="">
          <CardHeader>
            <CardTitle className=" text-center">
              Select the login you want to continue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=" grid grid-cols-2 gap-3 justify-center">
              <div className=" min-h-40">
                <Link
                  to="/login"
                  search={{ type: Roles.Patient }}
                  className=" flex h-full w-full justify-center text-center items-center bg-blue-500/50 hover:bg-blue-500 cursor-pointer"
                >
                  Patient Login
                </Link>
              </div>
              <div className=" min-h-40">
                <Link
                  to="/login"
                  search={{ type: Roles.Doctor }}
                  className="flex h-full w-full justify-center text-center items-center bg-red-500/50 hover:bg-red-500 cursor-pointer"
                >
                  Doctor Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
