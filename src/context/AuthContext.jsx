import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';

const defaultPersonas = {
  admin: {
    uid: 'demo-admin-01',
    name: 'Dr. Rajesh Sharma',
    email: 'admin@univ.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    employeeId: 'ADM001',
  },
  teacher: {
    uid: 'demo-teacher-01',
    name: 'Prof. Ananya Sen',
    email: 'ananya.sen@univ.edu',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    employeeId: 'EMP101',
  },
  student: {
    uid: 'demo-student-01',
    name: 'Aayush Sharma',
    email: 'aayush.s@univ.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    rollNumber: '2024CS101',
  },
};

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('univ_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return defaultPersonas.student;
  });

  const role = user?.role || 'student';
  const isAuthenticated = user !== null;

  useEffect(() => {
    if (user) {
      localStorage.setItem('univ_user', JSON.stringify(user));
      fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-email': user.email,
          'x-user-name': user.name,
        },
        body: JSON.stringify(user),
      }).catch((e) => console.warn('User sync notice:', e));
    } else {
      localStorage.removeItem('univ_user');
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && (!user || user.uid?.startsWith('demo-'))) {
        const newUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || 'Faculty Member',
          email: fbUser.email || 'faculty@univ.edu',
          role: 'teacher',
          avatar: fbUser.photoURL || undefined,
        };
        setUser(newUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const loginAsRole = (selectedRole) => {
    const persona = defaultPersonas[selectedRole];
    setUser(persona);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      const newUser = {
        uid: fbUser.uid,
        name: fbUser.displayName || 'University Member',
        email: fbUser.email || 'member@univ.edu',
        role: 'teacher',
        avatar: fbUser.photoURL || undefined,
      };
      setUser(newUser);
    } catch (err) {
      console.error('Firebase Google Sign-In error:', err);
      loginAsRole('teacher');
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
  };

  const updateProfile = (data) => {
    if (!user) return;
    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loginAsRole,
        signInWithGoogle,
        signOut,
        updateProfile,
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
