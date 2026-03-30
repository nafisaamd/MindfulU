import { withFirebase } from "../firebase"
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy, limit, doc, updateDoc } from "firebase/firestore"
import { wellnessService } from "./wellnessService"

export interface Recommendation {
  id: string
  title: string
  description: string
  type: string
  category: "mood" | "energy" | "sleep" | "general"
  minValue?: number
  maxValue?: number
  createdAt: Date
  userId: string
}

export interface UserRecommendation extends Recommendation {
  completed: boolean
  completedAt?: Timestamp
}

// Predefined recommendations based on wellness patterns
const wellnessRecommendations: Omit<Recommendation, "id" | "createdAt" | "userId">[] = [
  // Mood-based recommendations
  {
    title: "Practice Gratitude",
    description: "Take a moment to write down three things you're grateful for today. This can help improve your mood and outlook.",
    type: "mindfulness",
    category: "mood",
    minValue: 1,
    maxValue: 2
  },
  {
    title: "Social Connection",
    description: "Reach out to a friend or family member. Social connections can significantly boost your mood.",
    type: "social",
    category: "mood",
    minValue: 1,
    maxValue: 3
  },
  {
    title: "Nature Walk",
    description: "Take a 15-minute walk in nature. Being outdoors can help improve your mood and reduce stress.",
    type: "activity",
    category: "mood",
    minValue: 2,
    maxValue: 3
  },

  // Energy-based recommendations
  {
    title: "Power Nap",
    description: "Take a 20-minute power nap to recharge your energy levels.",
    type: "rest",
    category: "energy",
    minValue: 1,
    maxValue: 3
  },
  {
    title: "Hydration Break",
    description: "Drink a glass of water and do some light stretching to boost your energy.",
    type: "wellness",
    category: "energy",
    minValue: 1,
    maxValue: 4
  },
  {
    title: "Quick Exercise",
    description: "Do a 5-minute exercise routine to increase your energy levels.",
    type: "activity",
    category: "energy",
    minValue: 2,
    maxValue: 4
  },

  // Sleep-based recommendations
  {
    title: "Sleep Hygiene",
    description: "Practice good sleep hygiene: dim the lights, avoid screens, and create a relaxing bedtime routine.",
    type: "wellness",
    category: "sleep",
    minValue: 1,
    maxValue: 3
  },
  {
    title: "Relaxation Techniques",
    description: "Try deep breathing or progressive muscle relaxation before bed to improve sleep quality.",
    type: "mindfulness",
    category: "sleep",
    minValue: 1,
    maxValue: 4
  },
  {
    title: "Sleep Schedule",
    description: "Maintain a consistent sleep schedule by going to bed and waking up at the same time.",
    type: "wellness",
    category: "sleep",
    minValue: 2,
    maxValue: 4
  },

  // General wellness recommendations
  {
    title: "Mindful Breathing",
    description: "Take 5 minutes to practice mindful breathing exercises.",
    type: "mindfulness",
    category: "general"
  },
  {
    title: "Healthy Snack",
    description: "Have a nutritious snack to maintain stable energy levels.",
    type: "nutrition",
    category: "general"
  },
  {
    title: "Stretch Break",
    description: "Take a short break to stretch and move your body.",
    type: "activity",
    category: "general"
  }
]

