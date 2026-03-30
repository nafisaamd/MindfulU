"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { updateProfile, updateEmail, sendEmailVerification, deleteUser, reauthenticateWithCredential, EmailAuthProvider, signOut } from "firebase/auth"
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, Mail, Trash2, Download, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { AccountSettings } from "@/components/settings/account-settings"

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Profile Settings
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  
  // Notification Settings
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    weeklyReport: true,
    reminders: true,
    communityUpdates: true
  })

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    setName(user.displayName || "")
    setEmail(user.email || "")
    // Load additional user preferences from Firestore
    loadUserPreferences()
  }, [user, authLoading, router])

  const loadUserPreferences = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    
    try {
      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const data = userDoc.data()
        setBio(data.bio || "")
        setNotifications(data.notifications || {
          push: true,
          email: false,
          weeklyReport: true,
          reminders: true,
          communityUpdates: true
        })
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
      toast({
        title: "Error",
        description: "Failed to load user preferences. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !db) return

    console.log("User object:", user)

    setIsSaving(true)
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: name
      })

      // Update Firestore user document
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        name,
        bio,
        notifications,
        updatedAt: new Date()
      })

      toast({
        title: "Profile updated",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmailUpdate = async () => {
    if (!user || !email) return

    try {
      await updateEmail(user, email)
      await sendEmailVerification(user)
      toast({
        title: "Email updated",
        description: "Please check your email to verify the new address.",
      })
    } catch (error) {
      console.error("Error updating email:", error)
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDataExport = async () => {
    // Implement data export functionality
    toast({
      title: "Coming soon",
      description: "Data export feature will be available soon.",
    })
  }

  const handleAccountDeletion = async () => {
    if (!user || !user.email) return

    try {
      // Prompt for password
      const password = prompt("Please enter your password to confirm account deletion:")
      if (!password) {
        toast({
          title: "Cancelled",
          description: "Account deletion was cancelled.",
        })
        return
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)

      // Delete user document from Firestore
      const userRef = doc(db, "users", user.uid)
      await deleteDoc(userRef)

      // Delete user from Firebase Auth
      await deleteUser(user)

      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      })
      
      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      let errorMessage = "Failed to delete account. Please try again."
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again."
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log in again before deleting your account."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading settings...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
      <Card>
        <CardHeader>
              <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
            <Input
              id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
                  />
                  <Button onClick={handleEmailUpdate}>Update</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
            />
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
      <Card>
        <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about your wellness activities
              </p>
            </div>
            <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get important updates via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly wellness progress reports
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => setNotifications({...notifications, weeklyReport: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for daily check-ins and activities
                  </p>
                </div>
                <Switch
                  checked={notifications.reminders}
                  onCheckedChange={(checked) => setNotifications({...notifications, reminders: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Community Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Stay updated with community activities
                  </p>
                </div>
                <Switch
                  checked={notifications.communityUpdates}
                  onCheckedChange={(checked) => setNotifications({...notifications, communityUpdates: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings 
            onDataExport={handleDataExport}
            onAccountDeletion={handleAccountDeletion}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
} 