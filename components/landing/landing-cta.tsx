import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingCTA() {
  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of students who are taking control of their mental health with MindfulU.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button className="bg-teal-600 hover:bg-teal-700" size="lg" asChild>
              <Link href="/sign-up">Sign Up Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-in">Already Have an Account?</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
