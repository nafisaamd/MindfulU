"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Heart, Eye, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { communityService, CommunityPost } from "@/lib/services/communityService"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface CommunityPostsProps {
  selectedTopic: string | null
}

export function CommunityPosts({ selectedTopic }: CommunityPostsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        let data: CommunityPost[] = []
        
        if (selectedTopic) {
          console.log("Fetching posts for topic:", selectedTopic)
          data = await communityService.getPostsByTopic(selectedTopic)
          console.log("Posts for topic:", data)
        } else {
          // Otherwise, get posts based on the active tab
          switch (activeTab) {
            case "all": {
              const allPosts = await communityService.getPosts()
              data = allPosts || []
              break
            }
            case "trending": {
              const trendingPosts = await communityService.getTrendingPosts()
              data = trendingPosts || []
              break
            }
            case "recent": {
              const recentPosts = await communityService.getRecentPosts()
              data = recentPosts || []
              break
            }
            case "my-posts": {
              if (user?.uid) {
                const userPosts = await communityService.getUserPosts(user.uid)
                data = userPosts || []
              }
              break
            }
          }
        }
        
        setPosts(data)
      } catch (err) {
        setError("Failed to load posts. Please try again later.")
        console.error("Error fetching posts:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [activeTab, user?.uid, selectedTopic])

  const handleViewPost = (postId: string) => {
    console.log("Navigating to post:", postId)
    if (postId) {
      router.push(`/dashboard/community/posts/${postId}`)
    } else {
      console.error("Invalid post ID")
    }
  }

  if (loading) {
    return (
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="my-posts">My Posts</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </Tabs>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Community Posts</h2>
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  const renderPosts = (posts: CommunityPost[] | null, tab: string) => {
    if (!posts || posts.length === 0) {
      return <EmptyState isMyPosts={tab === "my-posts"} />
    }
    return posts.map((post) => {
      console.log("Rendering post:", post.id)
      return (
        <PostCard 
          key={`${post.id}-${tab}-${post.createdAt}`} 
          post={post}
          onViewPost={() => handleViewPost(post.id)}
        />
      )
    })
  }

  return (
    <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="all">All Posts</TabsTrigger>
        <TabsTrigger value="trending">Trending</TabsTrigger>
        <TabsTrigger value="recent">Recent</TabsTrigger>
        <TabsTrigger value="my-posts">My Posts</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {renderPosts(posts, "all")}
      </TabsContent>

      <TabsContent value="trending" className="space-y-4">
        {renderPosts(posts, "trending")}
      </TabsContent>

      <TabsContent value="recent" className="space-y-4">
        {renderPosts(posts, "recent")}
      </TabsContent>

      <TabsContent value="my-posts" className="space-y-4">
        {renderPosts(posts, "my-posts")}
      </TabsContent>
    </Tabs>
  )
}

export function PostCard({ post, onViewPost }: { post: CommunityPost, onViewPost: () => void }) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && post.likes) {
      setIsLiked(post.likes.includes(user.uid))
      setLikeCount(post.likes.length)
    }
  }, [post.likes, user])

  const handleLike = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      await communityService.likePost(post.id, user.uid)
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: any) => {
    try {
      if (!date) return "Some time ago"
      
      // Handle Firestore timestamp
      if (typeof date === 'object' && 'toDate' in date) {
        return formatDistanceToNow(date.toDate(), { addSuffix: true })
      }
      
      // Handle Date object or string
      const postDate = new Date(date)
      if (isNaN(postDate.getTime())) {
        return "Some time ago"
      }
      
      return formatDistanceToNow(postDate, { addSuffix: true })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Some time ago"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {post.isAnonymous ? (
              <Avatar>
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={post.authorName} />
                <AvatarFallback>{post.authorName[0]}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <div className="font-medium">{post.isAnonymous ? "Anonymous" : post.authorName}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline">{post.topic}</Badge>
        </div>
        <CardTitle className="text-lg">{post.title}</CardTitle>
        <CardDescription className="line-clamp-2">{post.content}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MessageSquare className="mr-1 h-4 w-4" />
            <span>{post.replies} replies</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 hover:text-red-500",
              isLiked && "text-red-500"
            )}
            onClick={handleLike}
            disabled={isLoading || !user}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span>{likeCount} likes</span>
          </Button>
          <div className="flex items-center">
            <Eye className="mr-1 h-4 w-4" />
            <span>{post.views} views</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onViewPost}>
          View Post
        </Button>
      </CardFooter>
    </Card>
  )
}

function EmptyState({ isMyPosts = false }: { isMyPosts?: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">
          {isMyPosts ? "You haven't created any posts yet" : "No posts found"}
        </h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
        {isMyPosts
            ? "Start sharing your thoughts with the community"
            : "Be the first to start a discussion"}
      </p>
      </CardContent>
    </Card>
  )
}
