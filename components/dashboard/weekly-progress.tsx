"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { wellnessService, type WellnessEntry } from "@/lib/services/wellnessService"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, subDays } from "date-fns"
import { Flame } from "lucide-react"

export function WeeklyProgress() {
  const { user } = useAuth()
  const [moodData, setMoodData] = useState<WellnessEntry[]>([])
  const [energyData, setEnergyData] = useState<WellnessEntry[]>([])
  const [sleepData, setSleepData] = useState<WellnessEntry[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadWellnessData()
    }
  }, [user])

  const loadWellnessData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [mood, energy, sleep] = await Promise.all([
        wellnessService.getWellnessHistory(user.uid, "mood", 7),
        wellnessService.getWellnessHistory(user.uid, "energy", 7),
        wellnessService.getWellnessHistory(user.uid, "sleep", 7)
      ])

      setMoodData(mood)
      setEnergyData(energy)
      setSleepData(sleep)

      // Calculate streak
      const today = new Date()
      let currentStreak = 0
      for (let i = 0; i < 7; i++) {
        const date = subDays(today, i)
        const hasCheckIn = mood.some(entry => 
          entry.date.toDate().toDateString() === date.toDateString()
        )
        if (hasCheckIn) {
          currentStreak++
        } else {
          break
        }
      }
      setStreak(currentStreak)
    } catch (error) {
      console.error("Error loading wellness data:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i)
    const moodEntry = moodData.find(entry => 
      entry.date.toDate().toDateString() === date.toDateString()
    )
    const energyEntry = energyData.find(entry => 
      entry.date.toDate().toDateString() === date.toDateString()
    )
    const sleepEntry = sleepData.find(entry => 
      entry.date.toDate().toDateString() === date.toDateString()
    )

    return {
      date: format(date, "MMM d"),
      mood: moodEntry?.value || 0,
      energy: energyEntry?.value || 0,
      sleep: sleepEntry?.value || 0
    }
  }).reverse()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Track your wellness metrics</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-orange-500">
            <Flame className="h-5 w-5" />
            <span className="font-medium">{streak} day streak</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading progress...
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#8884d8" 
                  name="Mood"
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#82ca9d" 
                  name="Energy"
                />
                <Line 
                  type="monotone" 
                  dataKey="sleep" 
                  stroke="#ffc658" 
                  name="Sleep"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 