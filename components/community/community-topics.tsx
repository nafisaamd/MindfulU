"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Heart, 
  Moon, 
  Users, 
  Activity, 
  Smile, 
  Coffee, 
  BookOpen,
  Loader2
} from "lucide-react"
import { communityService, CommunityTopic } from "@/lib/services/communityService"

interface CommunityTopicsProps {
  selectedTopic: string | null
  onTopicSelect: (topicId: string | null) => void
}

export function CommunityTopics({ selectedTopic, onTopicSelect }: CommunityTopicsProps) {
  const [topics, setTopics] = useState<CommunityTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true)
        const data = await communityService.getCommunityTopics()
        setTopics(data)
      } catch (err) {
        setError("Failed to load community topics")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopics()
  }, [])

  const iconMap: Record<string, React.ReactNode> = {
    "brain": <Brain className="h-5 w-5" />,
    "heart": <Heart className="h-5 w-5" />,
    "moon": <Moon className="h-5 w-5" />,
    "users": <Users className="h-5 w-5" />,
    "activity": <Activity className="h-5 w-5" />,
    "smile": <Smile className="h-5 w-5" />,
    "coffee": <Coffee className="h-5 w-5" />,
    "book": <BookOpen className="h-5 w-5" />
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">{error}</div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Community Topics</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onTopicSelect(null)}
          >
            View All
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {topics.map((topic) => (
            <Button
              key={topic.id}
              variant={selectedTopic === topic.name ? "default" : "outline"}
              className="flex items-center justify-between p-4 h-auto"
              onClick={() => onTopicSelect(topic.name)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${topic.color}`}>
                  {iconMap[topic.icon] || <BookOpen className="h-5 w-5" />}
                </div>
                <span>{topic.name}</span>
              </div>
              <Badge variant="secondary">{topic.count}</Badge>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
