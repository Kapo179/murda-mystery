import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'firebase_token';
const REFRESH_TOKEN_KEY = 'firebase_refresh_token';
const USER_DATA_KEY = 'user_data';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const TokenService = {
  // Store tokens
  setTokens: async (token: string, refreshToken: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  },

  // Get tokens
  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Clear tokens on logout
  clearTokens: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },

  // Store user data for offline access
  setUserData: async (userData: UserData): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  },

  // Get cached user data
  getUserData: async (): Promise<UserData | null> => {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }
}; 