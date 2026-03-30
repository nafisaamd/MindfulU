import { db } from '../firebase'
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
  orderBy
} from 'firebase/firestore'

export interface CounselingSession {
  id: string
  userId: string
  counselorId: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  date: Date
  duration: number // in minutes
  notes?: string
  rating?: number
  feedback?: string
  createdAt: Date
  updatedAt: Date
}

export interface CounselorProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  bio?: string
  specialization: string[]
  experience: number // in years
  availability: {
    days: string[]
    hours: {
      start: string
      end: string
    }
  }
  rate: number // per hour
  rating?: number
  reviews?: {
    userId: string
    rating: number
    comment: string
    date: Date
  }[]
}

export const counselingService = {
  // Create a new counseling session
  async createSession(session: Omit<CounselingSession, 'id' | 'createdAt' | 'updatedAt'>) {
    const sessionsRef = collection(db, 'sessions')
    const newSessionRef = doc(sessionsRef)
    const sessionData: CounselingSession = {
      ...session,
      id: newSessionRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await setDoc(newSessionRef, sessionData)
    return sessionData
  },

  // Get a session by ID
  async getSession(sessionId: string): Promise<CounselingSession | null> {
    const sessionRef = doc(db, 'sessions', sessionId)
    const sessionSnap = await getDoc(sessionRef)
    if (sessionSnap.exists()) {
      return sessionSnap.data() as CounselingSession
    }
    return null
  },

  // Get all sessions for a user
  async getUserSessions(userId: string) {
    const sessionsRef = collection(db, 'sessions')
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as CounselingSession)
  },

  // Get all sessions for a counselor
  async getCounselorSessions(counselorId: string) {
    const sessionsRef = collection(db, 'sessions')
    const q = query(
      sessionsRef,
      where('counselorId', '==', counselorId),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as CounselingSession)
  },

  // Update session status
  async updateSessionStatus(sessionId: string, status: CounselingSession['status']) {
    const sessionRef = doc(db, 'sessions', sessionId)
    await updateDoc(sessionRef, {
      status,
      updatedAt: serverTimestamp()
    })
  },

  // Add session notes
  async addSessionNotes(sessionId: string, notes: string) {
    const sessionRef = doc(db, 'sessions', sessionId)
    await updateDoc(sessionRef, {
      notes,
      updatedAt: serverTimestamp()
    })
  },

  // Add session feedback
  async addSessionFeedback(sessionId: string, rating: number, feedback: string) {
    const sessionRef = doc(db, 'sessions', sessionId)
    await updateDoc(sessionRef, {
      rating,
      feedback,
      updatedAt: serverTimestamp()
    })
  },

  // Get counselor profile
  async getCounselorProfile(counselorId: string): Promise<CounselorProfile | null> {
    const counselorRef = doc(db, 'counselors', counselorId)
    const counselorSnap = await getDoc(counselorRef)
    if (counselorSnap.exists()) {
      return counselorSnap.data() as CounselorProfile
    }
    return null
  },

  // Update counselor profile
  async updateCounselorProfile(counselorId: string, data: Partial<CounselorProfile>) {
    const counselorRef = doc(db, 'counselors', counselorId)
    await updateDoc(counselorRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  }
} 