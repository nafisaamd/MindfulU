"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { getFirebase, withFirebase } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if Firebase is available
  useEffect(() => {
    const checkFirebase = async () => {
      // Wait a bit to ensure Firebase has time to initialize
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const auth = getFirebase.auth()
      const db = getFirebase.db()

      setIsFirebaseAvailable(!!auth && !!db)
    }

    checkFirebase()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!isFirebaseAvailable) {
      // Handle demo mode signup
      handleDemoSignUp()
      return
    }

    try {
      // Use withFirebase helper to safely access Firebase services
      const success = await withFirebase(async ({ auth, db }) => {
        if (!auth || !db) {
          throw new Error("Firebase services are not available")
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update profile with name
        await updateProfile(user, { displayName: name })

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          createdAt: new Date(),
          focusAreas: ["stress", "sleep"],
          completedOnboarding: false,
        })

        return true
      })

      if (success) {
        toast({
          title: "Account created!",
          description: "Welcome to MindfulU. Let's complete your profile.",
        })

        // Redirect to onboarding
        router.push("/onboarding")
      } else {
        // Firebase services not available, fall back to demo mode
        handleDemoSignUp()
      }
    } catch (error: any) {
      console.error("Sign up error:", error)

      // Handle specific Firebase auth errors
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please try signing in instead.")
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection and try again.")
      } else if (error.code === "auth/invalid-api-key") {
        setError("Authentication service is temporarily unavailable. Please try again later.")
      } else {
        setError(error.message || "An error occurred during sign up. Please try again.")
      }

      toast({
        title: "Sign up failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // For demo purposes, allow bypassing authentication
  const handleDemoSignUp = () => {
    setIsLoading(false)
    router.push("/onboarding")
    toast({
      title: "Demo Mode",
      description: "Account created with demo data",
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details to create your MindfulU account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isFirebaseAvailable && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Firebase authentication is not available. You can continue in demo mode.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            {/* Demo mode button */}
            <Button type="button" variant="outline" className="w-full" onClick={handleDemoSignUp}>
              Continue in Demo Mode
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
