"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Brain, Moon, HeartPulse, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { focusAreaService, UserFocusArea } from "@/lib/services/focusAreaService"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const focusAreaIcons = {
  stress: Brain,
  sleep: Moon,
  anxiety: HeartPulse
}

const focusAreaColors = {
  stress: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  sleep: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  anxiety: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
}

export function FocusAreaCards() {
  const { user } = useAuth()
  const [focusAreas, setFocusAreas] = useState<UserFocusArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchUserData = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        const areas = await focusAreaService.getUserFocusAreas(user.uid)
        if (!mounted) return

        setFocusAreas(areas || [])
        setError(null)
      } catch (error) {
        console.error("Error fetching data:", error)
        if (mounted) {
          setError("Failed to load focus areas. Please try again later.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchUserData()

    return () => {
      mounted = false
    }
  }, [user])

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Focus Areas</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/focus-areas" className="flex items-center text-sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Focus Areas</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/focus-areas" className="flex items-center text-sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-32 mt-2" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (focusAreas.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Focus Areas</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <Brain className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">No focus areas yet</p>
                <p className="text-sm text-muted-foreground">
                  Start your wellness journey by adding focus areas to track your progress
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/focus-areas">
                  Add Focus Area
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your Focus Areas</h2>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/focus-areas" className="flex items-center text-sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {focusAreas.map((area) => {
          const Icon = focusAreaIcons[area.focusArea.id as keyof typeof focusAreaIcons]
          const color = focusAreaColors[area.focusArea.id as keyof typeof focusAreaColors]
          const completedActivities = area.activities.filter(a => a.completed).length
          const totalActivities = area.activities.length
          
          return (
            <Card key={area.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`rounded-full ${color} p-2`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardDescription>{area.progress}% Complete</CardDescription>
                </div>
                <CardTitle className="text-lg">{area.focusArea.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <Progress value={area.progress} className="h-2" />
                <p className="mt-2 text-sm text-muted-foreground">{area.focusArea.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {completedActivities} of {totalActivities} activities completed
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/focus-areas#${area.id}`}>Continue</Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
