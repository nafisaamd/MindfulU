"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { wellnessService, type WellnessEntry } from "@/lib/services/wellnessService"
import { toast } from "sonner"
import { Smile, Zap, Moon, Loader2, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const moodEmojis = ["😢", "😕", "😐", "🙂", "😊"]
const energyLevels = ["😴", "😪", "😌", "😃", "⚡"]
const sleepEmojis = ["😴", "😪", "😌", "😃", "⚡"]

export function WellnessCheckIn() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [nextCheckInTime, setNextCheckInTime] = useState<Date | null>(null)
  const [checkIn, setCheckIn] = useState({
    mood: 3,
    energy: 5,
    sleep: 7,
    notes: ""
  })

  useEffect(() => {
    const checkTodaySubmission = async () => {
      if (!user) return

      try {
        setCheckingStatus(true)
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)
        
        if (userDoc.exists()) {
          const lastCheck = userDoc.data()?.lastWellnessCheck?.toDate()
          if (lastCheck) {
            const lastCheckDate = new Date(lastCheck)
            const today = new Date()
            
            // Reset hours to compare dates only
            lastCheckDate.setHours(0, 0, 0, 0)
            today.setHours(0, 0, 0, 0)
            
            if (lastCheckDate.getTime() === today.getTime()) {
              setHasCheckedInToday(true)
              // Calculate next check-in time (tomorrow at midnight)
              const nextCheck = new Date(today)
              nextCheck.setDate(nextCheck.getDate() + 1)
              setNextCheckInTime(nextCheck)
            }
          }
        }
      } catch (error) {
        console.error("Error checking submission status:", error)
        toast.error("Failed to check submission status")
      } finally {
        setCheckingStatus(false)
      }
    }

    checkTodaySubmission()
  }, [user])

  const handleSubmit = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Submit mood
      await wellnessService.addWellnessEntry(user.uid, {
        type: "mood",
        value: checkIn.mood,
        notes: checkIn.notes
      })

      // Submit energy
      await wellnessService.addWellnessEntry(user.uid, {
        type: "energy",
        value: checkIn.energy,
        notes: checkIn.notes
      })

      // Submit sleep
      await wellnessService.addWellnessEntry(user.uid, {
        type: "sleep",
        value: checkIn.sleep,
        notes: checkIn.notes
      })

      // Update last check-in time
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        lastWellnessCheck: Timestamp.now()
      })

      setHasCheckedInToday(true)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      setNextCheckInTime(tomorrow)

      toast.success("Wellness check-in completed!")
      setCheckIn({
        mood: 3,
        energy: 5,
        sleep: 7,
        notes: ""
      })
    } catch (error) {
      console.error("Error submitting wellness check-in:", error)
      toast.error("Failed to submit wellness check-in")
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <Card className="border-2 border-primary/10">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (hasCheckedInToday) {
    return (
      <Card className="border-2 border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Check-in Complete
          </CardTitle>
          <CardDescription className="text-base">
            You've completed your wellness check for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Next check-in available at {nextCheckInTime?.toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Daily Wellness Check-in</CardTitle>
        <CardDescription className="text-base">Track your mood, energy, and sleep</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Mood Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smile className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Mood</h3>
                <p className="text-sm text-muted-foreground">How are you feeling today?</p>
              </div>
            </div>
            <div className="space-y-2">
              <Slider
                value={[checkIn.mood]}
                min={1}
                max={5}
                step={1}
                onValueChange={([value]) => setCheckIn({ ...checkIn, mood: value })}
                className="py-4"
              />
              <div className="flex justify-between text-sm">
                {moodEmojis.map((emoji, index) => (
                  <span 
                    key={index}
                    className={cn(
                      "transition-transform hover:scale-125",
                      checkIn.mood === index + 1 && "text-primary font-medium"
                    )}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Energy Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Energy Level</h3>
                <p className="text-sm text-muted-foreground">How's your energy today?</p>
              </div>
            </div>
            <div className="space-y-2">
              <Slider
                value={[checkIn.energy]}
                min={1}
                max={5}
                step={1}
                onValueChange={([value]) => setCheckIn({ ...checkIn, energy: value })}
                className="py-4"
              />
              <div className="flex justify-between text-sm">
                {energyLevels.map((emoji, index) => (
                  <span 
                    key={index}
                    className={cn(
                      "transition-transform hover:scale-125",
                      checkIn.energy === index + 1 && "text-primary font-medium"
                    )}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sleep Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Moon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Sleep Duration</h3>
                <p className="text-sm text-muted-foreground">How many hours did you sleep?</p>
              </div>
            </div>
            <div className="space-y-2">
              <Slider
                value={[checkIn.sleep]}
                min={4}
                max={12}
                step={0.5}
                onValueChange={([value]) => setCheckIn({ ...checkIn, sleep: value })}
                className="py-4"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">4h</span>
                <span className="text-primary font-medium">{checkIn.sleep}h</span>
                <span className="text-muted-foreground">12h</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <h3 className="font-semibold">Additional Notes</h3>
            <Textarea
              placeholder="Share your thoughts or feelings..."
              value={checkIn.notes}
              onChange={(e) => setCheckIn({ ...checkIn, notes: e.target.value })}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button 
            className="w-full h-12 text-base font-medium" 
            onClick={handleSubmit}
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
      </CardContent>
    </Card>
  )
} 