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
  serverTimestamp,
  Firestore
} from 'firebase/firestore'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
  role: 'user' | 'counselor' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
    notifications?: boolean
    language?: string
  }
  mentalHealthInfo?: {
    focusAreas?: string[]
    goals?: string[]
    challenges?: string[]
  }
}

export const userService = {
  // Create a new user profile
  async createUserProfile(uid: string, data: Partial<UserProfile>) {
    return withFirebase(async ({ db }) => {
      const userRef = doc(db, 'users', uid)
      const userData: Partial<UserProfile> = {
        ...data,
        uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user',
        status: 'active'
      }
      await setDoc(userRef, userData)
      return userData
    })
  },

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    return withFirebase(async ({ db }) => {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile
      }
      return null
    })
  },

  // Update user profile
  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    return withFirebase(async ({ db }) => {
      const userRef = doc(db, 'users', uid)
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }
      await updateDoc(userRef, updateData)
      return updateData
    })
  },

  // Get all counselors
  async getCounselors() {
    return withFirebase(async ({ db }) => {
      const counselorsRef = collection(db, 'users')
      const q = query(counselorsRef, where('role', '==', 'counselor'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as UserProfile)
    })
  },

  // Update user preferences
  async updateUserPreferences(uid: string, preferences: UserProfile['preferences']) {
    return withFirebase(async ({ db }) => {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        preferences,
        updatedAt: serverTimestamp()
      })
    })
  },

  // Update mental health information
  async updateMentalHealthInfo(uid: string, mentalHealthInfo: UserProfile['mentalHealthInfo']) {
    return withFirebase(async ({ db }) => {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        mentalHealthInfo,
        updatedAt: serverTimestamp()
      })
    })
  },

  async makeUserAdmin(userId: string) {
    return withFirebase(async ({ db }) => {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        role: 'admin',
        updatedAt: new Date()
      })
    })
  }
} 