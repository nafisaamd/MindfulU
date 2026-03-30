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
  limit,
  serverTimestamp,
  Firestore,
  Timestamp
} from 'firebase/firestore'

export interface Resource {
  id: string
  title: string
  description: string
  content: string
  type: 'article' | 'video' | 'tool'
  category: 'mental-health' | 'academic' | 'cultural' | 'wellness'
  language: 'english' | 'yoruba' | 'igbo' | 'hausa'
  tags: string[]
  author?: string
  source?: string
  createdAt: Date
  updatedAt: Date
}

export const resourceService = {
  async getResources(category?: string, language?: string): Promise<Resource[]> {
    return withFirebase(async ({ db }) => {
      const resourcesRef = collection(db, 'resources')
      let q = query(resourcesRef, orderBy('createdAt', 'desc'))
      
      if (category) {
        q = query(
          resourcesRef,
          where('category', '==', category),
          orderBy('createdAt', 'desc')
        )
      }
      
      if (language) {
        q = query(
          resourcesRef,
          where('language', '==', language),
          orderBy('createdAt', 'desc')
        )
      }
      
      const querySnapshot = await getDocs(q)
      const resources = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Resource))
      return resources
    }) as Promise<Resource[]>
  },

  async initializeDefaultResources(): Promise<void> {
    return withFirebase(async ({ db }) => {
      const defaultResources: Omit<Resource, 'id'>[] = [
        {
          title: "Understanding Academic Pressure in Nigerian Universities",
          description: "A guide to managing academic stress in the Nigerian university context",
          content: `
            Academic pressure in Nigerian universities can be intense due to various factors:
            1. High expectations from family and society
            2. Competitive academic environment
            3. Financial constraints
            4. Limited resources and facilities
            
            This guide provides practical strategies for:
            - Managing exam stress
            - Balancing academic and personal life
            - Dealing with parental expectations
            - Finding support on campus
          `,
          type: "article",
          category: "academic",
          language: "english",
          tags: ["academic-pressure", "stress-management", "student-life"],
          author: "Dr. Sarah Johnson",
          source: "Nigerian University Counseling Center",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Cultural Approaches to Mental Wellness",
          description: "Traditional Nigerian perspectives on mental health and wellness",
          content: `
            Traditional Nigerian approaches to mental wellness include:
            1. Family support systems
            2. Community-based healing
            3. Spiritual practices
            4. Traditional medicine
            
            This resource explores how to:
            - Integrate traditional and modern approaches
            - Respect cultural beliefs while seeking help
            - Build a support network
            - Maintain cultural identity
          `,
          type: "article",
          category: "cultural",
          language: "english",
          tags: ["cultural-wellness", "traditional-healing", "mental-health"],
          author: "Prof. Adebayo Ogunlesi",
          source: "Nigerian Cultural Heritage Institute",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Ọgbọn ni Ilera (Wisdom is Health)",
          description: "Mental health tips in Yoruba language",
          content: `
            Awọn ọna lati gba ilera ọpọlọ:
            1. Sun ọpọlọpọ
            2. Jẹun ni akoko
            3. Ṣe iṣẹ ara
            4. Ba awọn ọrẹ rẹ sọrọ
            
            Awọn ipa:
            - Dinku iṣoro
            - Gbe ọkàn rẹ
            - Mu ọpọlọ rẹ dara
          `,
          type: "article",
          category: "wellness",
          language: "yoruba",
          tags: ["yoruba", "mental-health", "wellness-tips"],
          author: "Dr. Folake Adebayo",
          source: "Yoruba Mental Health Initiative",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const resourcesRef = collection(db, 'resources')
      for (const resource of defaultResources) {
        const newResourceRef = doc(resourcesRef)
        await setDoc(newResourceRef, {
          ...resource,
          id: newResourceRef.id
        })
      }
    }) as Promise<void>
  },

  async getResourceById(id: string): Promise<Resource | null> {
    return withFirebase(async ({ db }) => {
      const resourceRef = doc(db, 'resources', id)
      const resourceSnap = await getDoc(resourceRef)
      
      if (resourceSnap.exists()) {
        return {
          ...resourceSnap.data(),
          id: resourceSnap.id
        } as Resource
      }
      
      return null
    })
  }
} 