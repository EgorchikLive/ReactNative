// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

export interface UserData {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
  isAdmin?: boolean;
  phoneNumber?: string | null;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  updateUserData: (data: Partial<UserData>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных пользователя из Firestore
  const loadUserData = async (uid: string, currentUser: User | null) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        // Если документа нет, создаем базовый
        const newUserData: UserData = {
          uid,
          email: currentUser?.email || null,
          displayName: currentUser?.displayName || null,
          photoURL: currentUser?.photoURL || null,
          createdAt: serverTimestamp() as Timestamp,
          lastLoginAt: serverTimestamp() as Timestamp,
          isAdmin: false,
          phoneNumber: null,
        };
        await setDoc(userDocRef, newUserData);
        setUserData(newUserData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    console.log('Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed in provider:', user ? 'Authenticated' : 'Not authenticated');
      setUser(user);
      
      if (user) {
        await loadUserData(user.uid, user);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      console.log('User signed up:', newUser.email);
      
      // Создаем документ пользователя в Firestore
      const userData: UserData = {
        uid: newUser.uid,
        email: newUser.email || null,
        displayName: displayName || newUser.displayName || null,
        photoURL: newUser.photoURL || null,
        createdAt: serverTimestamp() as Timestamp,
        lastLoginAt: serverTimestamp() as Timestamp,
        isAdmin: false,
        phoneNumber: null,
      };
      
      await setDoc(doc(db, 'users', newUser.uid), userData);
      setUserData(userData);
      
      return { success: true, user: newUser };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed in:', user.email);
      
      // Обновляем время последнего входа
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { 
          lastLoginAt: serverTimestamp() 
        }, { merge: true });
        
        await loadUserData(user.uid, user);
      }
      
      return { success: true, user };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out');
      await signOut(auth);
      setUserData(null);
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) {
      return { success: false, error: 'Пользователь не авторизован' };
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });
      
      // Обновляем локальное состояние
      setUserData(prev => prev ? { ...prev, ...data } : null);
      
      return { success: true };
    } catch (error: any) {
      console.error('Update user data error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    logout,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};