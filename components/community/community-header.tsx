"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { communityService } from "@/lib/services/communityService"

export function CommunityHeader() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [topic, setTopic] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      })
      return
    }

    if (!title.trim() || !content.trim() || !topic) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await communityService.createPost({
        title,
        content,
        authorId: auth.currentUser.uid,
        authorName: isAnonymous ? "Anonymous" : auth.currentUser.displayName || "Anonymous",
        authorAvatar: isAnonymous ? null : auth.currentUser.photoURL,
        topic,
        isAnonymous,
      })

      toast({
        title: "Success",
        description: "Your post has been created",
      })

      setIsOpen(false)
      setTitle("")
      setContent("")
      setTopic("")
      setIsAnonymous(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Community Forum</h2>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>New Post</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mental Health">Mental Health</SelectItem>
                  <SelectItem value="Self-Care">Self-Care</SelectItem>
                  <SelectItem value="Sleep">Sleep</SelectItem>
                  <SelectItem value="Relationships">Relationships</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="Happiness">Happiness</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Learning">Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous">Post anonymously</Label>
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
