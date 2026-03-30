import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"

export interface Booking {
  id?: string
  userId: string
  counselorId: string
  counselorName: string
  date: Date
  time: string
  sessionType: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: Date
  updatedAt: Date
}

export interface CreateBookingInput {
  userId: string
  counselorId: string
  counselorName: string
  date: Date
  time: string
  sessionType: string
}

export const bookingService = {
  async createBooking(booking: CreateBookingInput): Promise<Booking> {
    try {
      if (!auth.currentUser) {
        throw new Error("User must be authenticated to create a booking")
      }

      if (booking.userId !== auth.currentUser.uid) {
        throw new Error("User can only create bookings for themselves")
      }

      const bookingData = {
        ...booking,
        date: Timestamp.fromDate(booking.date),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: "pending" as const
      }

      const docRef = await addDoc(collection(db, "bookings"), bookingData)
      
      return {
        ...booking,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "pending"
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      if (!auth.currentUser) {
        throw new Error("User must be authenticated to view bookings")
      }

      if (userId !== auth.currentUser.uid) {
        throw new Error("User can only view their own bookings")
      }

      const q = query(
        collection(db, "bookings"),
        where("userId", "==", userId)
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Booking[]
    } catch (error) {
      console.error("Error fetching user bookings:", error)
      throw new Error("Failed to fetch bookings")
    }
  },

  async getCounselorBookings(counselorId: string): Promise<Booking[]> {
    try {
      if (!auth.currentUser) {
        throw new Error("User must be authenticated to view bookings")
      }

      const q = query(
        collection(db, "bookings"),
        where("counselorId", "==", counselorId)
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Booking[]
    } catch (error) {
      console.error("Error fetching counselor bookings:", error)
      throw new Error("Failed to fetch bookings")
    }
  },

  async updateBookingStatus(bookingId: string, status: Booking["status"]): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error("User must be authenticated to update bookings")
      }

      const bookingRef = doc(db, "bookings", bookingId)
      await updateDoc(bookingRef, {
        status,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error("Error updating booking status:", error)
      throw new Error("Failed to update booking status")
    }
  },

  async deleteBooking(bookingId: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error("User must be authenticated to delete bookings")
      }

      const bookingRef = doc(db, "bookings", bookingId)
      await deleteDoc(bookingRef)
    } catch (error) {
      console.error("Error deleting booking:", error)
      throw new Error("Failed to delete booking")
    }
  },

  async getAllBookings(): Promise<Booking[]> {
    try {
      if (!auth.currentUser) {
        throw new Error("User must be authenticated to view bookings")
      }

      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
      const userData = userDoc.data()
      
      if (!userData || userData.role !== 'admin') {
        throw new Error("Only admin users can view all bookings")
      }

      const q = query(collection(db, "bookings"))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Booking[]
    } catch (error) {
      console.error("Error fetching all bookings:", error)
      if (error instanceof Error) {
        throw new Error(`Failed to fetch bookings: ${error.message}`)
      }
      throw new Error("Failed to fetch bookings")
    }
  }
} 