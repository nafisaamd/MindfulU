"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth, waitForFirebase } from "./firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setupAuth = async () => {
      try {
        // Wait for Firebase to be fully initialized
        const firebase = await waitForFirebase()
        if (!firebase) {
          console.error("Firebase not initialized")
          setLoading(false)
          return
        }

        // Set up auth state listener
        unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log("Auth state changed:", user ? {
            uid: user.uid,
            email: user.email,
            isAnonymous: user.isAnonymous
          } : "No user")
      setUser(user)
      setLoading(false)
    })

        setInitialized(true)
      } catch (error) {
        console.error("Error setting up auth:", error)
        setLoading(false)
      }
    }

    setupAuth()

    return () => {
      if (unsubscribe) {
      console.log("Cleaning up auth listener")
      unsubscribe()
      }
    }
  }, [])

  // Only render children when auth is initialized
  if (!initialized) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 