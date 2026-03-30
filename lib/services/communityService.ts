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
  increment,
  count,
  deleteDoc,
  arrayUnion,
  Timestamp
} from 'firebase/firestore'
import { notificationService } from './notificationService'
import { auth } from '../firebase'

export interface CommunityPost {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  topic: string
  replies: number
  likes: string[] // array of user IDs who liked the post
  views: number
  isAnonymous: boolean
  createdAt: Date
  updatedAt: Date
  comments?: Comment[]
}

export interface Post {
  id: string
  userId: string
  content: string
  title?: string
  tags: string[]
  likes: string[] // array of user IDs who liked the post
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  userId: string
  content: string
  authorName: string
  authorAvatar?: string | null
  likes: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CommunityGroup {
  id: string
  name: string
  description: string
  members: string[] // array of user IDs
  moderators: string[] // array of user IDs
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CommunityTopic {
  id: string
  name: string
  icon: string
  count: number
  color: string
}

export const communityService = {
  // Create a new post
  async createPost(data: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommunityPost> {
    return withFirebase(async ({ db }) => {
      const postRef = doc(collection(db, 'community'))
      const postData: CommunityPost = {
        ...data,
        id: postRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: 0,
        likes: [],
        views: 0,
        comments: []
      }
      console.log("Creating post with ID:", postRef.id)
      await setDoc(postRef, postData)
      return postData
    }) as Promise<CommunityPost>
  },

  // Get a single post by ID
  async getPost(postId: string): Promise<CommunityPost | null> {
    try {
      const result = await withFirebase(async ({ db }) => {
        const postRef = doc(db, 'community', postId)
        const postSnap = await getDoc(postRef)
        
        if (!postSnap.exists()) {
          return null
        }

        const post = {
          ...postSnap.data(),
          id: postSnap.id
        } as CommunityPost

        // If we found a post, increment views separately
        if (post) {
          try {
            console.log("Incrementing views for post:", postId)
            await this.incrementViews(postId)
          } catch (error) {
            console.error("Error incrementing views:", error)
            // Don't throw here, just log the error
          }
        }

        return post
      })

      return result
    } catch (error) {
      console.error("Error in getPost:", error)
      return null
    }
  },

  // Get all posts
  async getPosts(): Promise<CommunityPost[]> {
    return withFirebase(async ({ db }) => {
      const postsRef = collection(db, 'community')
      const q = query(postsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as CommunityPost))
    }) as Promise<CommunityPost[]>
  },

  // Get posts by topic
  async getPostsByTopic(topic: string): Promise<CommunityPost[]> {
    return withFirebase(async ({ db }) => {
      const postsRef = collection(db, 'community')
      const q = query(
        postsRef,
        where('topic', '==', topic),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as CommunityPost))
    }) as Promise<CommunityPost[]>
  },

  // Get trending posts (most liked)
  async getTrendingPosts(limitCount: number = 10) {
    return withFirebase(async ({ db }) => {
      const postsRef = collection(db, 'community')
      const q = query(postsRef, orderBy('likes', 'desc'), limit(limitCount))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as CommunityPost)
    })
  },

  // Get recent posts (last 24 hours)
  async getRecentPosts(limitCount: number = 10) {
    return withFirebase(async ({ db }) => {
      const postsRef = collection(db, 'community')
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      const q = query(
        postsRef,
        where('createdAt', '>=', oneDayAgo),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as CommunityPost)
    })
  },

  // Get user's posts
  async getUserPosts(userId: string) {
    return withFirebase(async ({ db }) => {
      const postsRef = collection(db, 'community')
      const q = query(postsRef, where('authorId', '==', userId), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as CommunityPost)
    })
  },

  // Update post
  async updatePost(postId: string, data: Partial<CommunityPost>) {
    return withFirebase(async ({ db }) => {
      const postRef = doc(db, 'community', postId)
      await updateDoc(postRef, {
        ...data,
        updatedAt: new Date()
      })
    })
  },

  // Increment post views
  async incrementViews(postId: string) {
    return withFirebase(async ({ db }) => {
      const postRef = doc(db, 'community', postId)
      await updateDoc(postRef, {
        views: increment(1)
      })
      return true // Return a value to prevent undefined
    })
  },

  // Get posts by user
  async getPostsByUser(userId: string): Promise<CommunityPost[]> {
    return withFirebase(async ({ db }) => {
      const postsRef = collection(db, 'community')
      const q = query(
        postsRef,
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as CommunityPost)
    }) as Promise<CommunityPost[]>
  },

  // Delete a post
  async deletePost(postId: string): Promise<void> {
    return withFirebase(async ({ db }) => {
      const postRef = doc(db, 'community', postId)
      await deleteDoc(postRef)
    }) as Promise<void>
  },

