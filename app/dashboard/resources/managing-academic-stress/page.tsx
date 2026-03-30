"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

export default function ManagingAcademicStressPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/resources">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle className="text-2xl">Managing Academic Stress</CardTitle>
              <CardDescription className="text-lg mt-2">
                Learn effective strategies to manage stress during your academic journey
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="prose prose-lg max-w-none">
        <h2>Understanding Academic Stress</h2>
        <p>
          Academic stress is a common experience for students, especially during exam periods, assignment deadlines, and project submissions. 
          While some stress can be motivating, excessive stress can negatively impact your mental health and academic performance.
        </p>

        <h2>Common Sources of Academic Stress</h2>
        <ul>
          <li>Heavy workload and tight deadlines</li>
          <li>High expectations from self or others</li>
          <li>Competition with peers</li>
          <li>Financial concerns</li>
          <li>Balancing academic and personal life</li>
          <li>Fear of failure or underperforming</li>
        </ul>

        <h2>Effective Stress Management Strategies</h2>
        
        <h3>1. Time Management</h3>
        <ul>
          <li>Create a realistic study schedule</li>
          <li>Break large tasks into smaller, manageable chunks</li>
          <li>Use productivity tools and apps</li>
          <li>Prioritize tasks based on importance and deadlines</li>
        </ul>

        <h3>2. Study Techniques</h3>
        <ul>
          <li>Use active learning methods (summarizing, teaching others)</li>
          <li>Take regular breaks using the Pomodoro technique</li>
          <li>Create mind maps and visual aids</li>
          <li>Practice past questions and mock exams</li>
        </ul>

        <h3>3. Self-Care Practices</h3>
        <ul>
          <li>Maintain a regular sleep schedule</li>
          <li>Exercise regularly</li>
          <li>Practice mindfulness and meditation</li>
          <li>Eat a balanced diet</li>
          <li>Stay hydrated</li>
        </ul>

        <h3>4. Seeking Support</h3>
        <ul>
          <li>Talk to friends and family</li>
          <li>Join study groups</li>
          <li>Utilize campus counseling services</li>
          <li>Connect with academic advisors</li>
        </ul>

        <h2>When to Seek Professional Help</h2>
        <p>
          If you experience any of the following, consider seeking professional help:
        </p>
        <ul>
          <li>Persistent feelings of anxiety or depression</li>
          <li>Difficulty sleeping or eating</li>
          <li>Physical symptoms like headaches or stomachaches</li>
          <li>Thoughts of self-harm</li>
          <li>Difficulty concentrating or completing tasks</li>
        </ul>

        <h2>Emergency Resources</h2>
        <p>
          If you're experiencing a mental health crisis, please contact:
        </p>
        <ul>
          <li>Lagos State Mental Health Helpline: 0800-800-2000</li>
          <li>Mentally Aware Nigeria Initiative (MANI): 0800-800-2000</li>
          <li>Nigerian Suicide Prevention Initiative: 0800-800-2000</li>
        </ul>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3>Remember</h3>
          <p>
            Your mental health is just as important as your academic success. 
            Don't hesitate to reach out for help when you need it. 
            Taking care of yourself is not a sign of weakness, but a necessary part of your academic journey.
          </p>
        </div>
      </div>
    </div>
  )
} 