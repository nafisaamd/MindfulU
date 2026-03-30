"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, ClipboardList, Settings } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
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
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage all counseling sessions, track progress, and handle scheduling
              </p>
            </CardContent>
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
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access user feedback, survey responses, and platform improvement suggestions
              </p>
            </CardContent>
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
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add, edit, and organize study materials and resources for students
              </p>
            </CardContent>
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
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure platform settings, manage user roles, and system preferences
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/dashboard/admin/sessions/new" className="block">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted">
                  Schedule New Session
                </button>
              </Link>
              <Link href="/dashboard/admin/feedback/new-survey" className="block">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted">
                  Create New Survey
                </button>
              </Link>
              <Link href="/dashboard/admin/resources/new" className="block">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted">
                  Add New Resource
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">New feedback submissions</span>
                <span className="text-sm font-medium">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Upcoming sessions</span>
                <span className="text-sm font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New resources added</span>
                <span className="text-sm font-medium">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 