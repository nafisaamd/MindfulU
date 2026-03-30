"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { FeedbackService, Feedback, SurveyResponse } from "@/lib/services/feedbackService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

const feedbackService = new FeedbackService()

export default function AdminFeedbackPage() {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load feedback
      const feedbackData = await feedbackService.getAllFeedback()
      setFeedback(feedbackData)

      // Load survey responses
      const responsesData = await feedbackService.getAllSurveyResponses()
      setSurveyResponses(responsesData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Feedback & Surveys</h1>
      
      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="surveys">Survey Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback">
          <div className="grid gap-4">
            {feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={item.type === 'bug' ? 'destructive' : 'default'}>
                        {item.type}
                      </Badge>
                      <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {item.userId ? `User ID: ${item.userId}` : 'Anonymous'}
                    </span>
                    <span>
                      {format(new Date(item.createdAt), 'PPp')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="surveys">
          <div className="grid gap-4">
            {surveyResponses.map((response) => (
              <Card key={response.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Survey Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {response.responses.map((r, index) => (
                      <div key={index} className="space-y-1">
                        <p className="font-medium">Question {index + 1}</p>
                        <p className="text-muted-foreground">
                          {Array.isArray(r.answer) ? r.answer.join(', ') : r.answer.toString()}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {response.userId ? `User ID: ${response.userId}` : 'Anonymous'}
                      </span>
                      <span>
                        {format(new Date(response.createdAt), 'PPp')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 