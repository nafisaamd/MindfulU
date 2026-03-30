import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore"
import { withFirebase } from "@/lib/firebase"

export interface Feedback {
  id: string
  type: 'bug' | 'feature' | 'improvement' | 'survey'
  title: string
  description: string
  userId?: string // Optional for anonymous feedback
  status: 'new' | 'in-progress' | 'resolved' | 'declined'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
  category?: string
  tags?: string[]
}

export interface SurveyResponse {
  id: string
  surveyId: string
  userId?: string // Optional for anonymous responses
  responses: {
    questionId: string
    answer: string | number | boolean | string[]
  }[]
  createdAt: Date
}

export interface Survey {
  id: string
  title: string
  description: string
  questions: {
    id: string
    text: string
    type: 'text' | 'rating' | 'multiple-choice' | 'boolean'
    options?: string[] // For multiple choice questions
    required: boolean
  }[]
  active: boolean
  createdAt: Date
  expiresAt?: Date
}

export class FeedbackService {
  async submitFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feedback> {
    return withFirebase(async ({ db }) => {
      const feedbackData = {
        ...feedback,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'new'
      }
      
      const docRef = await addDoc(collection(db, "feedback"), feedbackData)
      return { 
        id: docRef.id, 
        ...feedbackData,
        createdAt: feedbackData.createdAt.toDate(),
        updatedAt: feedbackData.updatedAt.toDate()
      } as Feedback
    })
  }

  async submitSurveyResponse(response: Omit<SurveyResponse, 'id' | 'createdAt'>): Promise<SurveyResponse> {
    return withFirebase(async ({ db }) => {
      const responseData = {
        ...response,
        createdAt: Timestamp.now()
      }
      
      const docRef = await addDoc(collection(db, "surveyResponses"), responseData)
      return { 
        id: docRef.id, 
        ...responseData,
        createdAt: responseData.createdAt.toDate()
      } as SurveyResponse
    })
  }

  async getActiveSurveys(): Promise<Survey[]> {
    return withFirebase(async ({ db }) => {
      const now = Timestamp.now()
      const q = query(
        collection(db, "surveys"),
        where("active", "==", true),
        where("expiresAt", ">", now)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        expiresAt: doc.data().expiresAt?.toDate()
      })) as Survey[]
    })
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    return withFirebase(async ({ db }) => {
      const q = query(
        collection(db, "feedback"),
        where("userId", "==", userId)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Feedback[]
    })
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return withFirebase(async ({ db }) => {
      const q = query(
        collection(db, "feedback"),
        orderBy("createdAt", "desc")
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Feedback
      })
    })
  }

  async getAllSurveyResponses(): Promise<SurveyResponse[]> {
    return withFirebase(async ({ db }) => {
      const q = query(
        collection(db, "surveyResponses"),
        orderBy("createdAt", "desc")
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate()
        } as SurveyResponse
      })
    })
  }
} 