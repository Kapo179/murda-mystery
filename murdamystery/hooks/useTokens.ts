import { useState, useCallback } from 'react';
import api, { TokenBalanceResponse, TokenClaimResponse, TokenAdResponse } from '@/services/api';

interface UseTokensReturn {
  // Token data
  balance: number;
  canClaimDaily: boolean;
  nextClaimTime: string | null;
  totalAdsWatched: number;
  
  // Loading states
  isLoading: boolean;
  isClaimingDaily: boolean;
  isClaimingAd: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchBalance: () => Promise<void>;
  claimDailyTokens: () => Promise<TokenClaimResponse | null>;
  claimAdReward: () => Promise<TokenAdResponse | null>;
  spendTokens: (amount: number, item: string) => Promise<boolean>;
  
  // Reset functions
  clearError: () => void;
}

/**
 * Hook for managing token balance and token-related operations
 */
export function useTokens(): UseTokensReturn {
  // Token data states
  const [balance, setBalance] = useState<number>(0);
  const [canClaimDaily, setCanClaimDaily] = useState<boolean>(false);
  const [nextClaimTime, setNextClaimTime] = useState<string | null>(null);
  const [totalAdsWatched, setTotalAdsWatched] = useState<number>(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClaimingDaily, setIsClaimingDaily] = useState<boolean>(false);
  const [isClaimingAd, setIsClaimingAd] = useState<boolean>(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Fetch the current token balance and status
   */
  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.tokens.getBalance();
      
      setBalance(data.tokenBalance);
      setCanClaimDaily(data.canClaimDaily);
      setNextClaimTime(data.nextClaimTime);
      setTotalAdsWatched(data.totalAdsWatched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token balance');
      console.error('Error fetching token balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Claim daily token reward
   */
  const claimDailyTokens = useCallback(async (): Promise<TokenClaimResponse | null> => {
    setIsClaimingDaily(true);
    setError(null);
    
    try {
      const result = await api.tokens.claimDailyTokens();
      
      // Update local state with new values
      setBalance(result.tokenBalance);
      setCanClaimDaily(false);
      setNextClaimTime(result.nextClaimTime);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim daily tokens';
      setError(message);
      console.error('Error claiming daily tokens:', err);
      return null;
    } finally {
      setIsClaimingDaily(false);
    }
  }, []);
  
  /**
   * Claim tokens from watching an ad
   */
  const claimAdReward = useCallback(async (): Promise<TokenAdResponse | null> => {
    setIsClaimingAd(true);
    setError(null);
    
    try {
      const result = await api.tokens.claimAdReward();
      
      // Update local state with new values
      setBalance(result.tokenBalance);
      setTotalAdsWatched(result.totalAdsWatched);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim ad reward';
      setError(message);
      console.error('Error claiming ad reward:', err);
      return null;
    } finally {
      setIsClaimingAd(false);
    }
  }, []);
  
  /**
   * Spend tokens on an item
   */
  const spendTokens = useCallback(async (amount: number, item: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await api.tokens.spendTokens(amount, item);
      
      // Update local balance with new value
      setBalance(result.tokenBalance);
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to spend tokens';
      setError(message);
      console.error('Error spending tokens:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Clear any error messages
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    // Token data
    balance,
    canClaimDaily,
    nextClaimTime,
    totalAdsWatched,
    
    // Loading states
    isLoading,
    isClaimingDaily,
    isClaimingAd,
    
    // Error state
    error,
    
    // Actions
    fetchBalance,
    claimDailyTokens,
    claimAdReward,
    spendTokens,
    
    // Reset functions
    clearError,
  };
} 