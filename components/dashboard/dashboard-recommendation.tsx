"use client"

import { useEffect, useState } from "react"
import { recommendationService, UserRecommendation } from "@/lib/services/recommendationService"
import { useAuth } from "@/lib/contexts/authContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const categoryIcons = {
  mood: "😊",
  energy: "⚡",
  sleep: "😴",
  general: "✨"
}

const typeColors = {
  mindfulness: "bg-blue-100 text-blue-800",
  social: "bg-purple-100 text-purple-800",
  activity: "bg-green-100 text-green-800",
  rest: "bg-yellow-100 text-yellow-800",
  wellness: "bg-pink-100 text-pink-800",
  nutrition: "bg-orange-100 text-orange-800"
}

export function DashboardRecommendation() {
  const { user } = useAuth()
  const [recommendation, setRecommendation] = useState<UserRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    if (user) {
      loadRecommendation()
    }
  }, [user])

  const loadRecommendation = async () => {
    try {
      setLoading(true)
      const rec = await recommendationService.getDailyRecommendation(user!.uid)
      setRecommendation(rec)
    } catch (error) {
      console.error("Error loading recommendation:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!recommendation) return

    try {
      setCompleting(true)
      await recommendationService.markRecommendationComplete(user!.uid, recommendation.id)
      setRecommendation(prev => prev ? { ...prev, completed: true } : null)
    } catch (error) {
      console.error("Error completing recommendation:", error)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!recommendation) {
    return null
  }

  return (
    <Card className={cn(
      "bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-sm transition-all duration-300",
      recommendation.completed && "opacity-75"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Daily Wellness Tip
          </CardTitle>
          <span className="text-2xl" role="img" aria-label={recommendation.category}>
            {categoryIcons[recommendation.category]}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg mb-1">{recommendation.title}</h3>
            <p className="text-gray-600 text-sm">{recommendation.description}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              typeColors[recommendation.type as keyof typeof typeColors]
            )}>
              {recommendation.type}
            </span>
            
            {!recommendation.completed ? (
              <Button
                onClick={handleComplete}
                disabled={completing}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {completing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </>
                )}
              </Button>
            ) : (
              <span className="text-sm text-gray-500 flex items-center">
                <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                Completed
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
