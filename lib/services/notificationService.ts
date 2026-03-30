import { withFirebase } from '../firebase'
import { 
  collection, 
  doc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'

export interface Notification {
  id: string
  userId: string
  type: 'post' | 'comment' | 'like' | 'wellness' | 'report'
  title: string
  message: string
  read: boolean
  data?: {
    postId?: string
    commentId?: string
    userId?: string
  }
  createdAt: Date
}

export const notificationService = {
  // Create a new notification
  async createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    return withFirebase(async ({ db }) => {
      const notificationRef = doc(collection(db, 'notifications'))
      const notificationData: Notification = {
        ...data,
        id: notificationRef.id,
        createdAt: new Date()
      }
      await setDoc(notificationRef, notificationData)
      return notificationData
    }) as Promise<Notification>
  },

  // Get user's notifications
  async getUserNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
    return withFirebase(async ({ db }) => {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Notification))
    }) as Promise<Notification[]>
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    return withFirebase(async ({ db }) => {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        read: true
      })
    }) as Promise<void>
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    return withFirebase(async ({ db }) => {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      )
      const querySnapshot = await getDocs(q)
      
      const batch = writeBatch(db)
      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true })
      })
      
      await batch.commit()
    }) as Promise<void>
  },

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    return withFirebase(async ({ db }) => {
      const notificationRef = doc(db, 'notifications', notificationId)
      await deleteDoc(notificationRef)
    }) as Promise<void>
  },

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    return withFirebase(async ({ db }) => {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.size
    }) as Promise<number>
  },

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): Unsubscribe {
    const notificationsRef = collection(getFirestore(), 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    )
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Notification))
      callback(notifications)
    })
  }
} 