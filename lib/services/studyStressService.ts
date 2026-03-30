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
  Timestamp,
  addDoc
} from 'firebase/firestore'

export interface StudySession {
  id: string
  userId: string
  subject: string
  startTime: Date
  endTime: Date
  status: 'planned' | 'in-progress' | 'completed'
  notes?: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface StressTechnique {
  id: string
  title: string
  description: string
  duration: number
  type: 'breathing' | 'meditation' | 'exercise'
  steps: string[]
  benefits: string[]
}

export interface ExamResource {
  id: string
  title: string
  description: string
  type: 'article' | 'video' | 'tool'
  category: 'preparation' | 'techniques' | 'tips'
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export const studyStressService = {
  // Study Sessions
  async createStudySession(session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudySession> {
    try {
      const result = await withFirebase(async ({ db }) => {
        const sessionsRef = collection(db, 'studySessions');
        const newSession = {
          ...session,
          startTime: Timestamp.fromDate(session.startTime),
          endTime: Timestamp.fromDate(session.endTime),
          date: Timestamp.fromDate(session.date),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        const docRef = await addDoc(sessionsRef, newSession);
        const doc = await getDoc(docRef);
        
        if (!doc.exists()) {
          throw new Error('Failed to create study session');
        }

        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          subject: data.subject,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          status: data.status,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as StudySession;
      });

      return result;
    } catch (error) {
      console.error('Error creating study session:', error);
      throw new Error('Failed to create study session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  async getStudySessions(userId: string, date: Date): Promise<StudySession[]> {
    try {
      const result = await withFirebase(async ({ db }) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const sessionsRef = collection(db, 'studySessions');
        const q = query(
          sessionsRef,
          where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId,
              subject: data.subject,
              startTime: new Date(data.startTime),
              endTime: new Date(data.endTime),
              status: data.status,
              date: data.date?.toDate() || new Date(data.startTime),
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as StudySession;
          })
          .filter(session => {
            const sessionDate = session.date;
            return sessionDate >= startOfDay && sessionDate <= endOfDay;
          })
          .sort((a, b) => b.date.getTime() - a.date.getTime());
      });

      return result;
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      throw new Error('Failed to fetch study sessions: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  async updateStudySession(sessionId: string, updates: Partial<StudySession>): Promise<StudySession> {
    try {
      const result = await withFirebase(async ({ db }) => {
        const sessionRef = doc(db, 'studySessions', sessionId);
        
        // First get the current session data
        const currentDoc = await getDoc(sessionRef);
        if (!currentDoc.exists()) {
          throw new Error('Study session not found');
        }
        const currentData = currentDoc.data();

        // Prepare update data, preserving existing fields
        const updateData = {
          ...updates,
          // Only update these fields if they are provided in the updates
          startTime: updates.startTime ? Timestamp.fromDate(updates.startTime) : currentData.startTime,
          endTime: updates.endTime ? Timestamp.fromDate(updates.endTime) : currentData.endTime,
          date: updates.date ? Timestamp.fromDate(updates.date) : currentData.date,
          updatedAt: Timestamp.now()
        };

        await updateDoc(sessionRef, updateData);
        const updatedDoc = await getDoc(sessionRef);

        if (!updatedDoc.exists()) {
          throw new Error('Failed to update study session');
        }

        const data = updatedDoc.data();
        return {
          id: updatedDoc.id,
          userId: data.userId,
          subject: data.subject,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          status: data.status,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as StudySession;
      });

      return result;
    } catch (error) {
      console.error('Error updating study session:', error);
      throw new Error('Failed to update study session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  // Stress Reduction Techniques
  async getStressTechniques(): Promise<StressTechnique[]> {
    const result = await withFirebase(async ({ db }) => {
      const techniquesRef = collection(db, 'stressTechniques')
      const q = query(techniquesRef, orderBy('title', 'asc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as StressTechnique))
    })

    if (!result) {
      throw new Error('Failed to fetch stress techniques')
    }

    return result
  },

  // Exam Resources
  async getExamResources(category?: string): Promise<ExamResource[]> {
    const result = await withFirebase(async ({ db }) => {
      const resourcesRef = collection(db, 'examResources')
      let q = query(resourcesRef, orderBy('createdAt', 'desc'))
      
      if (category) {
        q = query(
          resourcesRef,
          where('category', '==', category),
          orderBy('createdAt', 'desc')
        )
      }
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as ExamResource))
    })

    if (!result) {
      throw new Error('Failed to fetch exam resources')
    }

    return result
  },

  // Initialize default stress techniques
  async initializeDefaultTechniques(): Promise<void> {
    const result = await withFirebase(async ({ db }) => {
      const defaultTechniques: Omit<StressTechnique, 'id'>[] = [
        {
          title: "4-7-8 Breathing",
          description: "A breathing technique to reduce anxiety and promote relaxation",
          duration: 5,
          type: "breathing",
          steps: [
            "Breathe in through your nose for 4 seconds",
            "Hold your breath for 7 seconds",
            "Exhale through your mouth for 8 seconds",
            "Repeat 4 times"
          ],
          benefits: [
            "Reduces anxiety",
            "Promotes relaxation",
            "Helps with sleep",
            "Improves focus"
          ]
        },
        {
          title: "Quick Body Scan",
          description: "A mindfulness technique to release physical tension",
          duration: 3,
          type: "meditation",
          steps: [
            "Close your eyes and take a deep breath",
            "Focus on your feet and release any tension",
            "Move up through your body, releasing tension in each area",
            "End with your head and face"
          ],
          benefits: [
            "Releases physical tension",
            "Improves body awareness",
            "Reduces stress",
            "Quick and effective"
          ]
        }
      ]

      const techniquesRef = collection(db, 'stressTechniques')
      for (const technique of defaultTechniques) {
        const newTechniqueRef = doc(techniquesRef)
        await setDoc(newTechniqueRef, {
          ...technique,
          id: newTechniqueRef.id
        })
      }
    })

    if (result === null) {
      throw new Error('Failed to initialize default techniques')
    }
  },

  // Initialize all default data
  async initializeDefaultData(): Promise<void> {
    try {
      // Initialize default stress techniques
      await this.initializeDefaultTechniques()

      // Initialize default exam resources
      await this.initializeDefaultExamResources()
    } catch (error) {
      console.error('Failed to initialize default data:', error)
      throw new Error('Failed to initialize default data')
    }
  },

  // Initialize default exam resources
  async initializeDefaultExamResources(): Promise<void> {
    const result = await withFirebase(async ({ db }) => {
      const defaultResources: Omit<ExamResource, 'id'>[] = [
        {
          title: "Effective Study Techniques",
          description: "Learn proven study methods to improve your academic performance",
          type: "article",
          category: "preparation",
          content: "This article covers various study techniques including active recall, spaced repetition, and the Feynman technique.",
          tags: ["study", "techniques", "learning"],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Exam Stress Management",
          description: "Strategies to manage stress during exam periods",
          type: "article",
          category: "techniques",
          content: "Learn how to manage exam stress through proper planning, relaxation techniques, and self-care.",
          tags: ["stress", "exams", "wellness"],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Time Management for Students",
          description: "Tips for effective time management during study periods",
          type: "article",
          category: "tips",
          content: "Practical advice on how to manage your time effectively while studying and preparing for exams.",
          tags: ["time management", "study", "productivity"],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const resourcesRef = collection(db, 'examResources')
      for (const resource of defaultResources) {
        const newResourceRef = doc(resourcesRef)
        await setDoc(newResourceRef, {
          ...resource,
          id: newResourceRef.id
        })
      }
    })

    if (result === null) {
      throw new Error('Failed to initialize default exam resources')
    }
  }
} 