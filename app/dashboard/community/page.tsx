"use client"

import { useState } from "react"
import { CommunityHeader } from "@/components/community/community-header"
import { CommunityTopics } from "@/components/community/community-topics"
import { CommunityPosts } from "@/components/community/community-posts"

export default function CommunityPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <CommunityHeader />
      <CommunityTopics 
        selectedTopic={selectedTopic}
        onTopicSelect={setSelectedTopic}
      />
      <CommunityPosts selectedTopic={selectedTopic} />
    </div>
  )
}