  // Add a comment to a post
  async addComment(postId: string, userId: string, content: string): Promise<Comment> {
    return withFirebase(async ({ db }) => {
      const postRef = doc(db, 'community', postId)
      const postSnap = await getDoc(postRef)
      
      if (!postSnap.exists()) {
        throw new Error('Post not found')
      }

      const post = postSnap.data() as CommunityPost
      const comment: Comment = {
        id: crypto.randomUUID(),
        userId,
        content,
        authorName: auth.currentUser?.displayName || 'Anonymous',
        authorAvatar: auth.currentUser?.photoURL || null,
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Update the post with the new comment
      await updateDoc(postRef, {
        comments: arrayUnion(comment),
        replies: increment(1),
        updatedAt: new Date()
      })

      return comment
    })
  },

  // Delete a comment
  async deleteComment(postId: string, commentId: string): Promise<void> {
    return withFirebase(async ({ db }) => {
      const postRef = doc(db, 'community', postId)
      const post = await this.getPost(postId)
      
      if (post) {
        const updatedComments = post.comments?.filter(comment => comment.id !== commentId) || []
        await updateDoc(postRef, {
          comments: updatedComments,
          replies: increment(-1)
        })
      }
    }) as Promise<void>
  },

  // Groups
  async createGroup(name: string, description: string, creatorId: string, tags: string[] = []) {
    return withFirebase(async ({ db }) => {
      const groupRef = doc(collection(db, 'groups'))
      const groupData: CommunityGroup = {
        id: groupRef.id,
        name,
        description,
        members: [creatorId],
        moderators: [creatorId],
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await setDoc(groupRef, groupData)
      return groupData
    })
  },

  async getGroup(groupId: string): Promise<CommunityGroup | null> {
    return withFirebase(async ({ db }) => {
      const groupRef = doc(db, 'groups', groupId)
      const groupSnap = await getDoc(groupRef)
      return groupSnap.exists() ? { ...groupSnap.data(), id: groupSnap.id } as CommunityGroup : null
    })
  },

  async joinGroup(groupId: string, userId: string) {
    return withFirebase(async ({ db }) => {
      const groupRef = doc(db, 'groups', groupId)
      await updateDoc(groupRef, {
        members: arrayUnion(userId)
      })
    })
  },

  async leaveGroup(groupId: string, userId: string) {
    return withFirebase(async ({ db }) => {
      const groupRef = doc(db, 'groups', groupId)
      const groupSnap = await getDoc(groupRef)
      if (groupSnap.exists()) {
        const group = groupSnap.data() as CommunityGroup
        const updatedMembers = group.members.filter(id => id !== userId)
        await updateDoc(groupRef, {
          members: updatedMembers
        })
      }
    })
  },

  // Get all community topics with post counts
  async getCommunityTopics(): Promise<CommunityTopic[]> {
    return withFirebase(async ({ db }) => {
      // Get all posts to count topics
      const postsRef = collection(db, 'community')
      const postsSnapshot = await getDocs(postsRef)
      
      // Count posts for each topic
      const topicCounts = new Map<string, number>()
      postsSnapshot.docs.forEach(doc => {
        const post = doc.data() as CommunityPost
        const count = topicCounts.get(post.topic) || 0
        topicCounts.set(post.topic, count + 1)
      })

      // Return topics with actual counts
      const defaultTopics: CommunityTopic[] = [
        {
          id: "1",
          name: "Mental Health",
          icon: "brain",
          count: topicCounts.get("Mental Health") || 0,
          color: "bg-blue-100"
        },
        {
          id: "2",
          name: "Self-Care",
          icon: "heart",
          count: topicCounts.get("Self-Care") || 0,
          color: "bg-pink-100"
        },
        {
          id: "3",
          name: "Sleep",
          icon: "moon",
          count: topicCounts.get("Sleep") || 0,
          color: "bg-purple-100"
        },
        {
          id: "4",
          name: "Relationships",
          icon: "users",
          count: topicCounts.get("Relationships") || 0,
          color: "bg-green-100"
        },
        {
          id: "5",
          name: "Fitness",
          icon: "activity",
          count: topicCounts.get("Fitness") || 0,
          color: "bg-orange-100"
        },
        {
          id: "6",
          name: "Happiness",
          icon: "smile",
          count: topicCounts.get("Happiness") || 0,
          color: "bg-yellow-100"
        },
        {
          id: "7",
          name: "Productivity",
          icon: "coffee",
          count: topicCounts.get("Productivity") || 0,
          color: "bg-red-100"
        },
        {
          id: "8",
          name: "Learning",
          icon: "book",
          count: topicCounts.get("Learning") || 0,
          color: "bg-indigo-100"
        }
      ]
      return defaultTopics
    }) as Promise<CommunityTopic[]>
  },

  // Like a post
  async likePost(postId: string, userId: string): Promise<void> {
    return withFirebase(async ({ db }) => {
      const postRef = doc(db, 'community', postId)
      const postSnap = await getDoc(postRef)
      
      if (!postSnap.exists()) {
        throw new Error('Post not found')
      }

      const post = postSnap.data() as CommunityPost
      
      // Check if user already liked the post
      const hasLiked = post.likes?.includes(userId)
      
      // Update likes array
      await updateDoc(postRef, {
        likes: hasLiked 
          ? post.likes.filter(id => id !== userId) // Remove like if already liked
          : arrayUnion(userId) // Add like if not already liked
      })

      // Create notification for post author only if liking (not unliking)
      if (!hasLiked && post.authorId !== userId) {
        await notificationService.createNotification({
          userId: post.authorId,
          type: 'like',
          title: 'New Like',
          message: `${post.isAnonymous ? 'Anonymous' : post.authorName} liked your post`,
          read: false,
          data: {
            postId
          }
        })
      }
    })
  }
} 