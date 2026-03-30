import { db } from "../firebase"
import { collection, query, where, orderBy, limit, getDocs, addDoc, Timestamp } from "firebase/firestore"

export interface WellnessEntry {
  userId: string
  type: "mood" | "sleep" | "energy"
  value: number
  date: Timestamp
  notes?: string
}

export const wellnessService = {
  async addWellnessEntry(userId: string, entry: Omit<WellnessEntry, "userId" | "date">) {
    const wellnessRef = collection(db, "wellness")
    return addDoc(wellnessRef, {
      ...entry,
      userId,
      date: Timestamp.now()
    })
  },

  async getWellnessHistory(userId: string, type: WellnessEntry["type"], days: number = 7) {
    const wellnessRef = collection(db, "wellness")
    const q = query(
      wellnessRef,
      where("userId", "==", userId),
      where("type", "==", type),
      orderBy("date", "desc"),
      limit(days)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        value: data.value,
        date: data.date,
        notes: data.notes
      } as WellnessEntry
    })
  }
} 