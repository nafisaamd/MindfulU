import { withFirebase } from '../firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Firestore
} from 'firebase/firestore'

export interface Activity {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  completedAt?: Date
}

export interface FocusArea {
  id: string
  title: string
  description: string
  icon: string
  color: string
  activities: Activity[]
  createdAt: Date
  updatedAt: Date
}

export interface UserFocusArea {
  id: string
  userId: string
  focusAreaId: string
  focusArea: FocusArea
  progress: number
  activities: {
    activityId: string
    completed: boolean
    completedAt?: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

export const focusAreaService = {
  // Get all focus areas
  async getFocusAreas() {
    return withFirebase(async ({ db }) => {
      const focusAreasRef = collection(db, 'focusAreas')
      const q = query(focusAreasRef, orderBy('createdAt', 'asc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as FocusArea)
    })
  },

  // Get user's focus areas with progress
  async getUserFocusAreas(userId: string) {
    return withFirebase(async ({ db }) => {
      const userFocusAreasRef = collection(db, 'userFocusAreas')
      const q = query(userFocusAreasRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as UserFocusArea)
    })
  },

  // Add a focus area to user's list
  async addUserFocusArea(userId: string, focusAreaId: string) {
    return withFirebase(async ({ db }) => {
      const userFocusAreasRef = collection(db, 'userFocusAreas')
      const focusAreaRef = doc(db, 'focusAreas', focusAreaId)
      const focusAreaSnap = await getDoc(focusAreaRef)
      
      if (!focusAreaSnap.exists()) {
        throw new Error('Focus area not found')
      }

      const focusArea = focusAreaSnap.data() as FocusArea
      const userFocusAreaRef = doc(userFocusAreasRef)
      
      const userFocusArea: UserFocusArea = {
        id: userFocusAreaRef.id,
        userId,
        focusAreaId,
        focusArea,
        progress: 0,
        activities: focusArea.activities.map(activity => ({
          activityId: activity.id,
          completed: false
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setDoc(userFocusAreaRef, userFocusArea)
      return userFocusArea
    })
  },

  // Update activity completion status
  async updateActivityStatus(
    userFocusAreaId: string,
    activityId: string,
    completed: boolean
  ) {
    return withFirebase(async ({ db }) => {
      const userFocusAreaRef = doc(db, 'userFocusAreas', userFocusAreaId)
      const userFocusAreaSnap = await getDoc(userFocusAreaRef)
      
      if (!userFocusAreaSnap.exists()) {
        throw new Error('User focus area not found')
      }

      const userFocusArea = userFocusAreaSnap.data() as UserFocusArea
      const updatedActivities = userFocusArea.activities.map(activity => {
        if (activity.activityId === activityId) {
          return {
            ...activity,
            completed,
            completedAt: completed ? new Date() : undefined
          }
        }
        return activity
      })

      // Calculate new progress
      const completedActivities = updatedActivities.filter(a => a.completed).length
      const totalActivities = updatedActivities.length
      const progress = Math.round((completedActivities / totalActivities) * 100)

      await updateDoc(userFocusAreaRef, {
        activities: updatedActivities,
        progress,
        updatedAt: new Date()
      })

      return {
        ...userFocusArea,
        activities: updatedActivities,
        progress
      }
    })
  },

  // Remove focus area from user's list
  async removeUserFocusArea(userFocusAreaId: string) {
    return withFirebase(async ({ db }) => {
      const userFocusAreaRef = doc(db, 'userFocusAreas', userFocusAreaId)
      await updateDoc(userFocusAreaRef, {
        status: 'removed',
        updatedAt: new Date()
      })
    })
  }
} 