import auth from '@react-native-firebase/auth';
import { TokenService } from './tokenService';

export const AuthService = {
  // Get current user from Firebase
  getCurrentUser: () => {
    return auth().currentUser;
  },
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await TokenService.getAccessToken();
      return !!token && !!auth().currentUser;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  },
  
  // Get current auth token
  getAuthToken: async () => {
    try {
      const token = await TokenService.getAccessToken();
      if (!token) {
        // Try to refresh if no token found
        return await TokenService.refreshToken();
      }
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },
  
  // Update email
  updateEmail: async (newEmail: string) => {
    const user = auth().currentUser;
    if (!user) throw new Error('No authenticated user');
    
    await user.updateEmail(newEmail);
    
    // Update cached user data
    const userData = await TokenService.getUserData();
    if (userData) {
      await TokenService.setUserData({
        ...userData,
        email: newEmail
      });
    }
  },
  
  // Verify email
  sendEmailVerification: async () => {
    const user = auth().currentUser;
    if (!user) throw new Error('No authenticated user');
    
    await user.sendEmailVerification();
  },
  
  // Reauthenticate user (needed for sensitive operations)
  reauthenticate: async (password: string) => {
    const user = auth().currentUser;
    if (!user || !user.email) throw new Error('No authenticated user or email');
    
    const credential = auth.EmailAuthProvider.credential(user.email, password);
    await user.reauthenticateWithCredential(credential);
  },
  
  // Delete account
  deleteAccount: async () => {
    const user = auth().currentUser;
    if (!user) throw new Error('No authenticated user');
    
    await user.delete();
    await TokenService.clearTokens();
  }
}; 