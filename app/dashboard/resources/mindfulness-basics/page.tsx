"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Video } from "lucide-react"
import Link from "next/link"

export default function MindfulnessBasicsPage() {
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
              <CardTitle className="text-2xl">Mindfulness Basics</CardTitle>
              <CardDescription className="text-lg mt-2">
                Introduction to mindfulness and its benefits
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="prose prose-lg max-w-none">
        <h2>What is Mindfulness?</h2>
        <p>
          Mindfulness is the practice of being fully present and engaged in the current moment, 
          without judgment. It involves paying attention to your thoughts, feelings, bodily sensations, 
          and the surrounding environment with an attitude of curiosity and acceptance.
        </p>

        <h2>Guided Mindfulness Meditation</h2>
        <div className="my-8 aspect-video">
          <iframe
            className="w-full h-full rounded-lg"
            src="https://www.youtube.com/embed/O-6f5wQXSu8"
            title="Mindfulness Meditation for Beginners"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <h2>Benefits of Mindfulness for Students</h2>
        <ul>
          <li>Reduced stress and anxiety</li>
          <li>Improved focus and concentration</li>
          <li>Better emotional regulation</li>
          <li>Enhanced memory and learning</li>
          <li>Improved sleep quality</li>
          <li>Better relationships with others</li>
        </ul>

        <h2>More Video Resources</h2>
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick 5-Minute Meditation</CardTitle>
              <CardDescription>Perfect for busy students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video mb-4">
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/inpok4MKVLM"
                  title="5-Minute Meditation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-sm text-muted-foreground">
                A quick meditation session you can do between classes or before studying.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mindful Breathing Exercise</CardTitle>
              <CardDescription>Learn proper breathing techniques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video mb-4">
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/8HYLyuJZKno"
                  title="Mindful Breathing"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Master the art of mindful breathing for stress relief and better focus.
              </p>
            </CardContent>
          </Card>
        </div>

        <h2>Simple Mindfulness Exercises</h2>

        <h3>1. Mindful Breathing (5 minutes)</h3>
        <p>
          Find a quiet place and sit comfortably. Focus your attention on your breath:
        </p>
        <ol>
          <li>Notice the sensation of air entering and leaving your nostrils</li>
          <li>Feel your chest and belly rise and fall</li>
          <li>Count your breaths (1-10, then start over)</li>
          <li>When your mind wanders, gently bring it back to your breath</li>
        </ol>

        <h3>2. Body Scan (10 minutes)</h3>
        <p>
          Lie down or sit comfortably and bring awareness to different parts of your body:
        </p>
        <ol>
          <li>Start at your toes and work up to your head</li>
          <li>Notice any sensations, tension, or relaxation</li>
          <li>Breathe into areas of tension</li>
          <li>Release tension as you exhale</li>
        </ol>

        <h3>3. Mindful Walking (5-10 minutes)</h3>
        <p>
          Take a short walk and focus on the experience:
        </p>
        <ol>
          <li>Feel your feet touching the ground</li>
          <li>Notice the movement of your body</li>
          <li>Observe your surroundings</li>
          <li>Pay attention to sounds, smells, and sensations</li>
        </ol>

        <h2>Incorporating Mindfulness into Daily Life</h2>
        <ul>
          <li>Take mindful breaks between study sessions</li>
          <li>Practice mindful eating during meals</li>
          <li>Use mindfulness before exams or presentations</li>
          <li>Take a moment to breathe before responding to stress</li>
          <li>Practice gratitude daily</li>
        </ul>

        <h2>Tips for Building a Mindfulness Practice</h2>
        <ul>
          <li>Start with short sessions (5-10 minutes)</li>
          <li>Practice at the same time each day</li>
          <li>Use guided meditation apps or videos</li>
          <li>Be patient with yourself</li>
          <li>Remember that wandering thoughts are normal</li>
        </ul>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3>Remember</h3>
          <p>
            Mindfulness is a skill that develops with practice. 
            Don't worry if your mind wanders - that's normal! 
            The key is to gently bring your attention back to the present moment.
          </p>
        </div>

        <h2>Additional Resources</h2>
        <ul>
          <li>Headspace App - Guided meditations for beginners</li>
          <li>Calm App - Sleep stories and meditation exercises</li>
          <li>Insight Timer - Free meditation timer and guided sessions</li>
          <li>Mindful.org - Articles and resources about mindfulness</li>
        </ul>
      </div>
    </div>
  )
} 