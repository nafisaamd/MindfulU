"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { JournalService, JournalEntry } from "@/lib/services/journalService"
import { JournalPromptService } from "@/lib/services/journalPromptService"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Plus, Search, Filter, Calendar, Tag, Lock, Unlock, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const journalService = new JournalService()
const promptService = new JournalPromptService()

const moodOptions = [
  { value: "happy", label: "😊 Happy" },
  { value: "calm", label: "😌 Calm" },
  { value: "sad", label: "😢 Sad" },
  { value: "anxious", label: "😰 Anxious" },
  { value: "angry", label: "😠 Angry" },
  { value: "excited", label: "🤩 Excited" },
  { value: "tired", label: "😴 Tired" },
  { value: "neutral", label: "😐 Neutral" }
]

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState("")
  const [filterMood, setFilterMood] = useState("")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)
  const [selectedEntryForView, setSelectedEntryForView] = useState<JournalEntry | null>(null)
  const router = useRouter()

  useEffect(() => {
    console.log("Journal Page: User state changed", { 
      user: user ? { uid: user.uid } : null, 
      authLoading 
    });
    
    if (user && !authLoading) {
      loadEntries();
    }
  }, [user, authLoading]);

  const loadEntries = async () => {
    if (!user) {
      console.log("No user available for loading entries");
      return;
    }

    try {
      console.log("Starting to load entries for user:", user.uid);
      setLoading(true);
      setError(null);
      const entries = await journalService.getEntries(user.uid);
      console.log("Entries loaded successfully:", entries.length);
      setEntries(entries);
    } catch (error) {
      console.error("Error loading entries:", error);
      setError(error instanceof Error ? error.message : "Failed to load journal entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!content.trim()) return

    try {
      const newEntry = await journalService.createEntry(user!.uid, {
        content,
        mood,
        tags,
        isPrivate,
        prompt: selectedPrompt
      })
      // Convert Timestamp to Date
      const entryWithDate = {
        ...newEntry,
        createdAt: newEntry.createdAt.toDate(),
        updatedAt: newEntry.updatedAt.toDate()
      }
      setEntries([entryWithDate, ...entries])
      resetForm()
    } catch (error) {
      console.error("Error creating entry:", error)
    }
  }

  const handleUpdateEntry = async () => {
    if (!selectedEntry || !content.trim()) return

    try {
      await journalService.updateEntry(selectedEntry.id, {
        content,
        mood,
        tags,
        isPrivate
      })

      setEntries(entries.map(entry => 
        entry.id === selectedEntry.id 
          ? { ...entry, content, mood, tags, isPrivate }
          : entry
      ))
      resetForm()
    } catch (error) {
      console.error("Error updating entry:", error)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      setIsDeleting(true);
      await journalService.deleteEntry(entryId);
      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== entryId)
      );
      if (selectedEntry?.id === entryId) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry. Please try again.");
    } finally {
      setIsDeleting(false);
      setEntryToDelete(null);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setContent(entry.content)
    setMood(entry.mood)
    setTags(entry.tags)
    setIsPrivate(entry.isPrivate)
    setIsEditing(true)
  }

  const resetForm = () => {
    setSelectedEntry(null)
    setContent("")
    setMood("")
    setTags([])
    setIsPrivate(false)
    setIsEditing(false)
    setSelectedPrompt("")
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const getRandomPrompt = () => {
    const prompt = promptService.getRandomPrompt()
    setSelectedPrompt(prompt.text)
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMood = filterMood === "all" || !filterMood || entry.mood === filterMood
    const matchesTags = filterTags.length === 0 || 
      filterTags.some(tag => entry.tags.includes(tag))
    return matchesSearch && matchesMood && matchesTags
  })

  if (!user || authLoading) {
    console.log("Waiting for auth...", { user: !!user, authLoading });
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    console.log("Error state, showing error message");
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadEntries} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (loading) {
    console.log("Loading entries, showing spinner");
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal</h1>
        <Button onClick={getRandomPrompt} variant="outline">
          Get Writing Prompt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Entry" : "New Entry"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPrompt && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Writing Prompt:</p>
                <p className="text-sm text-muted-foreground">{selectedPrompt}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>How are you feeling?</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Your Entry</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <Label htmlFor="private">Private Entry</Label>
            </div>

            <div className="flex justify-end space-x-2">
              {isEditing && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
              <Button onClick={isEditing ? handleUpdateEntry : handleCreateEntry}>
                {isEditing ? "Update Entry" : "Save Entry"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entries List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Entries</CardTitle>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterMood} onValueChange={setFilterMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Moods</SelectItem>
                    {moodOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredEntries.map(entry => (
                  <Card 
                    key={entry.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedEntryForView(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span>{moodOptions.find(m => m.value === entry.mood)?.label}</span>
                          {entry.isPrivate && <Lock className="h-4 w-4" />}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {format(entry.createdAt, "MMM d, yyyy")}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEntryToDelete(entry.id);
                            }}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm line-clamp-3">{entry.content}</p>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Entry View Dialog */}
      <Dialog open={!!selectedEntryForView} onOpenChange={(open) => !open && setSelectedEntryForView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>{selectedEntryForView && moodOptions.find(m => m.value === selectedEntryForView.mood)?.label}</span>
                {selectedEntryForView?.isPrivate && <Lock className="h-4 w-4" />}
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedEntryForView && format(selectedEntryForView.createdAt, "MMMM d, yyyy")}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="prose max-w-none">
              {selectedEntryForView?.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            {selectedEntryForView?.tags && selectedEntryForView.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedEntryForView.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {selectedEntryForView?.prompt && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Writing Prompt:</p>
                <p className="text-sm text-muted-foreground">{selectedEntryForView.prompt}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => entryToDelete && handleDeleteEntry(entryToDelete)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 