"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Play, CheckCircle, Heart, HeartOff, Volume2, VolumeX, Clock } from "lucide-react"

interface MeditationSession {
  id: string
  title: string
  description: string
  duration: string
  videoId: string
  thumbnail: string
  category: "beginner" | "intermediate" | "advanced"
}

const meditationSessions: MeditationSession[] = [
  // Beginner Sessions
  {
    id: "breathing",
    title: "Breathing Exercise",
    description: "A short breathing exercise to help you center yourself and reduce stress.",
    duration: "5 minutes",
    videoId: "inpok4MKVLM",
    thumbnail: "https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg",
    category: "beginner"
  },
  {
    id: "body-scan",
    title: "Body Scan",
    description: "Progressive relaxation technique to release tension and promote calmness.",
    duration: "10 minutes",
    videoId: "8HYLyuJZKno",
    thumbnail: "https://img.youtube.com/vi/8HYLyuJZKno/maxresdefault.jpg",
    category: "beginner"
  },
  {
    id: "mindful-walking",
    title: "Mindful Walking",
    description: "Combine movement with mindfulness for a refreshing meditation experience.",
    duration: "15 minutes",
    videoId: "O-6f5wQXSu8",
    thumbnail: "https://img.youtube.com/vi/O-6f5wQXSu8/maxresdefault.jpg",
    category: "beginner"
  },
  {
    id: "morning-meditation",
    title: "Morning Meditation",
    description: "Start your day with clarity and intention through this gentle morning practice.",
    duration: "10 minutes",
    videoId: "H3vLZqPZxZE",
    thumbnail: "https://img.youtube.com/vi/H3vLZqPZxZE/maxresdefault.jpg",
    category: "beginner"
  },
  {
    id: "sleep-meditation",
    title: "Sleep Meditation",
    description: "A calming meditation to help you relax and prepare for restful sleep.",
    duration: "20 minutes",
    videoId: "1ZYbU82GVz4",
    thumbnail: "https://img.youtube.com/vi/1ZYbU82GVz4/maxresdefault.jpg",
    category: "beginner"
  },
  // Intermediate Sessions
  {
    id: "loving-kindness",
    title: "Loving Kindness Meditation",
    description: "Cultivate compassion and positive emotions through this heart-centered practice.",
    duration: "15 minutes",
    videoId: "sz7cpV7ERsM",
    thumbnail: "https://img.youtube.com/vi/sz7cpV7ERsM/maxresdefault.jpg",
    category: "intermediate"
  },
  {
    id: "anxiety-relief",
    title: "Anxiety Relief Meditation",
    description: "A guided practice to help manage anxiety and find inner peace.",
    duration: "15 minutes",
    videoId: "O-6f5wQXSu8",
    thumbnail: "https://img.youtube.com/vi/O-6f5wQXSu8/maxresdefault.jpg",
    category: "intermediate"
  },
  {
    id: "mindful-eating",
    title: "Mindful Eating Meditation",
    description: "Learn to eat with awareness and appreciation for your food.",
    duration: "10 minutes",
    videoId: "WLZqzqZ0QrY",
    thumbnail: "https://img.youtube.com/vi/WLZqzqZ0QrY/maxresdefault.jpg",
    category: "intermediate"
  },
  // Advanced Sessions
  {
    id: "vipassana",
    title: "Vipassana Meditation",
    description: "An advanced insight meditation practice for deep self-awareness.",
    duration: "30 minutes",
    videoId: "5GSeWdjyr1c",
    thumbnail: "https://img.youtube.com/vi/5GSeWdjyr1c/maxresdefault.jpg",
    category: "advanced"
  },
  {
    id: "zen-meditation",
    title: "Zen Meditation",
    description: "Experience the traditional Zen practice of sitting meditation.",
    duration: "25 minutes",
    videoId: "8HYLyuJZKno",
    thumbnail: "https://img.youtube.com/vi/8HYLyuJZKno/maxresdefault.jpg",
    category: "advanced"
  },
  {
    id: "chakra-meditation",
    title: "Chakra Meditation",
    description: "Balance your energy centers through this guided chakra meditation.",
    duration: "20 minutes",
    videoId: "inpok4MKVLM",
    thumbnail: "https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg",
    category: "advanced"
  }
]

