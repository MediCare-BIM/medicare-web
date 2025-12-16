'use client';

import * as React from 'react';
import {
  IconCalendar,
  IconHelp,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconReport,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { APP_NAME } from '@/lib/consts';
import { NavDocuments } from './nav-documents';
import { User } from '@supabase/supabase-js';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconLayoutDashboard,
    },
    {
      title: 'Pacienti',
      url: '/pacients',
      icon: IconUsers,
    },
    {
      title: 'Calendar',
      url: '/dashboard/calendar',
      icon: IconCalendar,
    },
  ],
  navSecondary: [
    {
      title: 'Setări',
      url: '/settings',
      icon: IconSettings,
    },
    {
      title: 'Suport',
      url: '/support',
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: 'Rapoarte',
      url: '/reports',
      icon: IconReport,
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User | null;
}) {
  const navUser = user
    ? {
        name: user.user_metadata.name || user.email || '',
        email: user.email || '',
        avatar: user.user_metadata.avatar_url || '',
      }
    : null;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{APP_NAME}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{navUser && <NavUser user={navUser} />}</SidebarFooter>
    </Sidebar>
  );
}
