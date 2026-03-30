"use client"

import { WeeklyProgress } from "@/components/dashboard/weekly-progress"
import { Achievements } from "@/components/dashboard/achievements"
import { WellnessCheckIn } from "@/components/dashboard/wellness-check-in"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, BookOpen, Timer } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default function DashboardPage() {
  const { user, loading, error } = useAuth()
  const router = useRouter()
  const greeting = getTimeBasedGreeting()

  useEffect(() => {
    if (!loading && !user) {
      console.log("No user found, redirecting to sign in")
      router.push('/sign-in')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-2">Loading your dashboard...</p>
          <p className="text-sm text-muted-foreground">Please wait while we set up your experience</p>
        </div>
      </div>
    )
  }

  if (error) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-2">Something went wrong</p>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => router.push('/sign-in')}>
            Return to Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.displayName || user.email?.split('@')[0] || "User"

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3">{greeting}, {displayName}!</h1>
        <p className="text-lg text-muted-foreground">Welcome to your personalized wellness dashboard</p>
      </div>

      {/* Main Grid - 3 columns on large screens, 2 on medium, 1 on small */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Progress Card */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyProgress />
          </CardContent>
        </Card>

        {/* Wellness Check-in Card */}
        <Card className="row-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Wellness Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <WellnessCheckIn />
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <Achievements />
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/resources">
            <Card className="hover:bg-accent/50 transition-all duration-200 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access helpful articles, videos, and tools for mental wellness
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/study-stress">
            <Card className="hover:bg-accent/50 transition-all duration-200 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Brain className="h-6 w-6 text-primary" />
                  Study Stress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage academic stress with study planning and stress reduction tools
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/meditation">
            <Card className="hover:bg-accent/50 transition-all duration-200 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Brain className="h-6 w-6 text-primary" />
                  Meditation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Guided meditation sessions for stress relief and mindfulness
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/sessions">
            <Card className="hover:bg-accent/50 transition-all duration-200 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Timer className="h-6 w-6 text-primary" />
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Schedule and manage your counseling sessions
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
