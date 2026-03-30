"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { badgeService, type UserBadge } from "@/lib/services/badgeService"
import { achievementService } from "@/lib/services/achievementService"

export function RecentBadges() {
  const { user } = useAuth()
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return
      
      try {
        const userBadges = await badgeService.getRecentBadges(user.uid)
        setBadges(userBadges)
      } catch (error) {
        console.error("Error fetching badges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No badges earned yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {badges.map((userBadge) => (
            <div key={userBadge.id} className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl">{userBadge.badge.icon}</span>
              </div>
              <div>
                <h4 className="font-medium">{userBadge.badge.name}</h4>
                <p className="text-sm text-muted-foreground">{userBadge.badge.description}</p>
                <Badge variant="secondary" className="mt-1">
                  {userBadge.badge.category}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
