"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function AdminSetupPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const setupAdmin = async () => {
    if (!user) {
      toast.error("Please log in first")
      return
    }

    try {
      setLoading(true)
      console.log("Starting admin setup for user:", user.uid)
      
      const userRef = doc(db, 'users', user.uid)
      console.log("Checking existing user document...")
      
      const userDoc = await getDoc(userRef)
      console.log("User document exists:", userDoc.exists())
      
      if (!userDoc.exists()) {
        console.log("Creating new user document with admin role...")
        // Create new user document with admin role
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || user.email,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log("New user document created successfully")
      } else {
        console.log("Updating existing user document...")
        // Update existing user document
        await setDoc(userRef, {
          ...userDoc.data(),
          role: 'admin',
          updatedAt: new Date()
        }, { merge: true })
        console.log("User document updated successfully")
      }

      toast.success("Successfully set up admin account! Redirecting to admin dashboard...")
      
      // Wait a moment to show the success message before redirecting
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error("Detailed error setting up admin:", error)
      toast.error(`Failed to set up admin account: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>
            Set up your account as an administrator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to set up your account as an administrator. 
              This will give you access to the admin dashboard and all admin features.
            </p>
            <Button 
              onClick={setupAdmin} 
              disabled={loading || !user}
              className="w-full"
            >
              {loading ? "Setting up..." : "Set Up Admin Account"}
            </Button>
            {user && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Logged in as: {user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  User ID: {user.uid}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 