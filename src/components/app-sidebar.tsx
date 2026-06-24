import { BookmarkIcon, FilePlus, PlusIcon, ViewIcon } from 'lucide-react'
import { NavPrimary } from '#/components/nav-primary'
import { NavUser } from '#/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '#/components/ui/sidebar'
import { Link } from '@tanstack/react-router'
import { type NavPrimaryProps, type AuthContextResult } from '#/lib/types'
import { hasPermission } from '#/lib/roleBaseActions'
import { Roles } from '#/generated/prisma/enums'

const navItems: NavPrimaryProps['items'] = [
  {
    title: 'View Patients',
    icon: ViewIcon,
    to: '/dashboard/viewPatients',
    activeOptions: { exact: false },
  },
  {
    title: 'Add Patients',
    icon: PlusIcon,
    to: '/dashboard/addPatient',
    activeOptions: { exact: false },
  },
  {
    title: 'Add & View Medicine List',
    icon: FilePlus,
    to: '/dashboard/viewMedicineList',
    activeOptions: { exact: false },
  },
  {
    title: 'Administer User',
    icon: FilePlus,
    to: '/dashboard/administerUser',
    activeOptions: { exact: false },
  },
]

export function AppSidebar({ auth }: AuthContextResult) {
  console.log(auth.user?.role as Roles)
  return (
    <Sidebar collapsible="icon" className=" ">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard" className=" flex items-center gap-3">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <BookmarkIcon className=" size-4" />
                </div>
                <div className=" grid flex-1 text-left text-sm leading-tight">
                  <span className=" font-medium">MED CARE</span>
                  <span className=" text-xs">
                    Your Best Healthcare Companion
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavPrimary
          items={(() => {
            if (!hasPermission(auth.user?.role as Roles, Roles.Admin)) {
              return navItems.filter((item) => item.title !== 'Administer User')
            }
            return navItems
          })()}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser name={auth.user?.name} email={auth.user?.email} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
