"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth"
import { getFirebase, withFirebase } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SignInPage() {
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
      const auth = getFirebase.auth()
      setIsFirebaseAvailable(!!auth)
    }

    checkFirebase()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const success = await withFirebase(async ({ auth }) => {
        if (!auth) {
          throw new Error("Firebase auth is not available")
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        console.log("Signed in user:", userCredential.user)
        return true
      })

      if (success) {
        toast({
          title: "Success",
          description: "Signed in successfully",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      handleSignInError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignInError = (error: any) => {
    if (error.code === "auth/invalid-credential" || 
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password") {
        setError("Invalid email or password. Please try again.")
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection and try again.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.")
      } else {
        setError(error.message || "An error occurred during sign in. Please try again.")
      }

      toast({
        title: "Sign in failed",
      description: error.message || "Please check your credentials and try again.",
      variant: "destructive",
    })
  }

  const handleDemoSignIn = async () => {
    setIsLoading(true)
    try {
      const success = await withFirebase(async ({ auth }) => {
        if (!auth) {
          throw new Error("Firebase auth is not available")
        }

        const userCredential = await signInAnonymously(auth)
        console.log("Demo user signed in:", userCredential.user)
        return true
      })

      if (success) {
        toast({
          title: "Demo Mode",
          description: "Signed in with demo account",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Demo sign in error:", error)
      setError("Failed to sign in with demo account. Please try again.")
      toast({
        title: "Demo sign in failed",
        description: "Please try again or use regular sign in.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleDemoSignIn}
              disabled={isLoading}
            >
              Continue in Demo Mode
            </Button>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
