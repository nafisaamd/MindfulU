export function LandingTestimonials() {
  const testimonials = [
    {
      quote:
        "MindfulU has been a game-changer for my mental health. The personalized recommendations and easy access to counseling services have helped me manage my anxiety during exam periods.",
      author: "Sarah J.",
      role: "Psychology Student",
    },
    {
      quote:
        "As someone who was hesitant to seek help, the AI chat support provided a comfortable first step. It guided me to resources that actually helped with my stress management.",
      author: "Michael T.",
      role: "Engineering Student",
    },
    {
      quote:
        "The peer community feature connected me with students facing similar challenges. It's comforting to know you're not alone in your struggles.",
      author: "Aisha K.",
      role: "Business Major",
    },
  ]

  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-teal-50 dark:bg-teal-950/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm text-teal-700 dark:bg-teal-700/20 dark:text-teal-400">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Hear From Our Users</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Students across universities are experiencing the benefits of our mental wellness platform.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col justify-between rounded-lg border bg-background p-6 shadow-sm">
              <div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 fill-teal-500 text-teal-500"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-4 text-muted-foreground">"{testimonial.quote}"</blockquote>
              </div>
              <div className="mt-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                  {testimonial.author[0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
