"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Target, BookOpen, Users, Calendar, MessageSquare, User, Settings, Menu, Headphones, Brain, BookOpenCheck, MessageCircle, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Focus Areas",
    href: "/dashboard/focus-areas",
    icon: Target,
  },
  {
    title: "Study Stress",
    href: "/dashboard/study-stress",
    icon: Brain,
  },
  {
    title: "Resources",
    href: "/dashboard/resources",
    icon: BookOpen,
  },
  {
    title: "Community",
    href: "/dashboard/community",
    icon: Users,
  },
  {
    title: "Counseling",
    href: "/dashboard/counseling",
    icon: Calendar,
  },
  {
    title: "Chat Support",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Journal",
    href: "/dashboard/journal",
    icon: BookOpenCheck,
  },
  {
    title: "Feedback",
    href: "/dashboard/feedback",
    icon: MessageCircle,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

// Admin navigation items
const adminNavItems = [
  {
    title: "Admin Dashboard",
    href: "/dashboard/admin",
    icon: Settings,
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const { isOpen, toggleSidebar } = useSidebar()

  // Get first letter of name or use fallback
  const userInitial = user?.displayName?.[0] || "U"
  const userName = user?.displayName || "Demo User"
  const userEmail = user?.email || "user@example.com"

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  return (
    <>
      <Sheet open={isOpen} onOpenChange={toggleSidebar}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <SheetHeader>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>
          <Sidebar>
            <SidebarHeader className="flex items-center px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
                  M
                </div>
                <span className="text-lg font-bold">MindfulU</span>
              </div>
            </SidebarHeader>
            <SidebarContent className="px-2">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {isAdmin && (
                  <>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Admin
                      </h2>
                      <div className="space-y-1">
                        {adminNavItems.map((item) => (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild isActive={pathname === item.href}>
                              <Link href={item.href} className="flex items-center gap-2">
                                <item.icon className="h-5 w-5" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">{userInitial}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </div>
              )}
            </SidebarFooter>
          </Sidebar>
        </SheetContent>
      </Sheet>
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex h-full flex-col gap-4 p-4">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
            {isAdmin && (
              <>
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Admin
                  </h2>
                  <div className="space-y-1">
                    {adminNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          pathname === item.href
                            ? "bg-secondary text-secondary-foreground"
                            : "hover:bg-secondary/50"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
