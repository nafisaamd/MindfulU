"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MessageSquare, Heart, Eye, Clock, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { communityService, CommunityPost } from "@/lib/services/communityService"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function PostDetailPage() {
  const { postId } = useParams()
  const { user, loading: authLoading, error: authError } = useAuth()
  const [post, setPost] = useState<CommunityPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false)

  useEffect(() => {
    console.log("Auth state:", { 
      authLoading, 
      hasUser: !!user, 
      authError,
      userDetails: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      } : null
    })
  }, [authLoading, user, authError])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        console.log("Fetching post with ID:", postId)
        
        if (authLoading) {
          console.log("Auth is still loading, waiting...")
          return
        }

        if (!user?.uid) {
          console.log("No authenticated user found")
          setError("You must be logged in to view posts")
          return
        }
        
        if (typeof postId === 'string') {
          const postData = await communityService.getPost(postId)
          console.log("Post data received:", postData)
          
          if (postData) {
            setPost(postData)
          } else {
            console.error("Post not found in database")
            setError("Post not found. It may have been deleted or the link is incorrect.")
          }
        } else {
          console.error("Invalid post ID:", postId)
          setError("Invalid post ID")
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, user, authLoading])

  useEffect(() => {
    setIsFirebaseInitialized(true)
  }, [])

  const handleAddComment = async () => {
    console.log("Attempting to add comment. User:", user)
    
    if (authLoading) {
      toast({
        title: "Please wait",
        description: "Authentication is still loading",
        variant: "destructive",
      })
      return
    }

    if (!user?.uid) {
      console.log("No user found")
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      console.log("Empty comment")
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    if (typeof postId !== 'string') {
      console.log("Invalid post ID:", postId)
      toast({
        title: "Error",
        description: "Invalid post ID",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      console.log("Adding comment to post:", postId)
      await communityService.addComment(postId, user.uid, comment)
      setComment("")
      
      // Refresh post to show new comment
      const updatedPost = await communityService.getPost(postId)
      if (updatedPost) {
        setPost(updatedPost)
        toast({
          title: "Success",
          description: "Your comment has been added",
        })
      }
    } catch (err) {
      console.error("Error adding comment:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/community">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Loading post...</h1>
        </div>
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="h-4 w-3/4 bg-muted animate-pulse" />
              <div className="h-4 w-1/2 bg-muted animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse" />
              <div className="h-4 w-full bg-muted animate-pulse" />
              <div className="h-4 w-3/4 bg-muted animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/community">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <p className="text-destructive">{error || "Post not found"}</p>
              <Button asChild>
                <Link href="/dashboard/community">
                  Return to Community
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/community">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Post Details</h1>
      </div>

      <Card className="mb-8">
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
          <CardTitle className="text-xl">{post.title}</CardTitle>
          <CardDescription className="text-base">{post.content}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>{post.replies} replies</span>
            </div>
            <div className="flex items-center">
              <Heart className="mr-1 h-4 w-4" />
              <span>{post.likes} likes</span>
            </div>
            <div className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              <span>{post.views} views</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : authError ? (
            <div className="text-center py-4">
              <p className="text-destructive mb-4">{authError.toString()}</p>
              <Button asChild>
                <Link href="/login">Try logging in again</Link>
              </Button>
            </div>
          ) : !user ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">Please log in to comment</p>
              <Button asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
              />
              <Button 
                onClick={handleAddComment} 
                disabled={isSubmitting || !comment.trim()}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          )}

          {/* Display existing comments */}
          {post?.comments && post.comments.length > 0 ? (
            <div className="mt-6 space-y-4">
              {post.comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback>{comment.authorName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{comment.authorName || 'Anonymous'}</p>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 