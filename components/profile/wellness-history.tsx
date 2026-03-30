"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { wellnessService } from "@/lib/services/wellnessService"
import { format, isValid } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface WellnessData {
  date: Date
  mood: number
  energy: number
  sleep: number
  notes?: string
}

export function WellnessHistory() {
  const { user } = useAuth()
  const [data, setData] = useState<WellnessData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWellnessData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch data for all three metrics
        const [moodData, energyData, sleepData] = await Promise.all([
          wellnessService.getWellnessHistory(user.uid, "mood", 30),
          wellnessService.getWellnessHistory(user.uid, "energy", 30),
          wellnessService.getWellnessHistory(user.uid, "sleep", 30)
        ])

        // Combine the data by date
        const combinedData: Record<string, WellnessData> = {}
        
        moodData.forEach(entry => {
          const date = entry.date.toDate()
          const dateKey = date.toISOString().split('T')[0]
          combinedData[dateKey] = {
            date,
            mood: entry.value,
            energy: 0,
            sleep: 0
          }
        })

        energyData.forEach(entry => {
          const date = entry.date.toDate()
          const dateKey = date.toISOString().split('T')[0]
          if (combinedData[dateKey]) {
            combinedData[dateKey].energy = entry.value
          } else {
            combinedData[dateKey] = {
              date,
              mood: 0,
              energy: entry.value,
              sleep: 0
            }
          }
        })

        sleepData.forEach(entry => {
          const date = entry.date.toDate()
          const dateKey = date.toISOString().split('T')[0]
          if (combinedData[dateKey]) {
            combinedData[dateKey].sleep = entry.value
          } else {
            combinedData[dateKey] = {
              date,
              mood: 0,
              energy: 0,
              sleep: entry.value
            }
          }
        })

        // Convert to array and sort by date
        const sortedData = Object.values(combinedData).sort((a, b) => a.date.getTime() - b.date.getTime())
        setData(sortedData)
      } catch (err) {
        console.error("Error fetching wellness data:", err)
        setError("Failed to load wellness history. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchWellnessData()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wellness History</CardTitle>
          <CardDescription>Your wellness journey over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-4">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wellness History</CardTitle>
          <CardDescription>Your wellness journey over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Please sign in to view your wellness history.
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wellness History</CardTitle>
          <CardDescription>Your wellness journey over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No wellness data available yet. Start tracking your wellness to see your progress.
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(item => ({
    date: format(item.date, "MMM d"),
    mood: item.mood,
    energy: item.energy,
    sleep: item.sleep
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellness History</CardTitle>
        <CardDescription>Your wellness journey over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#8884d8" name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#82ca9d" name="Energy" />
              <Line type="monotone" dataKey="sleep" stroke="#ffc658" name="Sleep" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 