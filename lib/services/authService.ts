import { auth } from '../firebase'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth'
import { userService } from './userService'

export const authService = {
  // Register a new user
  async register(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update the user's display name
      await updateProfile(user, { displayName })

      // Create user profile in Firestore
      await userService.createUserProfile(user.uid, {
        email,
        displayName,
        role: 'user'
      })

      return user
    } catch (error) {
      throw error
    }
  },

  // Login user
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw error
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw error
    }
  },

  // Update user profile
  async updateUserProfile(user: User, data: { displayName?: string; photoURL?: string }) {
    try {
      await updateProfile(user, data)
      if (data.displayName) {
        await userService.updateUserProfile(user.uid, { displayName: data.displayName })
      }
    } catch (error) {
      throw error
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!auth.currentUser
  }
} 