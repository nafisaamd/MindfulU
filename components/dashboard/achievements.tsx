import { useEffect, useState } from "react"
import { achievementService, Achievement } from "@/lib/services/achievementService"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { wellnessService } from "@/lib/services/wellnessService"
import { Skeleton } from "@/components/ui/skeleton"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    let mounted = true

    const loadAchievements = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        const [unlockedAchievements, userDoc] = await Promise.all([
          achievementService.getUnlockedAchievements(user.uid),
          getDoc(doc(db, "users", user.uid))
        ])

        if (!mounted) return

        setAchievements(unlockedAchievements || [])
        const userData = userDoc.data()
        
        // Calculate progress for each achievement category
        const progressData: Record<string, number> = {}
        progressData.streak = userData?.streak || 0

        // Get check-in progress
        const wellnessChecks = await wellnessService.getWellnessHistory(user.uid, "mood", 30)
        progressData.checkin = wellnessChecks.length

        // Get mood/energy/sleep progress
        const metrics = ["mood", "energy", "sleep"] as const
        for (const metric of metrics) {
          const data = await wellnessService.getWellnessHistory(user.uid, metric, 7)
          if (data.length > 0) {
            progressData[metric] = data.reduce((acc, item) => acc + item.value, 0) / data.length
          }
        }

        if (mounted) {
          setProgress(progressData)
          setError(null)
        }
      } catch (error) {
        console.error("Error loading achievements:", error)
        if (mounted) {
          setError("Failed to load achievements. Please try again later.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadAchievements()

    return () => {
      mounted = false
    }
  }, [user])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No achievements unlocked yet. Keep tracking your wellness to earn badges!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="text-lg">
                  {achievement.icon}
                </Badge>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                {progress[achievement.category] !== undefined && (
                  <div className="mt-2">
                    <Progress 
                      value={(progress[achievement.category] / achievement.requirements.value) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(progress[achievement.category])} / {achievement.requirements.value}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 