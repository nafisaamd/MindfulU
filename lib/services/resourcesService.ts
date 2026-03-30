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
  university?: string
  createdAt: Date
  updatedAt: Date
  likes: string[]
  views: number
  rating: number
  ratingCount: number
}

export interface ResourceCategory {
  id: string
  name: string
  description: string
  icon?: string
  resources: string[] // array of resource IDs
  createdAt: Date
  updatedAt: Date
}

export const resourcesService = {
  async getResources(filters: {
    category?: string
    language?: string
    university?: string
    search?: string
  } = {}): Promise<Resource[]> {
    return withFirebase(async ({ db }) => {
      const resourcesRef = collection(db, 'resources')
      let q = query(resourcesRef, orderBy('createdAt', 'desc'))
      
      if (filters.category && filters.category !== 'all') {
        q = query(
          resourcesRef,
          where('category', '==', filters.category),
          orderBy('createdAt', 'desc')
        )
      }
      
      if (filters.language && filters.language !== 'all') {
        q = query(
          resourcesRef,
          where('language', '==', filters.language),
          orderBy('createdAt', 'desc')
        )
      }
      
      if (filters.university && filters.university !== 'all') {
        q = query(
          resourcesRef,
          where('university', '==', filters.university),
          orderBy('createdAt', 'desc')
        )
      }
      
      const querySnapshot = await getDocs(q)
      let resources = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Resource))

      // Apply search filter if provided
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        resources = resources.filter(resource => 
          resource.title.toLowerCase().includes(searchLower) ||
          resource.description.toLowerCase().includes(searchLower) ||
          resource.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }

      return resources
    }) as Promise<Resource[]>
  },

  async likeResource(resourceId: string, userId: string): Promise<void> {
    return withFirebase(async ({ db }) => {
      const resourceRef = doc(db, 'resources', resourceId)
      const resourceSnap = await getDoc(resourceRef)
      
      if (resourceSnap.exists()) {
        const resource = resourceSnap.data() as Resource
        const likes = resource.likes || []
        
        if (likes.includes(userId)) {
          // Unlike
          await updateDoc(resourceRef, {
            likes: likes.filter(id => id !== userId)
          })
        } else {
          // Like
          await updateDoc(resourceRef, {
            likes: [...likes, userId]
          })
        }
      }
    }) as Promise<void>
  },

  async rateResource(resourceId: string, userId: string, rating: number): Promise<void> {
    return withFirebase(async ({ db }) => {
      const resourceRef = doc(db, 'resources', resourceId)
      const resourceSnap = await getDoc(resourceRef)
      
      if (resourceSnap.exists()) {
        const resource = resourceSnap.data() as Resource
        const currentRating = resource.rating || 0
        const currentCount = resource.ratingCount || 0
        
        // Update rating
        const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1)
        
        await updateDoc(resourceRef, {
          rating: newRating,
          ratingCount: currentCount + 1
        })
      }
    }) as Promise<void>
  },

  async incrementViews(resourceId: string): Promise<void> {
    return withFirebase(async ({ db }) => {
      const resourceRef = doc(db, 'resources', resourceId)
      const resourceSnap = await getDoc(resourceRef)
      
      if (resourceSnap.exists()) {
        const resource = resourceSnap.data() as Resource
        const views = resource.views || 0
        
        await updateDoc(resourceRef, {
          views: views + 1
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
  },

  async createResource(data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'rating' | 'ratingCount'>): Promise<Resource> {
    return withFirebase(async ({ db }) => {
    const resourcesRef = collection(db, 'resources')
    const newResourceRef = doc(resourcesRef)
      const now = new Date()
      
    const resourceData: Resource = {
      ...data,
      id: newResourceRef.id,
        createdAt: now,
        updatedAt: now,
      views: 0,
      likes: [],
        rating: 0,
        ratingCount: 0
    }
      
    await setDoc(newResourceRef, resourceData)
    return resourceData
    }) as Promise<Resource>
  },

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return withFirebase(async ({ db }) => {
    const resourcesRef = collection(db, 'resources')
    const q = query(
      resourcesRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
      
    const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Resource))
    }) as Promise<Resource[]>
  },

  async getResourcesByType(type: Resource['type']) {
    const resourcesRef = collection(db, 'resources')
    const q = query(
      resourcesRef,
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as Resource)
  },

  async updateResource(resourceId: string, data: Partial<Resource>) {
    const resourceRef = doc(db, 'resources', resourceId)
    await updateDoc(resourceRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  // Categories
  async createCategory(name: string, description: string, icon?: string) {
    const categoriesRef = collection(db, 'categories')
    const newCategoryRef = doc(categoriesRef)
    const categoryData: ResourceCategory = {
      id: newCategoryRef.id,
      name,
      description,
      icon,
      resources: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await setDoc(newCategoryRef, categoryData)
    return categoryData
  },

  async getCategory(categoryId: string): Promise<ResourceCategory | null> {
    const categoryRef = doc(db, 'categories', categoryId)
    const categorySnap = await getDoc(categoryRef)
    if (categorySnap.exists()) {
      return categorySnap.data() as ResourceCategory
    }
    return null
  },

  async getAllCategories() {
    const categoriesRef = collection(db, 'categories')
    const q = query(categoriesRef, orderBy('name'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as ResourceCategory)
  },

  async addResourceToCategory(categoryId: string, resourceId: string) {
    const categoryRef = doc(db, 'categories', categoryId)
    const category = await this.getCategory(categoryId)
    if (category && !category.resources.includes(resourceId)) {
      await updateDoc(categoryRef, {
        resources: [...category.resources, resourceId],
        updatedAt: serverTimestamp()
      })
    }
  }
} 