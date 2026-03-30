"use client"

import { Brain, Calendar, MessageCircle, Users, BookOpen, Shield, Award, LineChart } from "lucide-react"

export function LandingFeatures() {
  const features = [
    {
      icon: Brain,
      title: "Personalized Wellness",
      description: "Tailored recommendations based on your unique needs and preferences.",
    },
    {
      icon: Calendar,
      title: "Counseling Services",
      description: "Easy access to book on-campus counseling sessions.",
    },
    {
      icon: MessageCircle,
      title: "AI Chat Support",
      description: "24/7 emotional support and resources through our AI assistant.",
    },
    {
      icon: Users,
      title: "Peer Community",
      description: "Connect with fellow students in a safe, moderated environment.",
    },
    {
      icon: BookOpen,
      title: "Resource Library",
      description: "Curated articles, videos, and tools for mental wellness.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is encrypted and secure, with strict privacy controls.",
    },
    {
      icon: Award,
      title: "Rewards System",
      description: "Earn badges and track your progress on your wellness journey.",
    },
    {
      icon: LineChart,
      title: "Progress Tracking",
      description: "Monitor your wellness journey with intuitive analytics.",
    },
  ]

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm text-teal-700 dark:bg-teal-700/20 dark:text-teal-400">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need for Mental Wellness
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform combines technology and human support to provide comprehensive mental health resources for
              university students.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 rounded-lg border p-4 transition-all hover:border-teal-200 hover:bg-teal-50 dark:hover:border-teal-800 dark:hover:bg-teal-950/20"
            >
              <div className="rounded-full bg-teal-100 p-2 text-teal-600 dark:bg-teal-700/20 dark:text-teal-400">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-center text-base font-bold">{feature.title}</h3>
              <p className="text-center text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
