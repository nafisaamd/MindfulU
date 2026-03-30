"use client"

import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileDetails } from "@/components/profile/profile-details"
import { BadgeCollection } from "@/components/profile/badge-collection"
import { WellnessHistory } from "@/components/profile/wellness-history"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in")
      toast({
        title: "Authentication required",
        description: "Please sign in to view your profile",
        variant: "destructive"
      })
    }
  }, [user, loading, router, toast])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading profile...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we load your profile data</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <ProfileHeader />
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileDetails />
        <BadgeCollection />
      </div>
      <WellnessHistory />
    </div>
  )
}
