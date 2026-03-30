"use client"

import { useEffect, useState } from "react"
import { Brain, Book, Video, FileText, Download, HeartPulse, Moon, Users } from "lucide-react"
import { resourcesService, ResourceCategory } from "@/lib/services/resourcesService"
import { Skeleton } from "@/components/ui/skeleton"

const iconMap: Record<string, any> = {
  stress: Brain,
  anxiety: HeartPulse,
  sleep: Moon,
  social: Users,
  articles: FileText,
  videos: Video,
  books: Book,
  tools: Download
}

export function ResourceCategories() {
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await resourcesService.getAllCategories()
        setCategories(data)
      } catch (err) {
        setError("Failed to load categories. Please try again later.")
        console.error("Error fetching categories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {categories.map((category) => {
        const Icon = iconMap[category.icon || 'articles'] || FileText
        return (
          <div key={category.id} className="flex flex-col items-center space-y-2">
            <div className="rounded-full bg-muted p-3">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.resources.length} resources</p>
            </div>
          </div>
        )
      })}
      {categories.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground">
          No categories found
        </div>
      )}
    </div>
  )
}