const FAVORITES_KEY = "meditation_favorites"
const COMPLETED_KEY = "meditation_completed"
const RECENT_KEY = "meditation_recent"

export default function MeditationPage() {
  const { user } = useAuth()
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<"beginner" | "intermediate" | "advanced" | "all" | "favorites" | "recent">("all")
  const [favorites, setFavorites] = useState<string[]>([])
  const [completed, setCompleted] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])

  // Load from localStorage
  useEffect(() => {
    setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"))
    setCompleted(JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"))
    setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])
  useEffect(() => {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed))
  }, [completed])
  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
  }, [recent])

  const handleSessionSelect = (session: MeditationSession) => {
    setSelectedSession(session)
    setIsPlaying(false)
    // Add to recent (most recent first, unique)
    setRecent((prev) => {
      const filtered = prev.filter((id) => id !== session.id)
      return [session.id, ...filtered].slice(0, 5)
    })
  }

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const handleMarkCompleted = (id: string) => {
    if (!completed.includes(id)) setCompleted((prev) => [...prev, id])
  }

  let filteredSessions = meditationSessions
  if (selectedCategory === "favorites") {
    filteredSessions = meditationSessions.filter(s => favorites.includes(s.id))
  } else if (selectedCategory === "recent") {
    filteredSessions = recent.map(id => meditationSessions.find(s => s.id === id)).filter(Boolean) as MeditationSession[]
  } else if (selectedCategory !== "all") {
    filteredSessions = meditationSessions.filter(session => session.category === selectedCategory)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meditation</h1>
        <p className="text-muted-foreground">Guided meditation sessions for stress relief and mindfulness</p>
      </div>

      {selectedSession ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedSession.title}</CardTitle>
                  <CardDescription>{selectedSession.duration}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={favorites.includes(selectedSession.id) ? "default" : "outline"}
                    size="icon"
                    onClick={() => handleToggleFavorite(selectedSession.id)}
                    aria-label="Favorite"
                  >
                    {favorites.includes(selectedSession.id) ? <Heart className="h-5 w-5 text-red-500" fill="#ef4444" /> : <HeartOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant={completed.includes(selectedSession.id) ? "default" : "outline"}
                    size="icon"
                    onClick={() => handleMarkCompleted(selectedSession.id)}
                    aria-label="Mark Completed"
                  >
                    <CheckCircle className={completed.includes(selectedSession.id) ? "h-5 w-5 text-green-500" : "h-5 w-5"} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSession(null)}
                  >
                    Back to Sessions
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video mb-4">
                <iframe
                  className="w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${selectedSession.videoId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}`}
                  title={selectedSession.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => handleMarkCompleted(selectedSession.id)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedSession.description}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-6 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All Sessions
            </Button>
            <Button
              variant={selectedCategory === "favorites" ? "default" : "outline"}
              onClick={() => setSelectedCategory("favorites")}
            >
              <Heart className="h-4 w-4 mr-1 text-red-500" /> Favorites
            </Button>
            <Button
              variant={selectedCategory === "recent" ? "default" : "outline"}
              onClick={() => setSelectedCategory("recent")}
            >
              <Clock className="h-4 w-4 mr-1" /> Recently Viewed
            </Button>
            <Button
              variant={selectedCategory === "beginner" ? "default" : "outline"}
              onClick={() => setSelectedCategory("beginner")}
            >
              Beginner
            </Button>
            <Button
              variant={selectedCategory === "intermediate" ? "default" : "outline"}
              onClick={() => setSelectedCategory("intermediate")}
            >
              Intermediate
            </Button>
            <Button
              variant={selectedCategory === "advanced" ? "default" : "outline"}
              onClick={() => setSelectedCategory("advanced")}
            >
              Advanced
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">No sessions found.</div>
            )}
            {filteredSessions.map((session) => (
              <Card 
                key={session.id}
                className="cursor-pointer hover:bg-accent transition-colors relative"
                onClick={() => handleSessionSelect(session)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 justify-between">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription>{session.duration}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {favorites.includes(session.id) && <Heart className="h-4 w-4 text-red-500" fill="#ef4444" aria-label="Favorited" />}
                      {completed.includes(session.id) && <CheckCircle className="h-4 w-4 text-green-500" aria-label="Completed" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video mb-4 relative">
                    <img
                      src={session.thumbnail}
                      alt={session.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 