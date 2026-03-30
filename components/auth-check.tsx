"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("AuthCheck: State changed", { user: !!user, loading, error: !!error })
    if (!loading && !user && !error) {
      console.log("AuthCheck: No user, redirecting to sign in")
      router.push("/sign-in")
    }
  }, [user, loading, error, router])

  if (loading && !user) {
    console.log("AuthCheck: Rendering loading state (not authenticated)")
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    console.log("AuthCheck: Rendering error state")
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {error.message}
              <div className="mt-2">Please check your Firebase configuration or try again later.</div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log("AuthCheck: No user, returning null")
    return null
  }

  console.log("AuthCheck: Rendering children")
  return <>{children}</>
}
