"use client"

import { useEffect, useState } from "react"
import { Brain, Moon, HeartPulse, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { focusAreaService, UserFocusArea } from "@/lib/services/focusAreaService"
import { useAuth } from "@/components/auth-provider"

const iconMap: Record<string, any> = {
  brain: Brain,
  moon: Moon,
  heart: HeartPulse,
  users: Users
}

export function FocusAreaList() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [focusAreas, setFocusAreas] = useState<UserFocusArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFocusAreas = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        const data = await focusAreaService.getUserFocusAreas(user.uid)
        setFocusAreas(data)
      } catch (err) {
        setError("Failed to load focus areas. Please try again later.")
        console.error("Error fetching focus areas:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFocusAreas()
  }, [user?.uid])

  const handleActivityToggle = async (userFocusAreaId: string, activityId: string, completed: boolean) => {
    try {
      const updatedFocusArea = await focusAreaService.updateActivityStatus(
        userFocusAreaId,
        activityId,
        completed
      )
      setFocusAreas(prev => 
        prev.map(fa => fa.id === userFocusAreaId ? updatedFocusArea : fa)
      )
    } catch (err) {
      console.error("Error updating activity status:", err)
    }
  }

  if (loading) {
    return (
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Areas</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
                <div className="mt-6 space-y-4">
                  <Skeleton className="h-4 w-24" />
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-start space-x-4 rounded-lg border p-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </Tabs>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Focus Areas</h2>
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  const filteredFocusAreas = focusAreas.filter(area => {
    switch (activeTab) {
      case "in-progress":
        return area.progress > 0 && area.progress < 100
      case "completed":
        return area.progress === 100
      default:
        return true
    }
  })

  if (filteredFocusAreas.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Focus Areas</h2>
        <div className="text-muted-foreground">
          {activeTab === "all"
            ? "No focus areas available. Start by adding a focus area to track your progress."
            : activeTab === "in-progress"
            ? "No focus areas in progress. Start working on your focus areas to see them here."
            : "No completed focus areas yet. Keep working on your goals!"}
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="all">All Areas</TabsTrigger>
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <div className="space-y-4">
        {filteredFocusAreas.map((userFocusArea) => {
          const Icon = iconMap[userFocusArea.focusArea.icon] || Brain
          return (
            <Card key={userFocusArea.id} id={userFocusArea.focusArea.id}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className={`rounded-full ${userFocusArea.focusArea.color} p-2`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>{userFocusArea.focusArea.title}</CardTitle>
                    <CardDescription>{userFocusArea.focusArea.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{userFocusArea.progress}%</span>
                  </div>
                  <Progress value={userFocusArea.progress} className="h-2" />
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium">Activities</h4>
                  {userFocusArea.focusArea.activities.map((activity) => {
                    const userActivity = userFocusArea.activities.find(
                      a => a.activityId === activity.id
                    )
                    const completed = userActivity?.completed || false
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-4 rounded-lg border p-3">
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-full ${completed ? "bg-teal-500" : "border border-muted-foreground"}`}
                        >
                          {completed && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-white"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-1 h-3 w-3"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{activity.duration}</span>
                          </div>
                        </div>
                        <Button
                          variant={completed ? "outline" : "default"}
                          size="sm"
                          className={completed ? "" : "bg-teal-600 hover:bg-teal-700"}
                          onClick={() => handleActivityToggle(userFocusArea.id, activity.id, !completed)}
                        >
                          {completed ? "Completed" : "Start"}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </Tabs>
  )
}
