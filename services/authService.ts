import { onAuthStateChanged, signInAnonymously, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export class AuthService {
  private static currentUser: User | null = null;

  // Initialize authentication listener
  static initializeAuth(): Promise<User | null> {
    return new Promise((resolve) => {
      try {
        if (!auth) {
          console.log('Firebase auth not available, resolving with null');
          resolve(null);
          return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.currentUser = user;
            console.log('User signed in:', user.uid);
            resolve(user);
          } else {
            // Auto sign in anonymously if no user
            try {
              if (!auth) {
                console.log('Firebase auth not available for anonymous sign in');
                resolve(null);
                return;
              }
              const userCredential = await signInAnonymously(auth);
              this.currentUser = userCredential.user;
              console.log('Anonymous user created:', userCredential.user.uid);
              resolve(userCredential.user);
            } catch (error) {
              console.error('Error signing in anonymously:', error);
              resolve(null);
            }
          }
          unsubscribe();
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        resolve(null);
      }
    });
  }

  // Get current user ID
  static getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }

  // Get current user
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Sign out (optional)
  static async signOut(): Promise<void> {
    try {
      if (auth) {
        await signOut(auth);
      }
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}
