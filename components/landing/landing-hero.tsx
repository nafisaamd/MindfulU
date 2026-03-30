import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-teal-50 dark:from-background dark:to-teal-950/20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Your Mental Wellness Journey Starts Here
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Personalized support, resources, and tools designed specifically for university students.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="bg-teal-600 hover:bg-teal-700" size="lg" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full opacity-20 blur-3xl"></div>
              <img
                src="/placeholder.svg?height=500&width=500"
                alt="MindfulU Dashboard Preview"
                className="relative z-10 rounded-lg shadow-xl"
                width={500}
                height={500}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
