"use client"

import { useAuth } from "@/components/auth-provider"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, MessageSquare, Users, Settings } from "lucide-react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  // Check if user is admin
  if (!loading && (!user || user.role !== 'admin')) {
    redirect('/dashboard')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your platform's features and content</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/admin/sessions">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sessions
              </CardTitle>
              <CardDescription>Manage counseling sessions</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/admin/feedback">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Feedback
              </CardTitle>
              <CardDescription>View user feedback and surveys</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/admin/resources">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Resources
              </CardTitle>
              <CardDescription>Manage study resources</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/admin/settings">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>Platform settings</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        {children}
      </div>
    </div>
  )
} 