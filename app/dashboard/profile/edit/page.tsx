"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { userService } from "@/lib/services/userService"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    goals: [] as string[],
    challenges: [] as string[]
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        const profile = await userService.getUserProfile(user.uid)
        if (!profile) {
          toast({
            title: "Error",
            description: "Profile not found. Please try again.",
            variant: "destructive"
          })
          return
        }
        setFormData({
          displayName: profile.displayName,
          bio: profile.bio ?? "",
          goals: profile.mentalHealthInfo?.goals ?? [],
          challenges: profile.mentalHealthInfo?.challenges ?? []
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return

    try {
      setSaving(true)
      await userService.updateUserProfile(user.uid, {
        displayName: formData.displayName,
        bio: formData.bio,
        mentalHealthInfo: {
          goals: formData.goals,
          challenges: formData.challenges
        }
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.push("/dashboard/profile")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Edit Profile</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Enter your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Goals (one per line)</Label>
              <Textarea
                id="goals"
                value={formData.goals.join("\n")}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  goals: e.target.value.split("\n").filter(goal => goal.trim() !== "")
                })}
                placeholder="Enter your goals"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Challenges (one per line)</Label>
              <Textarea
                id="challenges"
                value={formData.challenges.join("\n")}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  challenges: e.target.value.split("\n").filter(challenge => challenge.trim() !== "")
                })}
                placeholder="Enter your challenges"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/profile")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
} 