"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { focusAreaService, UserFocusArea } from "@/lib/services/focusAreaService"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function FocusAreaProgress() {
  const { user } = useAuth()
  const [userFocusAreas, setUserFocusAreas] = useState<UserFocusArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFocusAreas = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        const data = await focusAreaService.getUserFocusAreas(user.uid)
        setUserFocusAreas(data)
      } catch (err) {
        setError("Failed to load focus areas. Please try again later.")
        console.error("Error fetching focus areas:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFocusAreas()
  }, [user?.uid])

  const calculateOverallProgress = () => {
    if (userFocusAreas.length === 0) return 0
    const totalProgress = userFocusAreas.reduce((sum, area) => sum + area.progress, 0)
    return Math.round(totalProgress / userFocusAreas.length)
  }

  const getCompletedActivities = () => {
    return userFocusAreas.reduce((sum, area) => sum + area.completedActivities, 0)
  }

  const getTotalActivities = () => {
    return userFocusAreas.reduce((sum, area) => sum + area.totalActivities, 0)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  const overallProgress = calculateOverallProgress()
  const completedActivities = getCompletedActivities()
  const totalActivities = getTotalActivities()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Overall Progress</h3>
            <span className="text-sm font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Activities Completed</p>
              <p className="text-lg font-medium">{completedActivities}/{totalActivities}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Focus Areas</p>
              <p className="text-lg font-medium">{userFocusAreas.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Average Progress</p>
              <p className="text-lg font-medium">{overallProgress}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Completed Areas</p>
              <p className="text-lg font-medium">
                {userFocusAreas.filter(area => area.progress === 100).length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
