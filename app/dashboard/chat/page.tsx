"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"

interface ResponseTemplates {
  greeting: string[];
  sadness: string[];
  happiness: string[];
  stress: string[];
  anxiety: string[];
  sleep: string[];
  study: string[];
  loneliness: string[];
  friendship: string[];
  general: string[];
  followUp: {
    sadness: string[];
    happiness: string[];
    general: string[];
  };
}

// Enhanced response templates with more context and variety
const responseTemplates: ResponseTemplates = {
  greeting: [
    "Hi there! I'm here to listen and support you. How are you feeling today?",
    "Hello! I'm your wellness companion. What's on your mind?",
    "Welcome back! I'm here to chat whenever you need someone to talk to. How are you doing?",
    "Hey! I'm glad you're here. How can I support you today?",
    "Hi! I'm your mental wellness assistant. What would you like to talk about?"
  ],
  sadness: [
    "I'm sorry to hear you're feeling sad. Would you like to talk about what's causing these feelings?",
    "It's okay to feel sad sometimes. What's been on your mind lately?",
    "I'm here to listen. What's making you feel this way?",
    "Sadness can be really heavy. Would you like to share what's troubling you?",
    "I hear you. What kind of support would be most helpful right now?"
  ],
  happiness: [
    "I'm glad to hear you're feeling happy! What's bringing you joy today?",
    "That's wonderful! Would you like to share what's making you feel this way?",
    "It's great to hear you're in a good mood! What's been going well for you?",
    "Happiness is precious. What's contributing to your positive feelings?",
    "I'm happy that you're happy! Would you like to talk about what's going well?"
  ],
  stress: [
    "I understand that stress can feel overwhelming. Would you like to try a quick breathing exercise together?",
    "Many students find stress management challenging. What specific aspect is bothering you the most?",
    "Let's break this down together. What's causing you the most stress right now?",
    "Remember, it's okay to feel stressed. Would you like to explore some coping strategies?",
    "I hear you. Stress can be really tough. What usually helps you feel better?"
  ],
  anxiety: [
    "Anxiety can be really challenging to deal with. Have you tried any grounding techniques?",
    "I hear you. Would you like to explore some anxiety management strategies?",
    "It's okay to feel anxious. Let's work on some coping mechanisms together.",
    "Many students experience anxiety. What specific situations trigger your anxiety?",
    "Would you like to try a quick mindfulness exercise to help manage your anxiety?"
  ],
  sleep: [
    "Sleep issues can affect your overall wellbeing. What's your current sleep routine like?",
    "Many students struggle with sleep. Would you like some tips for better sleep hygiene?",
    "Let's talk about your sleep patterns. What time do you usually go to bed?",
    "Sleep difficulties are common during stressful periods. What's keeping you up at night?",
    "Would you like to explore some relaxation techniques to help you sleep better?"
  ],
  study: [
    "Study stress is common. What subjects are you finding most challenging?",
    "Let's create a study plan that works for you. What's your current study schedule like?",
    "Remember to take breaks while studying. How long do you usually study before taking a break?",
    "What study techniques have you tried so far? Maybe we can find some that work better for you.",
    "It's important to balance study and rest. How are you managing your study-life balance?"
  ],
  loneliness: [
    "Feeling lonely is a common experience. Would you like to talk about what's making you feel this way?",
    "Many students feel lonely at times. What kind of connections are you looking for?",
    "Let's explore ways to build meaningful connections. What activities do you enjoy?",
    "Remember, you're not alone in feeling this way. Would you like to discuss ways to reach out to others?",
    "What kind of support would be most helpful for you right now?"
  ],
  friendship: [
    "Friendship challenges can be tough. Would you like to talk about what's happening?",
    "Let's explore ways to strengthen your friendships. What's most important to you in a friendship?",
    "Communication is key in friendships. How do you usually handle conflicts with friends?",
    "What kind of support do you need in your friendships right now?",
    "Remember, healthy friendships take work from both sides. What would you like to improve?"
  ],
  general: [
    "I'm here to listen. Would you like to tell me more about that?",
    "That sounds challenging. How are you coping with it?",
    "I understand. What would be most helpful for you right now?",
    "Let's explore this together. What's on your mind?",
    "I'm here to support you. What would you like to focus on?"
  ],
  // Add follow-up responses for when user doesn't provide enough context
  followUp: {
    sadness: [
      "Could you tell me more about what's making you feel sad?",
      "What's been on your mind that's contributing to these feelings?",
      "Would you like to share what's troubling you?",
      "I'm here to listen. What's causing these feelings of sadness?",
      "What kind of support would be most helpful for you right now?"
    ],
    happiness: [
      "What's bringing you joy today?",
      "Would you like to share what's making you feel happy?",
      "What's contributing to your positive mood?",
      "I'd love to hear what's going well for you!",
      "What's making this a good day for you?"
    ],
    general: [
      "Could you tell me more about that?",
      "I'd like to understand better. What's on your mind?",
      "Would you like to share more about what you're feeling?",
      "I'm here to listen. What would you like to talk about?",
      "What's most important for you to discuss right now?"
    ]
  }
}

