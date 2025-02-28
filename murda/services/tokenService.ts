import * as SecureStore from 'expo-secure-store';
import auth from '@react-native-firebase/auth';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_DATA_KEY = 'auth_user_data';

export const TokenService = {
  // Store tokens securely
  setTokens: async (accessToken: string, refreshToken: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },

  // Store user data securely (non-sensitive)
  setUserData: async (userData: any) => {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
  },

  // Get the current access token
  getAccessToken: async () => {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  // Get the refresh token
  getRefreshToken: async () => {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  // Get cached user data
  getUserData: async () => {
    const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Refresh the access token using Firebase
  refreshToken: async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const token = await currentUser.getIdToken(true); // Force refresh
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await TokenService.clearTokens();
      throw error;
    }
  },

  // Clear all tokens (logout)
  clearTokens: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  }
}; 