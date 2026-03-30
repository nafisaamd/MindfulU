"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, X } from "lucide-react"
import { getFirebase } from "@/lib/firebase"

export function FirebaseStatus() {
  const [isVisible, setIsVisible] = useState(true)
  const [status, setStatus] = useState<"loading" | "configured" | "not-configured" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Skip on server-side
    if (typeof window === "undefined") {
      setStatus("loading")
      return
    }

    // Check Firebase status with a delay
    const checkFirebaseStatus = () => {
      try {
        // Check if Firebase environment variables are set
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

        if (!apiKey || !authDomain || !projectId) {
          setStatus("not-configured")
          setErrorMessage("Firebase environment variables are not properly configured")
          return
        }

        // Check if Firebase services are initialized
        const app = getFirebase.app()
        const auth = getFirebase.auth()
        const db = getFirebase.db()

        if (!app) {
          setStatus("error")
          setErrorMessage("Firebase app not initialized properly")
          return
        }

        if (!auth || !db) {
          setStatus("error")
          setErrorMessage("Firebase services not initialized properly")
          return
        }

        setStatus("configured")
      } catch (error: any) {
        console.error("Firebase status check error:", error)
        setStatus("error")
        setErrorMessage(error.message || "Unknown error checking Firebase status")
      }
    }

    // Add a delay to ensure Firebase has time to initialize
    const timer = setTimeout(checkFirebaseStatus, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Firebase Status</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Development environment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {status === "loading" && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
              >
                Checking...
              </Badge>
            )}
            {status === "configured" && (
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                <CheckCircle className="mr-1 h-3 w-3" /> Firebase Configured
              </Badge>
            )}
            {status === "not-configured" && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
              >
                <AlertCircle className="mr-1 h-3 w-3" /> Firebase Not Configured
              </Badge>
            )}
            {status === "error" && (
              <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                <AlertCircle className="mr-1 h-3 w-3" /> Firebase Error
              </Badge>
            )}
          </div>

          {status === "not-configured" && (
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Firebase environment variables are not properly configured.</p>
              <p className="mt-1">The app is running in demo mode with mock data.</p>
            </div>
          )}

          {status === "error" && errorMessage && (
            <div className="mt-2 text-xs text-red-500">
              <p>Error: {errorMessage}</p>
              <p className="mt-1">The app will run in demo mode with mock data.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            variant="link"
            className="px-0 text-xs text-teal-600 dark:text-teal-400"
            onClick={() => window.open("https://console.firebase.google.com/", "_blank")}
          >
            Go to Firebase Console
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
