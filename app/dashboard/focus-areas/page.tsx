"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { X, Brain, Moon, HeartPulse, Book, Users, Activity, Sun, Music } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Timestamp } from "firebase/firestore"
import { BadgeService } from "@/lib/services/badgeService"

interface SuggestedActivity {
  id: string
  title: string
  duration: string
  description: string
  badge?: string
  completed?: boolean
}

interface FocusArea {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
  suggestedActivities: SuggestedActivity[]
  progress?: number
}

type FocusAreaId = 'stress' | 'sleep' | 'anxiety' | 'depression' | 'academic' | 'social' | 'physical' | 'mindfulness' | 'nutrition' | 'creativity'

const focusAreasMap: Record<FocusAreaId, FocusArea> = {
  stress: { 
    id: "stress", 
    label: "Stress Management",
    icon: Brain,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    description: "Learn techniques to manage and reduce stress in your daily life",
    suggestedActivities: [
      { id: "breathing", title: "Deep breathing exercise", duration: "3 minutes", description: "Follow guided breathing exercises", badge: "Breath Master" },
      { id: "journal", title: "Stress journal", duration: "10 minutes", description: "Write about your stress triggers and coping strategies", badge: "Reflective Writer" },
      { id: "nature", title: "Nature walk", duration: "15 minutes", description: "Take a walk in nature to clear your mind", badge: "Nature Explorer" },
      { id: "progressive", title: "Progressive muscle relaxation", duration: "10 minutes", description: "Practice progressive muscle relaxation technique", badge: "Relaxation Expert" }
    ]
  },
  sleep: { 
    id: "sleep", 
    label: "Sleep Quality",
    icon: Moon,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    description: "Improve your sleep habits and quality",
    suggestedActivities: [
      { id: "routine", title: "Sleep routine", duration: "30 minutes", description: "Establish a consistent bedtime routine", badge: "Routine Master" },
      { id: "screen", title: "Screen time limit", duration: "1 hour", description: "Reduce screen time before bed", badge: "Digital Detox" },
      { id: "environment", title: "Sleep environment", duration: "15 minutes", description: "Optimize your bedroom for better sleep", badge: "Sleep Environment Expert" },
      { id: "relaxation", title: "Pre-sleep relaxation", duration: "20 minutes", description: "Practice relaxation techniques before bed", badge: "Sleep Relaxation Pro" },
      { id: "tracking", title: "Sleep tracking", duration: "5 minutes", description: "Track your sleep patterns and quality", badge: "Sleep Tracker" }
    ]
  },
  anxiety: { 
    id: "anxiety", 
    label: "Anxiety",
    icon: HeartPulse,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    description: "Develop strategies to manage anxiety",
    suggestedActivities: [
      { id: "grounding", title: "Grounding exercise", duration: "5 minutes", description: "Practice 5-4-3-2-1 grounding technique", badge: "Grounding Guru" },
      { id: "exposure", title: "Gradual exposure", duration: "15 minutes", description: "Practice facing anxiety triggers gradually", badge: "Exposure Expert" },
      { id: "thought", title: "Thought challenging", duration: "10 minutes", description: "Challenge anxious thoughts with evidence", badge: "Thought Challenger" },
      { id: "visualization", title: "Positive visualization", duration: "10 minutes", description: "Practice visualizing positive outcomes", badge: "Visualization Master" },
      { id: "support", title: "Support system", duration: "20 minutes", description: "Reach out to your support system", badge: "Support Seeker" }
    ]
  },
  depression: {
    id: "depression",
    label: "Depression",
    icon: Brain,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    description: "Develop strategies to manage depression",
    suggestedActivities: [
      { id: "activity", title: "Daily activity", duration: "30 minutes", description: "Engage in a physical or social activity", badge: "Activity Achiever" },
      { id: "gratitude", title: "Gratitude journal", duration: "5 minutes", description: "Write down three things you're grateful for", badge: "Gratitude Guru" },
      { id: "routine", title: "Daily routine", duration: "15 minutes", description: "Establish a consistent daily schedule", badge: "Routine Builder" },
      { id: "self-care", title: "Self-care practice", duration: "20 minutes", description: "Engage in self-care activities", badge: "Self-Care Champion" },
      { id: "goal", title: "Small goal setting", duration: "10 minutes", description: "Set and achieve small daily goals", badge: "Goal Getter" }
    ]
  },
  academic: {
    id: "academic",
    label: "Academic Pressure",
    icon: Book,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    description: "Manage academic stress and improve study habits",
    suggestedActivities: [
      { id: "planning", title: "Study planning", duration: "15 minutes", description: "Create a study schedule for the week", badge: "Study Planner" },
      { id: "breaks", title: "Regular breaks", duration: "5 minutes", description: "Take short breaks during study sessions", badge: "Break Master" },
      { id: "organization", title: "Task organization", duration: "10 minutes", description: "Organize and prioritize academic tasks", badge: "Task Organizer" },
      { id: "technique", title: "Study technique", duration: "20 minutes", description: "Learn and practice a new study technique", badge: "Study Technique Expert" },
      { id: "review", title: "Regular review", duration: "15 minutes", description: "Review and consolidate your learning", badge: "Review Master" }
    ]
  },
  social: {
    id: "social",
    label: "Social Connection",
    icon: Users,
    color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    description: "Build and maintain meaningful social connections",
    suggestedActivities: [
      { id: "reachout", title: "Reach out", duration: "10 minutes", description: "Connect with a friend or family member", badge: "Connection Builder" },
      { id: "group", title: "Group activity", duration: "1 hour", description: "Participate in a group activity or event", badge: "Group Participant" },
      { id: "volunteer", title: "Volunteer", duration: "2 hours", description: "Volunteer for a cause you care about", badge: "Community Helper" },
      { id: "new", title: "New connection", duration: "30 minutes", description: "Make a new social connection", badge: "Social Explorer" },
      { id: "support", title: "Support others", duration: "20 minutes", description: "Offer support to someone in need", badge: "Support Provider" }
    ]
  },
  physical: {
    id: "physical",
    label: "Physical Health",
    icon: Activity,
    color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    description: "Improve your physical health and well-being",
    suggestedActivities: [
      { id: "exercise", title: "Exercise", duration: "30 minutes", description: "Engage in physical exercise", badge: "Fitness Enthusiast" },
      { id: "stretch", title: "Stretching", duration: "10 minutes", description: "Practice stretching exercises", badge: "Flexibility Master" },
      { id: "walk", title: "Daily walk", duration: "20 minutes", description: "Take a brisk walk", badge: "Walking Warrior" },
      { id: "yoga", title: "Yoga", duration: "20 minutes", description: "Practice yoga", badge: "Yoga Practitioner" },
      { id: "dance", title: "Dance", duration: "15 minutes", description: "Dance to your favorite music", badge: "Dance Enthusiast" }
    ]
  },
  mindfulness: {
    id: "mindfulness",
    label: "Mindfulness",
    icon: Sun,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    description: "Cultivate mindfulness and present moment awareness",
    suggestedActivities: [
      { id: "breathing", title: "Mindful breathing", duration: "5 minutes", description: "Practice mindful breathing", badge: "Breath Master" },
      { id: "eating", title: "Mindful eating", duration: "15 minutes", description: "Practice mindful eating", badge: "Mindful Eater" },
      { id: "walking", title: "Mindful walking", duration: "10 minutes", description: "Practice mindful walking", badge: "Mindful Walker" }
    ]
  },
  nutrition: {
    id: "nutrition",
    label: "Nutrition",
    icon: Activity,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    description: "Improve your eating habits and nutrition",
    suggestedActivities: [
      { id: "meal", title: "Meal planning", duration: "20 minutes", description: "Plan healthy meals for the week", badge: "Meal Planner" },
      { id: "cooking", title: "Healthy cooking", duration: "30 minutes", description: "Prepare a healthy meal", badge: "Healthy Chef" },
      { id: "hydration", title: "Hydration tracking", duration: "5 minutes", description: "Track your water intake", badge: "Hydration Hero" },
      { id: "snack", title: "Healthy snacking", duration: "10 minutes", description: "Prepare healthy snacks", badge: "Healthy Snacker" },
      { id: "mindful", title: "Mindful eating", duration: "15 minutes", description: "Practice mindful eating", badge: "Mindful Eater" }
    ]
  },
  creativity: {
    id: "creativity",
    label: "Creativity",
    icon: Music,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    description: "Express yourself through creative activities",
    suggestedActivities: [
      { id: "art", title: "Art creation", duration: "30 minutes", description: "Create art or craft", badge: "Creative Artist" },
      { id: "music", title: "Music", duration: "20 minutes", description: "Play or listen to music", badge: "Music Enthusiast" },
      { id: "writing", title: "Creative writing", duration: "15 minutes", description: "Engage in creative writing", badge: "Creative Writer" },
      { id: "dance", title: "Creative movement", duration: "15 minutes", description: "Express through movement", badge: "Movement Artist" },
      { id: "photography", title: "Photography", duration: "20 minutes", description: "Take creative photos", badge: "Creative Photographer" }
    ]
  }
}

