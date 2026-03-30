"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, doc, setDoc } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"

const defaultAchievements = [
  {
    id: "first_checkin",
    name: "First Check-in",
    description: "Complete your first wellness check",
    icon: "🎯",
    category: "checkin",
    requirements: {
      type: "count",
      value: 1
    }
  },
  {
    id: "streak_3",
    name: "3 Day Streak",
    description: "Maintain a wellness check-in streak for 3 days",
    icon: "🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 3
    }
  },
  {
    id: "streak_7",
    name: "7 Day Streak",
    description: "Maintain a wellness check-in streak for 7 days",
    icon: "🔥🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 7
    }
  },
  {
    id: "streak_30",
    name: "30 Day Streak",
    description: "Maintain a wellness check-in streak for 30 days",
    icon: "🔥🔥🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 30
    }
  },
  {
    id: "checkin_7",
    name: "Weekly Check-in",
    description: "Complete 7 wellness check-ins",
    icon: "📝",
    category: "checkin",
    requirements: {
      type: "count",
      value: 7
    }
  },
  {
    id: "checkin_30",
    name: "Monthly Check-in",
    description: "Complete 30 wellness check-ins",
    icon: "📝📝",
    category: "checkin",
    requirements: {
      type: "count",
      value: 30
    }
  },
  {
    id: "mood_positive",
    name: "Positive Vibes",
    description: "Maintain an average mood of 4 or higher for 7 days",
    icon: "😊",
    category: "mood",
    requirements: {
      type: "average",
      value: 4,
      days: 7
    }
  },
  {
    id: "energy_high",
    name: "High Energy",
    description: "Maintain an average energy level of 4 or higher for 7 days",
    icon: "⚡",
    category: "energy",
    requirements: {
      type: "average",
      value: 4,
      days: 7
    }
  },
  {
    id: "sleep_quality",
    name: "Quality Sleep",
    description: "Maintain an average sleep quality of 4 or higher for 7 days",
    icon: "😴",
    category: "sleep",
    requirements: {
      type: "average",
      value: 4,
      days: 7
    }
  }
]

export default function AdminPage() {
  const { toast } = useToast()
  const { user } = useAuth()

  const handleInitAchievements = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to initialize achievements",
        variant: "destructive",
      })
      return
    }

    try {
      const achievementsRef = collection(db, "badges")
      
      for (const achievement of defaultAchievements) {
        await setDoc(doc(achievementsRef, achievement.id), achievement)
      }
      
      toast({
        title: "Success",
        description: "Achievements initialized successfully",
      })
    } catch (error) {
      console.error("Error initializing achievements:", error)
      toast({
        title: "Error",
        description: "Failed to initialize achievements",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Initialize Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Click the button below to initialize the default achievements in the database.
              This will create or update the achievement badges that users can earn.
            </p>
            <Button onClick={handleInitAchievements}>
              Initialize Achievements
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 