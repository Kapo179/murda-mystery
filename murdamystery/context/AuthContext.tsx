import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signInWithApple: async () => {},
  signOut: async () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, [initializing]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(getReadableAuthError(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with username
      await updateProfile(userCredential.user, {
        displayName: username,
      });
    } catch (error: any) {
      setError(getReadableAuthError(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    setLoading(true);
    setError(null);
    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Create OAuthProvider credential
      const provider = new OAuthProvider('apple.com');
      const authCredential = provider.credential({
        idToken: appleCredential.identityToken!,
      });

      // Sign in with credential
      await signInWithCredential(auth, authCredential);
    } catch (error: any) {
      // Check if user canceled the sign-in flow
      if (error.code !== 'ERR_CANCELED') {
        setError('Apple sign in failed. Please try again.');
        console.error('Apple sign in error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem('userData');
    } catch (error: any) {
      setError('Failed to sign out. Please try again.');
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Helper function to convert Firebase error codes to readable messages
  const getReadableAuthError = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/weak-password':
        return 'The password is too weak.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithApple,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 