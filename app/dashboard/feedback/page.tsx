"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedbackForm } from "@/components/feedback/feedback-form"
import { SurveyForm } from "@/components/feedback/survey-form"

export default function FeedbackPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Help Us Improve</h1>
      
      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feedback">Submit Feedback</TabsTrigger>
          <TabsTrigger value="survey">Take Survey</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback">
          <div className="max-w-2xl mx-auto">
            <FeedbackForm />
          </div>
        </TabsContent>
        
        <TabsContent value="survey">
          <div className="max-w-2xl mx-auto">
            <SurveyForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 