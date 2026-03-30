import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { userService, UserProfile } from "@/lib/services/userService"
import { focusAreaService, UserFocusArea } from "@/lib/services/focusAreaService"

interface MentalHealthInfo {
  goals?: string[]
  challenges?: string[]
}

interface ExtendedUserProfile extends UserProfile {
  mentalHealthInfo?: MentalHealthInfo
}

interface ProfileData {
  profile: ExtendedUserProfile | null
  focusAreas: UserFocusArea[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProfile(): ProfileData {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null)
  const [focusAreas, setFocusAreas] = useState<UserFocusArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfileData = async () => {
    if (authLoading) {
      return
    }

    if (!user?.uid) {
      setError("Please sign in to view your profile")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const [userProfile, userFocusAreas] = await Promise.all([
        userService.getUserProfile(user.uid),
        focusAreaService.getUserFocusAreas(user.uid)
      ])
      
      setProfile(userProfile as ExtendedUserProfile)
      setFocusAreas(userFocusAreas || []) // Handle null case by defaulting to empty array
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile data"
      setError(errorMessage)
      console.error("Error fetching profile data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [user?.uid, authLoading])

  return {
    profile,
    focusAreas,
    loading: loading || authLoading,
    error,
    refetch: fetchProfileData
  }
} 