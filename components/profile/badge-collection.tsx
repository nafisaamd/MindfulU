"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { BadgeService } from "@/lib/services/badgeService"
import { Skeleton } from "@/components/ui/skeleton"

export function BadgeCollection() {
  const { user } = useAuth()
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const badgeService = new BadgeService()

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const userBadges = await badgeService.getUserBadges(user.uid)
        setBadges(userBadges)
      } catch (err) {
        console.error("Error fetching badges:", err)
        setError("Failed to load badges. Please try again later.")
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
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Your achievements and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-4">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Your achievements and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Please sign in to view your badges.
          </div>
        </CardContent>
      </Card>
    )
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Your achievements and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            You haven't earned any badges yet. Keep working on your wellness journey!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>Your achievements and milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center p-4 border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-2xl">{badge.icon}</span>
              </div>
              <p className="font-medium text-center">{badge.name}</p>
              <p className="text-sm text-muted-foreground text-center">{badge.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 