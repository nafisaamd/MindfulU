"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signInAnonymously, setPersistence, browserLocalPersistence } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { User } from "@/lib/types"
import { User as FirebaseUser } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  signInAnonymously: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInAnonymously: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Set persistence to LOCAL
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error("Error setting auth persistence:", error)
      })

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Store the Firebase user
        setFirebaseUser(firebaseUser)

        // Here you would typically fetch the additional user data from Firestore
        // and combine it with the Firebase user data
        const userData = {
          ...firebaseUser,
          role: 'user', // Default role, should be fetched from Firestore
          createdAt: new Date(),
          updatedAt: new Date()
        } as User
        setUser(userData)
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      setLoading(false)
      setError(null)
    }, (error) => {
      console.error("Auth state error:", error)
      setError(error as Error)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleAnonymousSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInAnonymously(auth)
      router.push('/dashboard')
    } catch (error) {
      console.error("Anonymous sign in error:", error)
      setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user: firebaseUser, // Return the Firebase user
    loading,
    error,
    signInAnonymously: handleAnonymousSignIn,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
