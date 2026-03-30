"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const focusAreas = [
  { id: "stress", label: "Stress Management" },
  { id: "sleep", label: "Sleep Quality" },
  { id: "anxiety", label: "Anxiety" },
  { id: "depression", label: "Depression" },
  { id: "social", label: "Social Connection" },
  { id: "academic", label: "Academic Pressure" },
]

const personalityTypes = [
  { id: "introvert", label: "Introvert - I recharge by spending time alone" },
  { id: "extrovert", label: "Extrovert - I gain energy from being around others" },
  { id: "ambivert", label: "Ambivert - I'm somewhere in between" },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([])
  const [personalityType, setPersonalityType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user)
      if (!user) {
        router.push("/auth/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleFocusAreaChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedFocusAreas([...selectedFocusAreas, id])
    } else {
      setSelectedFocusAreas(selectedFocusAreas.filter((area) => area !== id))
    }
  }

  const handleNext = () => {
    if (step === 1 && selectedFocusAreas.length === 0) {
      toast({
        title: "Please select at least one focus area",
        variant: "destructive",
      })
      return
    }

    if (step === 2 && !personalityType) {
      toast({
        title: "Please select a personality type",
        variant: "destructive",
      })
      return
    }

    setStep(step + 1)
  }

  const handleComplete = async () => {
    if (!auth.currentUser) {
      setError("You must be logged in to complete onboarding")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        focusAreas: selectedFocusAreas,
        personalityType,
        completedOnboarding: true,
        updatedAt: new Date(),
      })

      toast({
        title: "Profile completed!",
        description: "Your personalized dashboard is ready.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error saving profile:", error)
      setError("There was an error saving your profile. Please try again.")

      toast({
        title: "Error saving profile",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we verify your authentication.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Your Mental Health Journey</CardTitle>
          <CardDescription>
            Let's personalize your experience by understanding your needs better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium">What areas would you like to focus on?</h3>
              <div className="space-y-2">
                {focusAreas.map((area) => (
                  <div key={area.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={area.id}
                      checked={selectedFocusAreas.includes(area.id)}
                      onCheckedChange={(checked) =>
                        handleFocusAreaChange(area.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={area.id}>{area.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-medium">What's your personality type?</h3>
              <RadioGroup
                value={personalityType}
                onValueChange={setPersonalityType}
                className="space-y-2"
              >
                {personalityTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.id} id={type.id} />
                    <Label htmlFor={type.id}>{type.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">Review your selections</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Focus Areas:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFocusAreas.map((areaId) => {
                    const area = focusAreas.find((a) => a.id === areaId)
                    return (
                      <span
                        key={areaId}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {area?.label}
                      </span>
                    )
                  })}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Personality Type:</p>
                <p className="font-medium">
                  {personalityTypes.find((type) => type.id === personalityType)?.label}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
