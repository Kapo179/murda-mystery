import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Constants from 'expo-constants';

// API Constants
let API_BASE = 'http://localhost:3001/api/v1';

// For Expo Go on physical devices, you might need to use your computer's IP address
if (__DEV__) {
  const devServerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (devServerHost) {
    API_BASE = `http://${devServerHost}:3001/api/v1`;
  }
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface TokenBalanceResponse {
  tokenBalance: number;
  canClaimDaily: boolean;
  nextClaimTime: string | null;
  totalAdsWatched: number;
}

export interface TokenClaimResponse {
  tokenBalance: number;
  tokensAdded: number;
  nextClaimTime: string;
}

export interface TokenAdResponse {
  tokenBalance: number;
  tokensAdded: number;
  totalAdsWatched: number;
}

// Error Types
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// API Client Setup
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add Auth Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response } = error;
    const status = response?.status || 500;
    const message = 
      response?.data?.message || 
      response?.data?.error || 
      error.message || 
      'An unknown error occurred';

    return Promise.reject(new ApiError(message, status, response?.data));
  }
);

// Authentication Functions
export const auth = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>('/users/login', {
        email,
        password,
      });

      if (response.data.success && response.data.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
        return response.data.data;
      }
      
      throw new ApiError('Authentication failed', 401);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.data?.message || 'Authentication failed',
          error.response?.status || 401
        );
      }
      throw new ApiError((error as Error).message || 'Authentication failed', 401);
    }
  },

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>('/users/register', {
        username,
        email,
        password,
      });

      if (response.data.success && response.data.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
        return response.data.data;
      }
      
      throw new ApiError('Registration failed', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.data?.message || 'Registration failed',
          error.response?.status || 400
        );
      }
      throw new ApiError((error as Error).message || 'Registration failed', 400);
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  },

  /**
   * Check if the user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },

  /**
   * Get the current auth token
   */
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }
};

// Token Functions
export const tokens = {
  /**
   * Get current token balance and status
   */
  async getBalance(): Promise<TokenBalanceResponse> {
    try {
      const response = await apiClient.get<ApiResponse<TokenBalanceResponse>>('/tokens/balance');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new ApiError('Failed to get token balance', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to get token balance', 400);
    }
  },

  /**
   * Claim daily token reward
   */
  async claimDailyTokens(): Promise<TokenClaimResponse> {
    try {
      const response = await apiClient.post<ApiResponse<TokenClaimResponse>>('/tokens/daily');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new ApiError(response.data.message || 'Failed to claim daily tokens', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to claim daily tokens', 400);
    }
  },

  /**
   * Claim ad reward tokens
   */
  async claimAdReward(): Promise<TokenAdResponse> {
    try {
      const response = await apiClient.post<ApiResponse<TokenAdResponse>>('/tokens/adReward');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new ApiError(response.data.message || 'Failed to claim ad reward', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to claim ad reward', 400);
    }
  },

  /**
   * Spend tokens on an item
   */
  async spendTokens(amount: number, item: string): Promise<{ tokenBalance: number; tokensSpent: number; item: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ tokenBalance: number; tokensSpent: number; item: string }>>(
        '/tokens/spend',
        { amount, item }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new ApiError(response.data.message || 'Failed to spend tokens', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to spend tokens', 400);
    }
  }
};

// Lobbies/Matchmaking Functions
export const lobbies = {
  /**
   * Create a new lobby
   */
  async createLobby(isPrivate = false, settings = {}): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>('/lobbies/create', {
        isPrivate,
        settings
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new ApiError(response.data.message || 'Failed to create lobby', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to create lobby', 400);
    }
  },

  /**
   * Join a lobby with code
   */
  async joinLobby(code: string): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>('/lobbies/join', { code });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new ApiError(response.data.message || 'Failed to join lobby', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to join lobby', 400);
    }
  },

  /**
   * Get available public lobbies
   */
  async getPublicLobbies(): Promise<any[]> {
    try {
      const response = await apiClient.get<ApiResponse>('/lobbies');
      
      if (response.data.success && response.data.data) {
        return response.data.data.lobbies || [];
      }
      
      throw new ApiError(response.data.message || 'Failed to get lobbies', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to get lobbies', 400);
    }
  },

  /**
   * Leave a lobby
   */
  async leaveLobby(code: string): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>(`/lobbies/${code}/leave`);
      
      if (response.data.success) {
        return response.data.data || { success: true };
      }
      
      throw new ApiError(response.data.message || 'Failed to leave lobby', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to leave lobby', 400);
    }
  },

  /**
   * Start a game from a lobby (host only)
   */
  async startGame(code: string): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>(`/lobbies/${code}/start`);
      
      if (response.data.success) {
        return response.data.data || { success: true };
      }
      
      throw new ApiError(response.data.message || 'Failed to start game', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to start game', 400);
    }
  }
};

// KillCam Functions
export const killcam = {
  /**
   * Save a killcam recording
   */
  async saveKillCam(data: {
    gameId: string;
    victimId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    location?: { latitude: number; longitude: number };
  }): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>('/killcam/save', data);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new ApiError(response.data.message || 'Failed to save killcam', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to save killcam', 400);
    }
  },

  /**
   * Get killcam recordings for the current user
   */
  async getUserKillCams(params: {
    type?: 'all' | 'killer' | 'victim';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ total: number; killCams: any[] }> {
    try {
      const { type = 'all', limit = 20, offset = 0 } = params;
      const response = await apiClient.get<ApiResponse>(`/killcam/list?type=${type}&limit=${limit}&offset=${offset}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new ApiError(response.data.message || 'Failed to get killcams', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to get killcams', 400);
    }
  },

  /**
   * Get a specific killcam by ID
   */
  async getKillCamById(id: string): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse>(`/killcam/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new ApiError(response.data.message || 'Failed to get killcam', 400);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError((error as Error).message || 'Failed to get killcam', 400);
    }
  }
};

// Export a unified API object
const api = {
  auth,
  tokens,
  lobbies,
  killcam,
};

export default api; 