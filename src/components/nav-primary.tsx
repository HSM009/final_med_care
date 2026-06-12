import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'
import { NavPrimaryProps } from '@/lib/types'

export function NavPrimary({ items }: NavPrimaryProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((items, index) => {
            return (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild size="sm">
                  <Link
                    activeProps={{ 'data-active': true }}
                    to={items.to}
                    activeOptions={items.activeOptions}
                  >
                    <items.icon />
                    <span>{items.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
