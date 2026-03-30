import { db } from "@/lib/firebase"
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy, Timestamp, limit } from "firebase/firestore"
import { withFirebase } from "@/lib/firebase"

export interface JournalEntry {
  id: string
  userId: string
  content: string
  mood: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  isPrivate: boolean
  prompt?: string
}

export class JournalService {
  async createEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
      console.log("Creating journal entry for user:", userId);
      const entryData = {
        ...entry,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      const docRef = await addDoc(collection(db, "journalEntries"), entryData)
      console.log("Journal entry created successfully:", docRef.id);
      return { id: docRef.id, ...entryData }
    } catch (error) {
      console.error("Error creating journal entry:", error)
      throw error
    }
  }

  async getEntries(userId: string, options?: { 
    limit?: number
    startAfter?: Date
    mood?: string
    tags?: string[]
  }) {
    try {
      console.log("Getting journal entries for user:", userId);
      let q = query(
        collection(db, "journalEntries"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )

      if (options?.mood) {
        q = query(q, where("mood", "==", options.mood))
      }

      if (options?.tags && options.tags.length > 0) {
        q = query(q, where("tags", "array-contains-any", options.tags))
      }

      if (options?.limit) {
        q = query(q, limit(options.limit))
      }

      const snapshot = await getDocs(q)
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as JournalEntry[]
      
      console.log("Retrieved journal entries:", entries.length);
      return entries
    } catch (error) {
      console.error("Error getting journal entries:", error)
      throw error
    }
  }

  async updateEntry(entryId: string, updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>>) {
    try {
      console.log("Updating journal entry:", entryId);
      const entryRef = doc(db, "journalEntries", entryId)
      await updateDoc(entryRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
      console.log("Journal entry updated successfully");
    } catch (error) {
      console.error("Error updating journal entry:", error)
      throw error
    }
  }

  async deleteEntry(entryId: string) {
    try {
      console.log("Deleting journal entry:", entryId);
      await deleteDoc(doc(db, "journalEntries", entryId))
      console.log("Journal entry deleted successfully");
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      throw error
    }
  }

  async getEntry(entryId: string) {
    try {
      console.log("Getting journal entry:", entryId);
      const docRef = doc(db, "journalEntries", entryId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        console.log("Journal entry not found");
        throw new Error("Entry not found")
      }

      const entry = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate()
      } as JournalEntry
      
      console.log("Retrieved journal entry successfully");
      return entry
    } catch (error) {
      console.error("Error getting journal entry:", error)
      throw error
    }
  }
} 