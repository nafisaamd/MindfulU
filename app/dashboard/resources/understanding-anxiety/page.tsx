"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Video } from "lucide-react"
import Link from "next/link"

export default function UnderstandingAnxietyPage() {
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
            <Video className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle className="text-2xl">Understanding Anxiety</CardTitle>
              <CardDescription className="text-lg mt-2">
                Learn about anxiety triggers and coping mechanisms
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="prose prose-lg max-w-none">
        <h2>What is Anxiety?</h2>
        <p>
          Anxiety is a natural response to stress or perceived threats. While it's normal to feel anxious sometimes, 
          excessive anxiety can interfere with daily life and academic performance. Understanding anxiety is the first 
          step toward managing it effectively.
        </p>

        <h2>Understanding Anxiety: A Student's Guide</h2>
        <div className="my-8 aspect-video">
          <iframe
            className="w-full h-full rounded-lg"
            src="https://www.youtube.com/embed/BVJkf8IuRjE"
            title="Understanding Anxiety"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <h2>Common Anxiety Triggers for Students</h2>
        <ul>
          <li>Academic pressure and deadlines</li>
          <li>Social situations and peer pressure</li>
          <li>Financial concerns</li>
          <li>Future uncertainty</li>
          <li>Family expectations</li>
          <li>Performance anxiety</li>
        </ul>

        <h2>More Video Resources</h2>
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Coping with Exam Anxiety</CardTitle>
              <CardDescription>Practical strategies for students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video mb-4">
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/7lJtD5t3fIk"
                  title="Coping with Exam Anxiety"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Learn effective techniques to manage anxiety during exams and tests.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Anxiety Relief Techniques</CardTitle>
              <CardDescription>Immediate strategies you can use anywhere</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video mb-4">
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/O-6f5wQXSu8"
                  title="Quick Anxiety Relief"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Simple exercises you can do anywhere to reduce anxiety quickly.
              </p>
            </CardContent>
          </Card>
        </div>

        <h2>Effective Coping Strategies</h2>
        
        <h3>1. Breathing Techniques</h3>
        <ul>
          <li>4-7-8 breathing method</li>
          <li>Box breathing</li>
          <li>Diaphragmatic breathing</li>
        </ul>

        <h3>2. Lifestyle Changes</h3>
        <ul>
          <li>Regular exercise</li>
          <li>Healthy sleep habits</li>
          <li>Balanced diet</li>
          <li>Limiting caffeine and alcohol</li>
        </ul>

        <h3>3. Cognitive Strategies</h3>
        <ul>
          <li>Challenge negative thoughts</li>
          <li>Practice positive self-talk</li>
          <li>Set realistic goals</li>
          <li>Break tasks into smaller steps</li>
        </ul>

        <h2>When to Seek Professional Help</h2>
        <p>
          Consider seeking professional help if you experience:
        </p>
        <ul>
          <li>Persistent anxiety that interferes with daily life</li>
          <li>Physical symptoms like rapid heartbeat or difficulty breathing</li>
          <li>Difficulty sleeping or concentrating</li>
          <li>Thoughts of self-harm</li>
          <li>Panic attacks</li>
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
            Anxiety is a common experience, and you're not alone. 
            With the right tools and support, you can learn to manage anxiety effectively 
            and thrive in your academic journey.
          </p>
        </div>
      </div>
    </div>
  )
} 