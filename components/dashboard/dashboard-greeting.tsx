"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardGreeting() {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("Hello")
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const hour = currentTime.getHours()

    if (hour < 12) {
      setGreeting("Good morning")
    } else if (hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [currentTime])

  const firstName = user?.displayName?.split(" ")[0] || "there"

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {greeting}, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            How are you feeling today? Remember to take a moment for yourself.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
