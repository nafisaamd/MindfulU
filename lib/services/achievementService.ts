import { db } from "../firebase"
import { collection, doc, getDoc, updateDoc, arrayUnion, Timestamp, getDocs, QueryDocumentSnapshot } from "firebase/firestore"
import { wellnessService } from "./wellnessService"

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: "streak" | "checkin" | "mood" | "sleep" | "energy"
  requirements: {
    type: "count" | "streak" | "average"
    value: number
    days?: number
  }
  unlockedAt?: Timestamp
}

export const achievementService = {
  async checkAchievements(userId: string) {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data()
    
    if (!userData) return

    const achievementsRef = collection(db, "badges")
    const achievementsSnapshot = await getDocs(achievementsRef)
    const allAchievements = achievementsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as Achievement[]
    
    const unlockedAchievements = userData.achievements || []
    const newAchievements: Achievement[] = []

    // Check streak achievements
    const streakAchievements = allAchievements.filter((a: Achievement) => a.category === "streak")
    for (const achievement of streakAchievements) {
      if (!unlockedAchievements.includes(achievement.id) && userData.streak >= achievement.requirements.value) {
        newAchievements.push({
          ...achievement,
          unlockedAt: Timestamp.now()
        })
      }
    }

    // Check check-in achievements
    const checkinAchievements = allAchievements.filter((a: Achievement) => a.category === "checkin")
    const wellnessChecks = await wellnessService.getWellnessHistory(userId, "mood", 30) // Last 30 days
    for (const achievement of checkinAchievements) {
      if (!unlockedAchievements.includes(achievement.id) && wellnessChecks.length >= achievement.requirements.value) {
        newAchievements.push({
          ...achievement,
          unlockedAt: Timestamp.now()
        })
      }
    }

    // Check mood/energy/sleep achievements
    const wellnessAchievements = allAchievements.filter((a: Achievement) => ["mood", "energy", "sleep"].includes(a.category))
    for (const achievement of wellnessAchievements) {
      if (!unlockedAchievements.includes(achievement.id)) {
        const data = await wellnessService.getWellnessHistory(
          userId, 
          achievement.category as "mood" | "energy" | "sleep",
          achievement.requirements.days || 7
        )
        
        if (data.length > 0) {
          const average = data.reduce((acc, item) => acc + item.value, 0) / data.length
          if (average >= achievement.requirements.value) {
            newAchievements.push({
              ...achievement,
              unlockedAt: Timestamp.now()
            })
          }
        }
      }
    }

    // Update user document with new achievements
    if (newAchievements.length > 0) {
      await updateDoc(userRef, {
        achievements: arrayUnion(...newAchievements.map(a => a.id)),
        updatedAt: Timestamp.now()
      })
    }

    return newAchievements
  },

  async getUnlockedAchievements(userId: string) {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data()
    
    if (!userData?.achievements) return []

    const achievementsRef = collection(db, "badges")
    const achievementsSnapshot = await getDocs(achievementsRef)
    const achievements = achievementsSnapshot.docs
      .map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as Achievement[]
    
    return achievements.filter((a: Achievement) => userData.achievements.includes(a.id))
  }
} 