import { BookmarkIcon, FilePlus, PlusIcon, ViewIcon } from 'lucide-react'
import { NavPrimary } from '@/components/nav-primary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link, linkOptions } from '@tanstack/react-router'
import { extendedUser, NavPrimaryProps } from '@/lib/types'

// This is sample data.
const navItems: NavPrimaryProps['items'] = linkOptions([
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
])

export function AppSidebar({ user, role }: extendedUser) {
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
            if (role.toUpperCase() !== 'ADMIN') {
              return navItems.filter((item) => item.title !== 'Administer User')
            }
            return navItems
          })()}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