export default function FocusAreasPage() {
  const [selectedArea, setSelectedArea] = useState<FocusAreaId | "">("")
  const [userFocusAreas, setUserFocusAreas] = useState<FocusAreaId[]>([])
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [user, setUser] = useState(auth.currentUser)
  const badgeService = new BadgeService()

  useEffect(() => {
    const fetchFocusAreas = async () => {
      if (!auth.currentUser) return

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid))
        const userData = userDoc.data()
        setUserFocusAreas(userData?.focusAreas || [])
        setCompletedActivities(userData?.completedActivities || {})
      } catch (error) {
        console.error("Error fetching focus areas:", error)
        toast({
          title: "Error",
          description: "Failed to load focus areas",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFocusAreas()
  }, [toast])

  const handleAddFocusArea = async () => {
    if (!auth.currentUser || !selectedArea) return

    if (userFocusAreas.includes(selectedArea)) {
      toast({
        title: "Error",
        description: "This focus area already exists",
        variant: "destructive",
      })
      return
    }

    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        focusAreas: arrayUnion(selectedArea),
      })

      setUserFocusAreas([...userFocusAreas, selectedArea])
      setSelectedArea("")

      toast({
        title: "Success",
        description: "Focus area added successfully",
      })
    } catch (error) {
      console.error("Error adding focus area:", error)
      toast({
        title: "Error",
        description: "Failed to add focus area",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFocusArea = async (area: FocusAreaId) => {
    if (!auth.currentUser) return

    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        focusAreas: arrayRemove(area),
      })

      setUserFocusAreas(userFocusAreas.filter((a) => a !== area))

      toast({
        title: "Success",
        description: "Focus area removed successfully",
      })
    } catch (error) {
      console.error("Error removing focus area:", error)
      toast({
        title: "Error",
        description: "Failed to remove focus area",
        variant: "destructive",
      })
    }
  }

  const handleActivityToggle = async (areaId: FocusAreaId, activityId: string) => {
    if (!user) return

    try {
      const newCompleted = !completedActivities[`${areaId}-${activityId}`]
      const newCompletedActivities = {
        ...completedActivities,
        [`${areaId}-${activityId}`]: newCompleted
      }

      // Update local state
      setCompletedActivities(newCompletedActivities)

      // Update Firestore
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        completedActivities: newCompletedActivities,
        updatedAt: Timestamp.now()
      })

      if (newCompleted) {
        const activity = focusAreasMap[areaId].suggestedActivities.find(a => a.id === activityId)
        if (activity?.badge) {
          // Award the badge using the badge service
          await badgeService.awardBadge(user.uid, activity.badge)
          
          toast({
            title: "Congratulations!",
            description: `You earned the "${activity.badge}" badge!`,
          })
        }
      }
    } catch (error) {
      console.error("Error updating activity:", error)
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      })
    }
  }

  const getEarnedBadges = () => {
    const earnedBadges: { name: string; area: string }[] = []
    
    userFocusAreas.forEach(areaId => {
      const area = focusAreasMap[areaId]
      area.suggestedActivities.forEach(activity => {
        if (completedActivities[`${areaId}-${activity.id}`] && activity.badge) {
          earnedBadges.push({
            name: activity.badge,
            area: area.label
          })
        }
      })
    })
    
    return earnedBadges
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const earnedBadges = getEarnedBadges()

  return (
    <div className="container mx-auto py-8 space-y-8">
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Badges</CardTitle>
            <CardDescription>Celebrate your achievements!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {earnedBadges.map((badge, index) => (
                <div key={index} className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-center">{badge.name}</p>
                  <p className="text-sm text-muted-foreground text-center">{badge.area}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Focus Areas</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedArea} onValueChange={(value: FocusAreaId | "") => setSelectedArea(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a focus area" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(focusAreasMap).map(([id, area]) => (
                <SelectItem 
                  key={id} 
                  value={id as FocusAreaId}
                  disabled={userFocusAreas.includes(id as FocusAreaId)}
                >
                  {area.label} {userFocusAreas.includes(id as FocusAreaId) ? "(Added)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddFocusArea} disabled={!selectedArea}>
            Add Focus Area
          </Button>
        </div>
      </div>

      {selectedArea && focusAreasMap[selectedArea] && !userFocusAreas.includes(selectedArea) && (
        <Card>
          <CardHeader>
            <CardTitle>{focusAreasMap[selectedArea].label}</CardTitle>
            <CardDescription>{focusAreasMap[selectedArea].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="font-medium">Suggested Activities:</p>
              <ul className="space-y-2">
                {focusAreasMap[selectedArea].suggestedActivities.map((activity) => (
                  <li key={activity.id} className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.duration}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      {activity.badge && (
                        <Badge variant="secondary" className="mt-1">
                          Earn: {activity.badge}
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userFocusAreas.map((areaId) => {
          const area = focusAreasMap[areaId]
          if (!area) return null

          const completedCount = area.suggestedActivities.filter(
            activity => completedActivities[`${areaId}-${activity.id}`]
          ).length
          const progress = (completedCount / area.suggestedActivities.length) * 100

          return (
            <Card key={areaId}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`rounded-full ${area.color} p-2`}>
                    <area.icon className="h-4 w-4" />
                  </div>
                  <CardTitle>{area.label}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFocusArea(areaId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{area.description}</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Progress</p>
                    <p className="text-sm text-muted-foreground">{completedCount}/{area.suggestedActivities.length} activities</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="font-medium">Suggested Activities:</p>
                  <ul className="space-y-2">
                    {area.suggestedActivities.map((activity) => {
                      const isCompleted = completedActivities[`${areaId}-${activity.id}`]
                      return (
                        <li key={activity.id} className="flex items-start space-x-2">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => handleActivityToggle(areaId, activity.id)}
                            className="mt-1"
                          />
                          <div>
                            <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{activity.duration}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            {activity.badge && (
                              <Badge 
                                variant={isCompleted ? "default" : "secondary"} 
                                className="mt-1"
                              >
                                {isCompleted ? "Earned: " : "Earn: "}{activity.badge}
                              </Badge>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
