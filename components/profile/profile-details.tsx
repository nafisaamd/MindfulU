"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"

export function ProfileDetails() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(true)

  useEffect(() => {
    const initializeProfile = async () => {
      if (!user) return

      try {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (!userDoc.exists()) {
          // Create initial user profile if it doesn't exist
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "",
            createdAt: new Date(),
            updatedAt: new Date(),
            role: "user",
            status: "active",
            preferences: {
              notifications: true,
              emailUpdates: true
            }
          })
        } else {
          // Load existing preferences
          const data = userDoc.data()
          setNotifications(data.preferences?.notifications ?? true)
          setEmailUpdates(data.preferences?.emailUpdates ?? true)
        }
      } catch (error) {
        console.error("Error initializing profile:", error)
        toast.error("Failed to load profile data")
      }
    }

    initializeProfile()
  }, [user])

  if (!user) return null

  const handleUpdateProfile = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      // Update display name in Firebase Auth
      await updateProfile(user, { displayName })
      
      // Update user preferences in Firestore
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        displayName,
        preferences: {
          notifications,
          emailUpdates
        },
        updatedAt: new Date()
      })

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your profile information and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about your wellness journey
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly wellness reports and updates
              </p>
            </div>
            <Switch
              checked={emailUpdates}
              onCheckedChange={setEmailUpdates}
            />
          </div>
        </div>

        <Button
          onClick={handleUpdateProfile}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
} 