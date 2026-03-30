import { User as FirebaseUser } from 'firebase/auth'

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "wellness" | "community" | "achievement";
  requirements: {
    type: string;
    count: number;
  };
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: Date;
  progress?: number;
}

export interface User extends FirebaseUser {
  role: 'user' | 'admin' | 'counselor';
  createdAt: Date;
  updatedAt: Date;
} 