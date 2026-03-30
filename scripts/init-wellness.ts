import { withFirebase } from '../lib/firebase'

const generateWellnessData = (userId: string) => {
  const data = []
  const now = new Date()
  
  // Generate 7 days of data
  for (let i = 0; i < 7; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Mood data (1-5)
    data.push({
      userId,
      type: "mood",
      value: Math.floor(Math.random() * 5) + 1,
      date: date,
      notes: "Daily mood check-in"
    })
    
    // Sleep data (4-10 hours)
    data.push({
      userId,
      type: "sleep",
      value: Math.floor(Math.random() * 7) + 4,
      date: date,
      notes: "Sleep duration"
    })
    
    // Energy data (1-10)
    data.push({
      userId,
      type: "energy",
      value: Math.floor(Math.random() * 10) + 1,
      date: date,
      notes: "Energy level"
    })
  }
  
  return data
}

async function initializeWellnessData(userId: string) {
  try {
    await withFirebase(async (firebase) => {
      if (!firebase.db) {
        console.error("Firebase not initialized")
        return
      }

      const { collection, addDoc, Timestamp } = await import("firebase/firestore")
      const wellnessRef = collection(firebase.db, "wellness")

      const wellnessData = generateWellnessData(userId)
      
      // Add each wellness entry to the collection
      for (const entry of wellnessData) {
        await addDoc(wellnessRef, {
          ...entry,
          date: Timestamp.fromDate(entry.date)
        })
        console.log(`Added wellness entry: ${entry.type} for ${entry.date.toLocaleDateString()}`)
      }

      console.log("Successfully initialized wellness data!")
    })
  } catch (error) {
    console.error("Error initializing wellness data:", error)
  }
}

// Run the initialization with a test user ID
// Replace this with your actual user ID
const TEST_USER_ID = "test-user-123"
initializeWellnessData(TEST_USER_ID) 