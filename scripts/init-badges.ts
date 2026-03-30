import { withFirebase } from '../lib/firebase'

const availableBadges = [
  {
    name: "First Steps",
    description: "Complete your first wellness check-in",
    icon: "👣",
    category: "wellness",
    requirements: {
      type: "checkins",
      count: 1
    }
  },
  {
    name: "Consistency Champion",
    description: "Complete 7 consecutive days of wellness check-ins",
    icon: "🔥",
    category: "wellness",
    requirements: {
      type: "consecutive_checkins",
      count: 7
    }
  },
  {
    name: "Mood Master",
    description: "Track your mood for 14 days",
    icon: "😊",
    category: "wellness",
    requirements: {
      type: "mood_tracking",
      count: 14
    }
  },
  {
    name: "Sleep Scholar",
    description: "Track your sleep for 14 days",
    icon: "😴",
    category: "wellness",
    requirements: {
      type: "sleep_tracking",
      count: 14
    }
  },
  {
    name: "Energy Expert",
    description: "Track your energy levels for 14 days",
    icon: "⚡",
    category: "wellness",
    requirements: {
      type: "energy_tracking",
      count: 14
    }
  },
  {
    name: "Community Builder",
    description: "Make your first post in the community",
    icon: "💬",
    category: "community",
    requirements: {
      type: "posts",
      count: 1
    }
  },
  {
    name: "Supportive Friend",
    description: "Comment on 5 different posts",
    icon: "🤝",
    category: "community",
    requirements: {
      type: "comments",
      count: 5
    }
  },
  {
    name: "Wellness Warrior",
    description: "Complete 30 days of wellness tracking",
    icon: "🏆",
    category: "achievement",
    requirements: {
      type: "total_checkins",
      count: 30
    }
  },
  {
    name: "Stress Management Pro",
    description: "Complete all stress management activities",
    icon: "🧘",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  },
  {
    name: "Sleep Expert",
    description: "Complete all sleep improvement activities",
    icon: "😴",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  },
  {
    name: "Anxiety Warrior",
    description: "Complete all anxiety management activities",
    icon: "🛡️",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  },
  {
    name: "Depression Fighter",
    description: "Complete all depression management activities",
    icon: "💪",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  },
  {
    name: "Academic Champion",
    description: "Complete all academic performance activities",
    icon: "📚",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  },
  {
    name: "Social Butterfly",
    description: "Complete all social skills activities",
    icon: "🦋",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  },
  {
    name: "Physical Fitness",
    description: "Complete all physical wellness activities",
    icon: "🏃",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  },
  {
    name: "Mindfulness Master",
    description: "Complete all mindfulness activities",
    icon: "🧘‍♀️",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  },
  {
    name: "Nutrition Expert",
    description: "Complete all nutrition activities",
    icon: "🥗",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  },
  {
    name: "Creative Spirit",
    description: "Complete all creativity activities",
    icon: "🎨",
    category: "wellness",
    requirements: {
      type: "focus_area",
      count: 1
    }
  }
]

async function initializeBadges() {
  try {
    await withFirebase(async (firebase) => {
      if (!firebase.db) {
        console.error("Firebase not initialized")
        return
      }

      const { collection, addDoc } = await import("firebase/firestore")
      const badgesRef = collection(firebase.db, "availableBadges")

      // Add each badge to the collection
      for (const badge of availableBadges) {
        await addDoc(badgesRef, badge)
        console.log(`Added badge: ${badge.name}`)
      }

      console.log("Successfully initialized all badges!")
    })
  } catch (error) {
    console.error("Error initializing badges:", error)
  }
}

// Run the initialization
initializeBadges() 