"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc, arrayUnion } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function WellnessCheckPage() {
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [sleep, setSleep] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const wellnessData = {
        type: "wellness",
        mood,
        energy,
        sleep,
        date: new Date(),
      }

      await updateDoc(doc(db, "users", user.uid), {
        wellnessData: arrayUnion(wellnessData),
        lastWellnessCheck: new Date(),
      })

      toast({
        title: "Success",
        description: "Your wellness check has been recorded",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting wellness check:", error)
      toast({
        title: "Error",
        description: "Failed to submit wellness check",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Daily Wellness Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label>How are you feeling today? (1-5)</Label>
            <Slider
              value={[mood]}
              onValueChange={([value]) => setMood(value)}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Energy Level (1-5)</Label>
            <Slider
              value={[energy]}
              onValueChange={([value]) => setEnergy(value)}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Sleep Quality (1-5)</Label>
            <Slider
              value={[sleep]}
              onValueChange={([value]) => setSleep(value)}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Very Poor</span>
              <span>Very Good</span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Wellness Check"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 