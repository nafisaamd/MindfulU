"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Trophy, Activity } from "lucide-react"

export function ProfileHeader() {
  const { user } = useAuth()

  if (!user) return null

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : user.email?.[0].toUpperCase() || "U"

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
      <CardContent className="relative pt-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{user.displayName || "Anonymous User"}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <div className="flex flex-col items-center space-y-1">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Member since</span>
              <span className="text-xs text-muted-foreground">
                {user.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Badges</span>
              <Badge variant="secondary">12</Badge>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Check-ins</span>
              <Badge variant="secondary">28</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 