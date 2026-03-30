"use client"

import type React from "react"
import { useAuth } from "@/components/auth-provider"

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  console.log("JournalLayout: Render", { user: !!user, loading })

  return (
    <div className="w-full">
      {children}
    </div>
  )
} 