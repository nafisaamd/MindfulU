"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, setDoc, arrayUnion, Timestamp } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"
import { achievementService } from "@/lib/services/achievementService"
import { Loader2 } from "lucide-react"
import { waitForFirebase } from "@/lib/firebase"

export function DailyWellnessCheck() {
  const [activeTab, setActiveTab] = useState("mood")
  const [submitted, setSubmitted] = useState(false)
  const [selectedValues, setSelectedValues] = useState({
    mood: 2,
    energy: 2,
    sleep: 2
  })
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [mood, setMood] = useState("")
  const [energy, setEnergy] = useState("")
  const [sleep, setSleep] = useState("")
  const [notes, setNotes] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Wait for Firebase to be fully initialized
  useEffect(() => {
    const initialize = async () => {
      try {
        await waitForFirebase()
        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing Firebase:", error)
        toast({
          title: "Error",
          description: "Failed to initialize. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    initialize()
  }, [])

  useEffect(() => {
    const checkTodaySubmission = async () => {
      if (!user || !db || !isInitialized) return

      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)
        
        if (userDoc.exists()) {
          const lastCheck = userDoc.data()?.lastWellnessCheck?.toDate()
        if (lastCheck) {
          const lastCheckDate = new Date(lastCheck)
          lastCheckDate.setHours(0, 0, 0, 0)
          
          if (lastCheckDate.getTime() === today.getTime()) {
            setSubmitted(true)
            }
          }
        }
      } catch (error) {
        console.error("Error checking submission:", error)
      }
    }

    checkTodaySubmission()
  }, [user, isInitialized])

  const handleValueSelect = (category: string, value: number) => {
    setSelectedValues(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !isInitialized) {
      toast({
        title: "Error",
        description: "Please wait while we initialize your session",
        variant: "destructive",
      })
      return
    }

    if (submitted) {
      toast({
        title: "Already Submitted",
        description: "You have already submitted your check-in for today",
        variant: "default",
      })
      return
    }

    setLoading(true)
    try {
      // First, verify the user document exists
      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        // Create initial user document if it doesn't exist
        const initialUserData = {
          uid: user.uid,
          displayName: user.displayName || "New User",
          email: user.email || "",
          streak: 0,
          lastCheckIn: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          wellnessChecks: 0,
          longestStreak: 0,
          wellnessData: [],
          lastWellnessCheck: null
        }
        await setDoc(userRef, initialUserData)
      }

      // Calculate new streak
      const userData = userDoc.data()
      const lastCheckIn = userData?.lastCheckIn?.toDate()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let newStreak = 1
      if (lastCheckIn) {
        const lastCheckInDate = new Date(lastCheckIn)
        lastCheckInDate.setHours(0, 0, 0, 0)
        
        const diffTime = Math.abs(today.getTime() - lastCheckInDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          newStreak = (userData?.streak || 0) + 1
        }
      }

      // Create the check-in data
      const checkInData = {
        userId: user.uid,
        type: "wellness",
        mood: selectedValues.mood,
        energy: selectedValues.energy,
        sleep: selectedValues.sleep,
        notes: notes || "",
        date: Timestamp.now()
      }

      // Add check-in to wellnessChecks collection
      const wellnessRef = collection(db, "wellnessChecks")
      await addDoc(wellnessRef, checkInData)

      // Update user document with the check-in data and streak
      await updateDoc(userRef, {
        lastWellnessCheck: Timestamp.now(),
        lastCheckIn: Timestamp.now(),
        streak: newStreak,
        longestStreak: Math.max(newStreak, userData?.longestStreak || 0),
        wellnessChecks: (userData?.wellnessChecks || 0) + 1,
        wellnessData: arrayUnion({
          type: "wellness",
          mood: selectedValues.mood,
          energy: selectedValues.energy,
          sleep: selectedValues.sleep,
          notes: notes || "",
          date: Timestamp.now()
        })
      })

      // Check for new achievements
      const newAchievements = await achievementService.checkAchievements(user.uid)
      if (newAchievements && newAchievements.length > 0) {
        toast({
          title: "New Achievement Unlocked!",
          description: `You've earned ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!`,
        })
      }

      setSubmitted(true)
      toast({
        title: "Success",
        description: "Your wellness check has been submitted successfully",
      })

      // Reset form
      setSelectedValues({ mood: 2, energy: 2, sleep: 2 })
      setNotes("")
    } catch (error) {
      console.error("Error submitting check-in:", error)
      toast({
        title: "Error",
        description: "Failed to submit check-in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !isInitialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Check-in Complete</h3>
            <p className="text-sm text-muted-foreground">
              You've already completed your wellness check for today. Come back tomorrow!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Daily Wellness Check</CardTitle>
        <CardDescription>How are you feeling today?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="mood" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mood">Mood</TabsTrigger>
              <TabsTrigger value="energy">Energy</TabsTrigger>
              <TabsTrigger value="sleep">Sleep</TabsTrigger>
            </TabsList>
            <TabsContent value="mood" className="pt-4">
              <div className="flex justify-between">
                {["😔", "😐", "🙂", "😊", "😁"].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleValueSelect("mood", index)}
                    className={`flex flex-col items-center p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      selectedValues.mood === index ? "bg-teal-100 dark:bg-teal-900/20" : ""
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs mt-1">
                      {index === 0
                        ? "Poor"
                        : index === 1
                          ? "Low"
                          : index === 2
                            ? "Okay"
                            : index === 3
                              ? "Good"
                              : "Great"}
                    </span>
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="energy" className="pt-4">
              <div className="flex justify-between">
                {["🔋", "🔋", "🔋", "🔋", "🔋"].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleValueSelect("energy", index)}
                    className={`flex flex-col items-center p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      selectedValues.energy === index ? "bg-teal-100 dark:bg-teal-900/20" : ""
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs mt-1">
                      {index === 0
                        ? "Very Low"
                        : index === 1
                          ? "Low"
                          : index === 2
                            ? "Moderate"
                            : index === 3
                              ? "High"
                              : "Very High"}
                    </span>
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="sleep" className="pt-4">
              <div className="flex justify-between">
                {["😴", "😴", "😴", "😴", "😴"].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleValueSelect("sleep", index)}
                    className={`flex flex-col items-center p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      selectedValues.sleep === index ? "bg-teal-100 dark:bg-teal-900/20" : ""
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs mt-1">
                      {index === 0
                        ? "< 4 hrs"
                        : index === 1
                          ? "4-5 hrs"
                          : index === 2
                            ? "6-7 hrs"
                            : index === 3
                              ? "7-8 hrs"
                              : "8+ hrs"}
                    </span>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="mt-4">
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Check-in"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