export const getRecommendations = async (userId: string): Promise<Recommendation[]> => {
  const result = await withFirebase(async ({ db }) => {
    const recommendationsRef = collection(db, "recommendations")
    const q = query(
      recommendationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(10)
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Recommendation[]
  })
  return result || []
}

export const addRecommendation = async (recommendation: Omit<Recommendation, "id" | "createdAt">): Promise<string | null> => {
  return withFirebase(async ({ db }) => {
    const recommendationsRef = collection(db, "recommendations")
    const docRef = await addDoc(recommendationsRef, {
      ...recommendation,
      createdAt: Timestamp.now()
    })
    return docRef.id
  })
}

export const updateRecommendation = async (id: string, data: Partial<Recommendation>): Promise<void> => {
  await withFirebase(async ({ db }) => {
    const docRef = doc(db, "recommendations", id)
    await updateDoc(docRef, data)
  })
}

export const getUserRecommendations = async (userId: string): Promise<UserRecommendation[]> => {
  const result = await withFirebase(async ({ db }) => {
    const userRecommendationsRef = collection(db, "userRecommendations")
    const q = query(
      userRecommendationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as UserRecommendation[]
  })
  return result || []
}

export const addUserRecommendation = async (userRecommendation: Omit<UserRecommendation, "id" | "createdAt">): Promise<string | null> => {
  return withFirebase(async ({ db }) => {
    const userRecommendationsRef = collection(db, "userRecommendations")
    const docRef = await addDoc(userRecommendationsRef, {
      ...userRecommendation,
      createdAt: Timestamp.now()
    })
    return docRef.id
  })
}

export const updateUserRecommendation = async (id: string, data: Partial<UserRecommendation>): Promise<void> => {
  await withFirebase(async ({ db }) => {
    const docRef = doc(db, "userRecommendations", id)
    await updateDoc(docRef, data)
  })
}

export const recommendationService = {
  async getDailyRecommendation(userId: string) {
    return withFirebase(async ({ db }) => {
      // First, check for incomplete recommendations
      const userRecsRef = collection(db, "userRecommendations")
      const q = query(
        userRecsRef,
        where("userId", "==", userId),
        where("completed", "==", false),
        orderBy("createdAt", "desc"),
        limit(1)
      )

      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        return {
          ...data,
          id: snapshot.docs[0].id,
          createdAt: data.createdAt?.toDate() || new Date()
        } as UserRecommendation
      }

      // Get recent wellness data
      const [moodData, energyData, sleepData] = await Promise.all([
        wellnessService.getWellnessHistory(userId, "mood", 7),
        wellnessService.getWellnessHistory(userId, "energy", 7),
        wellnessService.getWellnessHistory(userId, "sleep", 7)
      ])

      // Calculate averages
      const moodAvg = moodData.length > 0 
        ? moodData.reduce((acc, item) => acc + item.value, 0) / moodData.length 
        : 3
      const energyAvg = energyData.length > 0 
        ? energyData.reduce((acc, item) => acc + item.value, 0) / energyData.length 
        : 5
      const sleepAvg = sleepData.length > 0 
        ? sleepData.reduce((acc, item) => acc + item.value, 0) / sleepData.length 
        : 7

      // Filter recommendations based on wellness data
      const relevantRecommendations = wellnessRecommendations.filter(rec => {
        if (rec.category === "general") return true
        
        const value = rec.category === "mood" ? moodAvg 
          : rec.category === "energy" ? energyAvg 
          : sleepAvg

        return (!rec.minValue || value <= rec.minValue) && 
               (!rec.maxValue || value <= rec.maxValue)
      })

      // If no relevant recommendations, use general ones
      const recommendations = relevantRecommendations.length > 0 
        ? relevantRecommendations 
        : wellnessRecommendations.filter(rec => rec.category === "general")

      // Get a random recommendation from the filtered list
      const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)]
      
      // Create a new user recommendation
      const newUserRec = {
        ...randomRec,
        userId,
        completed: false,
        createdAt: Timestamp.now()
      }

      const docRef = await addDoc(userRecsRef, newUserRec)
      return {
        ...newUserRec,
        id: docRef.id,
        createdAt: new Date()
      } as UserRecommendation
    })
  },

  async markRecommendationComplete(userId: string, recommendationId: string) {
    return withFirebase(async ({ db }) => {
      const userRecsRef = collection(db, "userRecommendations")
      const q = query(
        userRecsRef,
        where("userId", "==", userId),
        where("id", "==", recommendationId)
      )

      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        throw new Error("Recommendation not found")
      }

      const docRef = snapshot.docs[0].ref
      await updateDoc(docRef, {
        completed: true,
        completedAt: Timestamp.now()
      })

      return true
    })
  }
} 