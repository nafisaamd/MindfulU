"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { FeedbackService, Survey, SurveyResponse } from "@/lib/services/feedbackService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const feedbackService = new FeedbackService()

export function SurveyForm() {
  const { user } = useAuth()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveSurvey()
  }, [])

  const loadActiveSurvey = async () => {
    try {
      const surveys = await feedbackService.getActiveSurveys()
      if (surveys.length > 0) {
        setSurvey(surveys[0])
        // Initialize responses object
        const initialResponses: Record<string, any> = {}
        surveys[0].questions.forEach(q => {
          initialResponses[q.id] = q.type === 'multiple-choice' ? [] : ''
        })
        setResponses(initialResponses)
      }
    } catch (error) {
      console.error("Error loading survey:", error)
      toast.error("Failed to load survey")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!survey) return

    // Validate required questions
    const missingRequired = survey.questions
      .filter(q => q.required)
      .some(q => !responses[q.id] || (Array.isArray(responses[q.id]) && responses[q.id].length === 0))

    if (missingRequired) {
      toast.error("Please answer all required questions")
      return
    }

    setIsSubmitting(true)
    try {
      await feedbackService.submitSurveyResponse({
        surveyId: survey.id,
        userId: isAnonymous ? undefined : user?.uid,
        responses: Object.entries(responses).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      })

      toast.success("Thank you for completing the survey!")
      resetForm()
    } catch (error) {
      console.error("Error submitting survey:", error)
      toast.error("Failed to submit survey. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    if (survey) {
      const initialResponses: Record<string, any> = {}
      survey.questions.forEach(q => {
        initialResponses[q.id] = q.type === 'multiple-choice' ? [] : ''
      })
      setResponses(initialResponses)
    }
    setIsAnonymous(false)
  }

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!survey) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No active surveys at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{survey.title}</CardTitle>
        <CardDescription>{survey.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label>
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {question.type === 'text' && (
                <Textarea
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder="Your answer..."
                  required={question.required}
                />
              )}

              {question.type === 'rating' && (
                <RadioGroup
                  value={responses[question.id]?.toString()}
                  onValueChange={(value) => handleResponseChange(question.id, parseInt(value))}
                  required={question.required}
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                      <Label htmlFor={`${question.id}-${rating}`}>{rating}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-${option}`}
                        checked={responses[question.id]?.includes(option)}
                        onCheckedChange={(checked) => {
                          const currentResponses = responses[question.id] || []
                          handleResponseChange(
                            question.id,
                            checked
                              ? [...currentResponses, option]
                              : currentResponses.filter((r: string) => r !== option)
                          )
                        }}
                      />
                      <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'boolean' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={question.id}
                    checked={responses[question.id] || false}
                    onCheckedChange={(checked) => handleResponseChange(question.id, checked)}
                  />
                  <Label htmlFor={question.id}>Yes</Label>
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous">Submit Anonymously</Label>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Survey"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 