import { db } from "../lib/firebase.js"
import { collection, doc, setDoc } from "firebase/firestore"

const defaultAchievements = [
  {
    id: "streak_3",
    name: "3 Day Streak",
    description: "Maintain a wellness check-in streak for 3 days",
    icon: "🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 3
    }
  },
  {
    id: "streak_7",
    name: "7 Day Streak",
    description: "Maintain a wellness check-in streak for 7 days",
    icon: "🔥🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 7
    }
  },
  {
    id: "streak_30",
    name: "30 Day Streak",
    description: "Maintain a wellness check-in streak for 30 days",
    icon: "🔥🔥🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 30
    }
  },
  {
    id: "checkin_7",
    name: "Weekly Check-in",
    description: "Complete 7 wellness check-ins",
    icon: "📝",
    category: "checkin",
    requirements: {
      type: "count",
      value: 7
    }
  },
  {
    id: "checkin_30",
    name: "Monthly Check-in",
    description: "Complete 30 wellness check-ins",
    icon: "📝📝",
    category: "checkin",
    requirements: {
      type: "count",
      value: 30
    }
  },
  {
    id: "mood_positive",
    name: "Positive Vibes",
    description: "Maintain an average mood of 4 or higher for 7 days",
    icon: "😊",
    category: "mood",
    requirements: {
      type: "average",
      value: 4,
      days: 7
    }
  },
  {
    id: "energy_high",
    name: "High Energy",
    description: "Maintain an average energy level of 4 or higher for 7 days",
    icon: "⚡",
    category: "energy",
    requirements: {
      type: "average",
      value: 4,
      days: 7
    }
  },
  {
    id: "sleep_quality",
    name: "Quality Sleep",
    description: "Maintain an average sleep quality of 4 or higher for 7 days",
    icon: "😴",
    category: "sleep",
    requirements: {
      type: "average",
      value: 4,
      days: 7
    }
  }
]

async function initAchievements() {
  const achievementsRef = collection(db, "badges")
  
  for (const achievement of defaultAchievements) {
    await setDoc(doc(achievementsRef, achievement.id), achievement)
    console.log(`Created achievement: ${achievement.name}`)
  }
  
  console.log("All achievements initialized successfully!")
}

initAchievements().catch(console.error) 