// Enhanced keyword mapping for better context detection
const contextKeywords = {
  sadness: ['sad', 'sadness', 'unhappy', 'down', 'depressed', 'blue', 'miserable', 'gloomy', 'low', 'empty'],
  happiness: ['happy', 'joy', 'glad', 'cheerful', 'delighted', 'pleased', 'content', 'excited', 'thrilled', 'great'],
  stress: ['stress', 'stressed', 'overwhelmed', 'pressure', 'burnout', 'tired', 'exhausted', 'too much', 'can\'t handle'],
  anxiety: ['anxious', 'anxiety', 'worry', 'nervous', 'panic', 'fear', 'scared', 'afraid', 'overthinking'],
  sleep: ['sleep', 'tired', 'exhausted', 'insomnia', 'rest', 'can\'t sleep', 'awake', 'night', 'bedtime'],
  study: ['study', 'exam', 'test', 'assignment', 'homework', 'deadline', 'project', 'paper', 'class', 'course'],
  loneliness: ['lonely', 'alone', 'isolated', 'no friends', 'missing', 'homesick', 'disconnected'],
  friendship: ['friend', 'friends', 'friendship', 'relationship', 'conflict', 'argument', 'falling out', 'drift apart']
}

// Typing animation delay (in milliseconds)
const TYPING_DELAY = 1000
const MIN_TYPING_TIME = 500
const MAX_TYPING_TIME = 2000

// Add conversation state tracking
interface ConversationState {
  lastContext: string
  lastResponse: string
  consecutiveShortResponses: number
}

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{
    id: string
    content: string
    sender: "user" | "ai"
    timestamp: Date
    isTyping?: boolean
  }[]>([
    {
      id: "welcome",
      content: responseTemplates.greeting[Math.floor(Math.random() * responseTemplates.greeting.length)],
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [conversationState, setConversationState] = useState<ConversationState>({
    lastContext: 'greeting',
    lastResponse: '',
    consecutiveShortResponses: 0
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const detectContext = (message: string): string[] => {
    const lowerMessage = message.toLowerCase()
    const detectedContexts: string[] = []
    
    for (const [context, keywords] of Object.entries(contextKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedContexts.push(context)
      }
    }
    
    return detectedContexts.length > 0 ? detectedContexts : ['general']
  }

  const generateResponse = (userMessage: string): string => {
    const contexts = detectContext(userMessage)
    const primaryContext = contexts[0]
    
    // Check if the user's message is very short (1-2 words)
    const isShortResponse = userMessage.trim().split(/\s+/).length <= 2
    
    // If it's a short response and we're in a follow-up situation
    if (isShortResponse && conversationState.consecutiveShortResponses > 0) {
      const followUpTemplates = responseTemplates.followUp[primaryContext as keyof typeof responseTemplates.followUp] 
        || responseTemplates.followUp.general
      const randomIndex = Math.floor(Math.random() * followUpTemplates.length)
      return followUpTemplates[randomIndex]
    }
    
    // Update conversation state
    setConversationState(prev => ({
      lastContext: primaryContext,
      lastResponse: userMessage,
      consecutiveShortResponses: isShortResponse ? prev.consecutiveShortResponses + 1 : 0
    }))
    
    const templates = responseTemplates[primaryContext as keyof ResponseTemplates]
    if (!Array.isArray(templates)) {
      return "I'm not sure how to respond to that."
    }
    const randomIndex = Math.floor(Math.random() * templates.length)
    return templates[randomIndex]
  }

  const simulateTyping = (message: string): Promise<void> => {
    return new Promise((resolve) => {
      const typingTime = Math.min(
        Math.max(message.length * 30, MIN_TYPING_TIME),
        MAX_TYPING_TIME
      )
      setTimeout(resolve, typingTime)
    })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: "user" as const,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Add typing indicator
    const typingMessage = {
      id: "typing",
      content: "",
      sender: "ai" as const,
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages((prev) => [...prev, typingMessage])

    // Generate and add AI response with typing animation
    const response = generateResponse(input)
    await simulateTyping(response)
    
    setMessages((prev) => {
      const filtered = prev.filter(msg => msg.id !== "typing")
      return [...filtered, {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "ai" as const,
        timestamp: new Date(),
      }]
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Chat Support</h1>
        <p className="text-muted-foreground">Get 24/7 emotional support and wellness guidance</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="AI Assistant" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Wellness Assistant</CardTitle>
              <CardDescription>AI-powered support</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user" 
                      ? "bg-teal-600 text-white" 
                      : message.isTyping 
                        ? "bg-muted animate-pulse"
                        : "bg-muted"
                  }`}
                >
                  {message.isTyping ? (
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  ) : (
                    <>
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user" ? "text-teal-100" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" className="bg-teal-600 hover:bg-teal-700">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Need immediate assistance? Please contact the campus crisis line at (555) 123-4567</p>
      </div>
    </div>
  )
}
