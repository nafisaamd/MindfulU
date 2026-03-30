export interface JournalPrompt {
  id: string
  text: string
  category: 'gratitude' | 'reflection' | 'growth' | 'healing' | 'creativity'
  difficulty: 'easy' | 'medium' | 'challenging'
}

export class JournalPromptService {
  private prompts: JournalPrompt[] = [
    {
      id: '1',
      text: "What are three things you're grateful for today?",
      category: 'gratitude',
      difficulty: 'easy'
    },
    {
      id: '2',
      text: "Describe a moment today that made you smile.",
      category: 'reflection',
      difficulty: 'easy'
    },
    {
      id: '3',
      text: "What's one thing you'd like to improve about yourself, and what steps can you take to achieve it?",
      category: 'growth',
      difficulty: 'medium'
    },
    {
      id: '4',
      text: "Write about a challenge you're facing and how you're handling it.",
      category: 'healing',
      difficulty: 'medium'
    },
    {
      id: '5',
      text: "If you could have a conversation with your future self, what would you ask?",
      category: 'reflection',
      difficulty: 'challenging'
    },
    {
      id: '6',
      text: "What does your ideal day look like? Describe it in detail.",
      category: 'creativity',
      difficulty: 'medium'
    },
    {
      id: '7',
      text: "Write a letter to someone who has positively impacted your life.",
      category: 'gratitude',
      difficulty: 'medium'
    },
    {
      id: '8',
      text: "What's one thing you've learned about yourself recently?",
      category: 'growth',
      difficulty: 'easy'
    },
    {
      id: '9',
      text: "Describe a situation where you showed resilience.",
      category: 'healing',
      difficulty: 'challenging'
    },
    {
      id: '10',
      text: "What would you do if you had no fear?",
      category: 'creativity',
      difficulty: 'medium'
    }
  ]

  getRandomPrompt(category?: JournalPrompt['category'], difficulty?: JournalPrompt['difficulty']): JournalPrompt {
    let filteredPrompts = this.prompts

    if (category) {
      filteredPrompts = filteredPrompts.filter(p => p.category === category)
    }

    if (difficulty) {
      filteredPrompts = filteredPrompts.filter(p => p.difficulty === difficulty)
    }

    if (filteredPrompts.length === 0) {
      return this.prompts[Math.floor(Math.random() * this.prompts.length)]
    }

    return filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)]
  }

  getPromptsByCategory(category: JournalPrompt['category']): JournalPrompt[] {
    return this.prompts.filter(p => p.category === category)
  }

  getPromptsByDifficulty(difficulty: JournalPrompt['difficulty']): JournalPrompt[] {
    return this.prompts.filter(p => p.difficulty === difficulty)
  }

  getAllPrompts(): JournalPrompt[] {
    return [...this.prompts]
  }
} 