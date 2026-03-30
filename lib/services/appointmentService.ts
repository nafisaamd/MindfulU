import { withFirebase } from "../firebase"
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy, limit, updateDoc, doc } from "firebase/firestore"

export interface Counselor {
  id: string
  name: string
  specialization: string
  availability: string[]
  rating: number
  imageUrl?: string
}

export interface Appointment {
  id: string
  userId: string
  counselorId: string
  date: Date
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export const appointmentService = {
  async getUpcomingAppointments(userId: string): Promise<Appointment[]> {
    const result = await withFirebase(async ({ db }) => {
      if (!db) return []
      
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('userId', '==', userId),
        where('status', '==', 'scheduled'),
        orderBy('date', 'asc'),
        limit(5)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Appointment[]
    })
    return result || []
  },

  async getCounselors(): Promise<Counselor[]> {
    const result = await withFirebase(async ({ db }) => {
      if (!db) return []
      
      const counselorsRef = collection(db, 'counselors')
      const snapshot = await getDocs(counselorsRef)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Counselor[]
    })
    return result || []
  },

  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment | null> {
    return withFirebase(async ({ db }) => {
      if (!db) return null
      
      const appointmentsRef = collection(db, 'appointments')
      const now = Timestamp.now()
      
      const appointmentData = {
        ...data,
        createdAt: now,
        updatedAt: now
      }
      
      const docRef = await addDoc(appointmentsRef, appointmentData)
      return {
        id: docRef.id,
        ...appointmentData,
        date: appointmentData.date,
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      } as Appointment
    })
  },

  async updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<void> {
    await withFirebase(async ({ db }) => {
      if (!db) return
      
      const appointmentRef = doc(db, 'appointments', appointmentId)
      await updateDoc(appointmentRef, {
        status,
        updatedAt: Timestamp.now()
      })
    })
  }
} 