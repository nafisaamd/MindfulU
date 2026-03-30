"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { AuthCheck } from "@/components/auth-check"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  console.log("DashboardLayout: Render", { user: !!user, loading })

  return (
    <AuthCheck>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthCheck>
  )
}
