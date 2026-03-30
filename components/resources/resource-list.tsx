"use client"

import { useEffect, useState } from "react"
import { FileText, Video, Bookmark, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { resourcesService, Resource } from "@/lib/services/resourcesService"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

export function ResourceList() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        let data: Resource[] = []
        
        switch (activeTab) {
          case "all":
            // For now, we'll get all resources. In the future, we might want to paginate or filter
            const allResources = await resourcesService.getResourcesByType("article")
            data = [...allResources]
            break
          case "videos":
            data = await resourcesService.getResourcesByType("video")
            break
          case "saved":
            if (user?.uid) {
              // Get resources that the user has liked
              const allResources = await resourcesService.getResourcesByType("article")
              data = allResources.filter(resource => resource.likes.includes(user.uid))
            }
            break
        }
        
        setResources(data)
      } catch (err) {
        setError("Failed to load resources. Please try again later.")
        console.error("Error fetching resources:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [activeTab, user?.uid])

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'article':
        return FileText
      case 'video':
        return Video
      case 'worksheet':
        return ExternalLink
      default:
        return FileText
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="all">All Resources</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
        <TabsTrigger value="saved">Saved</TabsTrigger>
      </TabsList>

      <div className="mt-4 space-y-4">
        {resources.map((resource) => {
          const Icon = getResourceIcon(resource.type)
          return (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(resource.createdAt), "MMMM d, yyyy")} • {resource.views} views
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">{resource.category}</Badge>
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  {resource.type === 'video' ? 'Watch Video' : 'Read More'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
        {resources.length === 0 && (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              No resources found
            </CardContent>
          </Card>
        )}
      </div>
    </Tabs>
  )
}
