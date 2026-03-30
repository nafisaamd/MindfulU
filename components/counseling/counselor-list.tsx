"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { userService } from "@/lib/services/userService"
import { UserProfile } from "@/lib/services/userService"
import { Skeleton } from "@/components/ui/skeleton"

export function CounselorList() {
  const [counselors, setCounselors] = useState<UserProfile[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        setLoading(true)
        const data = await userService.getCounselors()
        setCounselors(data || [])
      } catch (err) {
        setError("Failed to load counselors. Please try again later.")
        console.error("Error fetching counselors:", err)
        setCounselors([])
      } finally {
        setLoading(false)
      }
    }

    fetchCounselors()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Available Counselors</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Available Counselors</h2>
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  if (!counselors || counselors.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Available Counselors</h2>
        <div className="text-muted-foreground">No counselors available at the moment.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Available Counselors</h2>
      <div className="space-y-4">
        {counselors.map((counselor) => (
          <Card key={counselor.uid}>
            <CardHeader className="pb-2">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={counselor.photoURL || "/placeholder.svg"} alt={counselor.displayName} />
                  <AvatarFallback>{counselor.displayName?.[0] || "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{counselor.displayName}</CardTitle>
                  <CardDescription>{counselor.mentalHealthInfo?.focusAreas?.join(", ") || "Mental Health Counselor"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {counselor.mentalHealthInfo?.focusAreas?.map((specialty) => (
                    <Badge key={specialty} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{counselor.bio || "Professional mental health counselor"}</p>
                <div className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="text-muted-foreground">{counselor.status}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">View Profile & Book</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
