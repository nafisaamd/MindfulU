import { initializeApp } from "firebase/app"
import { getFirestore, collection, doc, setDoc, addDoc, Timestamp } from "firebase/firestore"
import { getAuth, signInAnonymously } from "firebase/auth"
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') })

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Validate Firebase config
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars)
  process.exit(1)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

async function initializeFirestore() {
  try {
    // Sign in anonymously to get a user
    const userCredential = await signInAnonymously(auth)
    const user = userCredential.user

    // Create user document
    const userDoc = {
      uid: user.uid,
      displayName: "Test User",
      email: "test@example.com",
      streak: 3,
      points: 150,
      achievements: ["first_checkin", "weekly_streak"],
      lastCheck: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

    await setDoc(doc(db, "users", user.uid), userDoc)
    console.log("User document created")

    // Create sample wellness checks
    const wellnessChecks = [
      {
        userId: user.uid,
        mood: 3,
        energy: 4,
        sleep: 3,
        timestamp: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))
      },
      {
        userId: user.uid,
        mood: 4,
        energy: 3,
        sleep: 4,
        timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))
      },
      {
        userId: user.uid,
        mood: 3,
        energy: 3,
        sleep: 3,
        timestamp: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000))
      },
      {
        userId: user.uid,
        mood: 4,
        energy: 4,
        sleep: 4,
        timestamp: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
      },
      {
        userId: user.uid,
        mood: 3,
        energy: 3,
        sleep: 3,
        timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
      },
      {
        userId: user.uid,
        mood: 4,
        energy: 4,
        sleep: 4,
        timestamp: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
      },
      {
        userId: user.uid,
        mood: 3,
        energy: 3,
        sleep: 3,
        timestamp: Timestamp.now()
      }
    ]

    for (const check of wellnessChecks) {
      await addDoc(collection(db, "wellnessChecks"), check)
    }
    console.log("Wellness checks created")

    // Create sample focus areas
    const focusAreas = [
      {
        id: "stress",
        title: "Stress Management",
        description: "Learn techniques to manage and reduce stress",
        progress: 60,
        activitiesCompleted: 3,
        totalActivities: 5,
        userId: user.uid
      },
      {
        id: "sleep",
        title: "Sleep Quality",
        description: "Improve your sleep habits and quality",
        progress: 40,
        activitiesCompleted: 2,
        totalActivities: 5,
        userId: user.uid
      },
      {
        id: "anxiety",
        title: "Anxiety Relief",
        description: "Develop strategies to manage anxiety",
        progress: 20,
        activitiesCompleted: 1,
        totalActivities: 5,
        userId: user.uid
      }
    ]

    for (const area of focusAreas) {
      await setDoc(doc(db, "focusAreas", `${user.uid}_${area.id}`), area)
    }
    console.log("Focus areas created")

    // Create sample badges
    const badges = [
      {
        id: "first_checkin",
        name: "First Check-in",
        description: "Completed your first wellness check",
        icon: "🎯",
        category: "achievement",
        requirements: {
          type: "checkin",
          count: 1
        }
      },
      {
        id: "weekly_streak",
        name: "Weekly Streak",
        description: "Maintained a 7-day check-in streak",
        icon: "🔥",
        category: "achievement",
        requirements: {
          type: "streak",
          count: 7
        }
      }
    ]

    for (const badge of badges) {
      await setDoc(doc(db, "badges", badge.id), badge)
    }
    console.log("Badges created")

    console.log("Firestore initialization completed successfully!")
  } catch (error) {
    console.error("Error initializing Firestore:", error)
  } finally {
    process.exit(0)
  }
}

initializeFirestore() 