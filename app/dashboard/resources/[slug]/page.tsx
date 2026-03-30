"use client"

import { useEffect, useState, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { allResources, Resource } from "../page"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const resolvedParams = use(params)

  useEffect(() => {
    // Find the resource that matches the slug
    const foundResource = allResources.find(
      (r: Resource) => r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === resolvedParams.slug
    )
    setResource(foundResource || null)
    setLoading(false)
  }, [resolvedParams.slug])

  if (loading) {
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!resource) {
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
        <div className="text-center">
          <h1 className="text-2xl font-bold">Resource not found</h1>
          <p className="text-muted-foreground mt-2">
            The resource you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

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
            <resource.icon className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle className="text-2xl">{resource.title}</CardTitle>
              <CardDescription className="text-lg mt-2">{resource.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {resource.links.map((link) => (
          <Card key={link.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{link.name}</CardTitle>
                <Badge variant={getBadgeVariant(link.type)}>{link.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{link.description}</p>
              <Button variant="outline" className="w-full" asChild>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Resource
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case 'emergency':
      return 'destructive'
    case 'support':
    case 'community':
    case 'business':
    case 'career':
      return 'default'
    case 'counseling':
    case 'finance':
    case 'culture':
    case 'internship':
    case 'tools':
    case 'workshop':
    case 'tool':
    case 'mentorship':
      return 'secondary'
    case 'writing':
    case 'work':
    case 'social':
    case 'network':
    default:
      return 'outline'
  }
} 