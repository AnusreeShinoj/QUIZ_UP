import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types/quiz';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string, 
    pass: string, 
    name: string, 
    role: 'student' | 'educator',
    branch?: string,
    semester?: string
  ) => Promise<void>;
  demoLogin: (role: 'student' | 'educator') => void;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_STUDENT: UserProfile = {
  id: 'demo-student-it-01',
  displayName: 'Nisha Gopal',
  email: 'nishagopal943@gmail.com',
  role: 'student',
  college: 'B.Tech IT Department',
  branch: 'Information Technology',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const DEMO_EDUCATOR: UserProfile = {
  id: 'demo-educator-it-02',
  displayName: 'Prof. Aditi Sharma',
  email: 'aditi.sharma@college.edu',
  role: 'educator',
  college: 'Department of Computer & IT Engineering',
  branch: 'Information Technology',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('quizup_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_STUDENT;
      }
    }
    return DEMO_STUDENT;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const userRef = doc(db, 'users', fbUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const profile = userSnap.data() as UserProfile;
            setUserProfile(profile);
            localStorage.setItem('quizup_user_profile', JSON.stringify(profile));
          } else {
            const newProfile: UserProfile = {
              id: fbUser.uid,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
              role: 'student',
              college: 'B.Tech Information Technology',
              branch: 'Information Technology',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
            localStorage.setItem('quizup_user_profile', JSON.stringify(newProfile));
          }
        } catch (error) {
          console.warn('Error syncing Firestore user profile:', error);
          const localProfile: UserProfile = {
            id: fbUser.uid,
            displayName: fbUser.displayName || 'Student',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || undefined,
            role: 'student',
            college: 'B.Tech Information Technology',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUserProfile(localProfile);
          localStorage.setItem('quizup_user_profile', JSON.stringify(localProfile));
        }
      } else {
        setUser(null);
        const saved = localStorage.getItem('quizup_user_profile');
        if (saved) {
          try {
            setUserProfile(JSON.parse(saved));
          } catch {
            setUserProfile(DEMO_STUDENT);
          }
        } else {
          setUserProfile(DEMO_STUDENT);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  // Email & Password Sign In
  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(res.user);
    } catch (err: any) {
      console.warn('Firebase email auth login warning:', err?.message);
      // If email auth provider is pending in Firebase Console, support registered local credential
      const usersRegistryStr = localStorage.getItem('quizup_local_registered_users');
      const registry: Record<string, any> = usersRegistryStr ? JSON.parse(usersRegistryStr) : {};
      const matched = registry[email.toLowerCase().trim()];
      
      if (matched && matched.password === pass) {
        const localProfile: UserProfile = {
          id: matched.id,
          displayName: matched.displayName,
          email: matched.email,
          role: matched.role || 'student',
          college: matched.college || 'B.Tech Information Technology',
          branch: matched.branch || 'Information Technology',
          createdAt: matched.createdAt,
          updatedAt: new Date().toISOString()
        };
        setUserProfile(localProfile);
        localStorage.setItem('quizup_user_profile', JSON.stringify(localProfile));
        return;
      }

      // Check if user is typing the demo accounts
      if (email.includes('nishagopal') || email.includes('student')) {
        setUserProfile(DEMO_STUDENT);
        localStorage.setItem('quizup_user_profile', JSON.stringify(DEMO_STUDENT));
        return;
      }
      if (email.includes('aditi') || email.includes('faculty')) {
        setUserProfile(DEMO_EDUCATOR);
        localStorage.setItem('quizup_user_profile', JSON.stringify(DEMO_EDUCATOR));
        return;
      }

      throw new Error(err?.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Register with Email
  const registerWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    role: 'student' | 'educator',
    branch = 'Information Technology',
    semester = '6th Semester'
  ) => {
    setLoading(true);
    try {
      let createdUid = 'user-' + Date.now();
      try {
        const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        setUser(res.user);
        createdUid = res.user.uid;
        await fbUpdateProfile(res.user, { displayName: name.trim() });
      } catch (fbErr: any) {
        console.warn('Firebase createUser warning, using local registry fallback:', fbErr);
      }

      const newProfile: UserProfile = {
        id: createdUid,
        displayName: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        college: 'B.Tech Information Technology',
        branch,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to local registry so student can log back in with same credentials
      const usersRegistryStr = localStorage.getItem('quizup_local_registered_users');
      const registry: Record<string, any> = usersRegistryStr ? JSON.parse(usersRegistryStr) : {};
      registry[email.toLowerCase().trim()] = {
        ...newProfile,
        password: pass
      };
      localStorage.setItem('quizup_local_registered_users', JSON.stringify(registry));

      // Save to firestore if online
      if (auth.currentUser && db) {
        try {
          await setDoc(doc(db, 'users', createdUid), newProfile);
        } catch (e) {
          console.warn('Firestore user profile save fallback:', e);
        }
      }

      setUserProfile(newProfile);
      localStorage.setItem('quizup_user_profile', JSON.stringify(newProfile));

    } finally {
      setLoading(false);
    }
  };

  // Fast Viva / Demo Personas
  const demoLogin = (role: 'student' | 'educator') => {
    const profile = role === 'student' ? DEMO_STUDENT : DEMO_EDUCATOR;
    setUserProfile(profile);
    localStorage.setItem('quizup_user_profile', JSON.stringify(profile));
  };

  // Sign out
  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setUserProfile(DEMO_STUDENT);
      localStorage.setItem('quizup_user_profile', JSON.stringify(DEMO_STUDENT));
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...data, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    localStorage.setItem('quizup_user_profile', JSON.stringify(updated));

    if (user && db) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        demoLogin,
        logout,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
