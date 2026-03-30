import { db } from "@/lib/firebase"
import { collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: "wellness" | "community" | "achievement"
  requirements: {
    type: string
    count: number
  }
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  badge: Badge
  earnedAt: Date
  progress?: number
}

export class BadgeService {
  async getUserBadges(userId: string) {
    try {
      // Get user document
      const userDoc = await getDoc(doc(db, "users", userId))
      if (!userDoc.exists()) {
        return []
      }

      const userData = userDoc.data()
      const earnedBadges = userData.earnedBadges || []

      // Get badge details from availableBadges collection
      const badgesRef = collection(db, "availableBadges")
      const badgesSnapshot = await getDocs(badgesRef)
      const availableBadges = badgesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Badge[]

      // Match earned badges with available badges
      return earnedBadges.map((badgeName: string) => {
        const badgeDetails = availableBadges.find((b: Badge) => b.name === badgeName)
        return {
          name: badgeName,
          ...badgeDetails
        }
      })
    } catch (error) {
      console.error("Error getting user badges:", error)
      return []
    }
  }

  async awardBadge(userId: string, badgeName: string) {
    try {
      // Get user document
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        throw new Error("User not found")
      }

      const userData = userDoc.data()
      const earnedBadges = userData.earnedBadges || []

      // Check if badge is already earned
      if (earnedBadges.includes(badgeName)) {
        return
      }

      // Add badge to user's earned badges
      await updateDoc(userRef, {
        earnedBadges: arrayUnion(badgeName)
      })

      // Add badge to badges collection
      const badgesRef = collection(db, "badges")
      await updateDoc(doc(badgesRef, userId), {
        badges: arrayUnion({
          name: badgeName,
          earnedAt: new Date()
        })
      })

      return true
    } catch (error) {
      console.error("Error awarding badge:", error)
      return false
    }
  }

  async removeBadge(userId: string, badgeName: string) {
    try {
      // Get user document
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        throw new Error("User not found")
      }

      // Remove badge from user's earned badges
      await updateDoc(userRef, {
        earnedBadges: arrayRemove(badgeName)
      })

      // Remove badge from badges collection
      const badgesRef = collection(db, "badges")
      const userBadgesDoc = await getDoc(doc(badgesRef, userId))
      
      if (userBadgesDoc.exists()) {
        const badges = userBadgesDoc.data().badges || []
        const updatedBadges = badges.filter((b: { name: string }) => b.name !== badgeName)
        await updateDoc(doc(badgesRef, userId), {
          badges: updatedBadges
        })
      }

      return true
    } catch (error) {
      console.error("Error removing badge:", error)
      return false
    }
  }

  async getAvailableBadges() {
    try {
      const badgesRef = collection(db, "availableBadges")
      const badgesSnapshot = await getDocs(badgesRef)
      return badgesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error("Error getting available badges:", error)
      return []
    }
  }
} 