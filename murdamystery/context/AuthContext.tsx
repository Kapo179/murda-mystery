import React, { createContext, useContext, useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { TokenService } from '../services/tokenService';

type AuthState = {
  user: FirebaseAuthTypes.User | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  clearError: () => void;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
};

const initialState: AuthState = {
  user: null,
  initialized: false,
  loading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Helper to update state partially
  const updateState = (newState: Partial<AuthState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in
        try {
          // Get fresh token
          const token = await user.getIdToken();
          const { refreshToken } = user;
          
          // Store tokens
          await TokenService.setTokens(token, refreshToken);
          
          // Store minimal user data for offline access
          await TokenService.setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        } catch (error) {
          console.error('Error storing auth tokens:', error);
        }
      }
      
      updateState({ 
        user, 
        initialized: true,
        loading: false 
      });
    });
    
    // Clean up subscription
    return unsubscribe;
  }, []);

  // Email/password sign in
  const signIn = async (email: string, password: string) => {
    updateState({ loading: true, error: null });
    
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      updateState({ 
        error: error.message || 'Failed to sign in' 
      });
      throw error;
    } finally {
      updateState({ loading: false });
    }
  };

  // Email/password sign up
  const signUp = async (email: string, password: string, username: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const { user } = await auth().createUserWithEmailAndPassword(email, password);
      await user.updateProfile({ displayName: username });
    } catch (error: any) {
      updateState({ 
        error: error.message || 'Failed to create account' 
      });
      throw error;
    } finally {
      updateState({ loading: false });
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    updateState({ loading: true, error: null });
    
    try {
      // Start Apple auth flow
      const appleAuthCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      // Create Firebase credential
      const { identityToken } = appleAuthCredential;
      if (!identityToken) throw new Error('No identity token provided');
      
      const credential = auth.AppleAuthProvider.credential(identityToken);
      
      // Sign in with Firebase
      const userCredential = await auth().signInWithCredential(credential);
      
      // Update user profile with Apple name if not already set
      if (appleAuthCredential.fullName && 
          (!userCredential.user.displayName || userCredential.user.displayName === '')) {
        const displayName = [
          appleAuthCredential.fullName.givenName,
          appleAuthCredential.fullName.familyName,
        ].filter(Boolean).join(' ');
        
        if (displayName) {
          await userCredential.user.updateProfile({ displayName });
        }
      }
    } catch (error: any) {
      // Handle specific Apple auth errors
      if (error.code !== 'ERR_CANCELED') {
        updateState({ 
          error: error.message || 'Apple sign in failed' 
        });
      }
      throw error;
    } finally {
      updateState({ loading: false });
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    updateState({ loading: true, error: null });
    
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      updateState({ 
        error: error.message || 'Failed to send password reset email' 
      });
      throw error;
    } finally {
      updateState({ loading: false });
    }
  };

  // Update user profile
  const updateProfile = async (displayName?: string, photoURL?: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('No authenticated user');
      
      await user.updateProfile({ displayName, photoURL });
      
      // Update state with new user info
      updateState({ user: auth().currentUser });
      
      // Update cached user data
      await TokenService.setUserData({
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL,
      });
    } catch (error: any) {
      updateState({ 
        error: error.message || 'Failed to update profile' 
      });
      throw error;
    } finally {
      updateState({ loading: false });
    }
  };

  // Sign out
  const signOut = async () => {
    updateState({ loading: true, error: null });
    
    try {
      await auth().signOut();
      await TokenService.clearTokens();
    } catch (error: any) {
      updateState({ 
        error: error.message || 'Failed to sign out' 
      });
      throw error;
    } finally {
      updateState({ loading: false });
    }
  };

  // Clear error
  const clearError = () => {
    updateState({ error: null });
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithApple,
    clearError,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 