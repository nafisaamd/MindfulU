import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="w-full border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-xs">
            M
          </div>
          <p className="text-sm font-medium">MindfulU &copy; {new Date().getFullYear()}</p>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          Designed with care for university students&apos; mental wellness.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-sm font-medium hover:text-teal-600 transition-colors">
            Privacy
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-teal-600 transition-colors">
            Terms
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-teal-600 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
