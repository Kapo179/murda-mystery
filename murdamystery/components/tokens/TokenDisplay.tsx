import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image
} from 'react-native';
import { useTokens } from '@/hooks/useTokens';
import { formatDistanceToNow } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { EMOJI_PATHS } from '@/constants/AssetPaths';

interface TokenDisplayProps {
  showButtons?: boolean;
  compact?: boolean;
  onTokensChanged?: (newBalance: number) => void;
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({ 
  showButtons = true,
  compact = false,
  onTokensChanged
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  
  const { 
    balance, 
    canClaimDaily, 
    nextClaimTime, 
    isLoading,
    isClaimingDaily,
    isClaimingAd,
    error,
    fetchBalance,
    claimDailyTokens,
    claimAdReward,
    clearError
  } = useTokens();

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Notify parent when token balance changes
  useEffect(() => {
    if (onTokensChanged && !isLoading) {
      onTokensChanged(balance);
    }
  }, [balance, isLoading, onTokensChanged]);

  // Show error messages with Alert
  useEffect(() => {
    if (error) {
      Alert.alert('Token Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  // Calculate time remaining for daily claim
  const getTimeRemaining = () => {
    if (!nextClaimTime) return '';
    try {
      return formatDistanceToNow(new Date(nextClaimTime), { addSuffix: true });
    } catch (e) {
      return 'soon';
    }
  };

  // Handle daily claim
  const handleClaimDaily = async () => {
    const result = await claimDailyTokens();
    if (result) {
      Alert.alert('Success', `You received ${result.tokensAdded} tokens!`);
    }
  };

  // Handle ad reward
  const handleWatchAd = async () => {
    // Here you would integrate with your actual ad service
    // For now, we'll just call the API directly
    
    // Mock ad view
    Alert.alert(
      'Watch Ad', 
      'Would you like to watch an ad to receive tokens?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Watch', 
          onPress: async () => {
            // Simulate ad completion
            setTimeout(async () => {
              const result = await claimAdReward();
              if (result) {
                Alert.alert('Success', `You received ${result.tokensAdded} tokens!`);
              }
            }, 1000);
          } 
        }
      ]
    );
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} style={{ marginLeft: 8 }} />
        ) : (
          <>
            <Image 
              source={{ uri: EMOJI_PATHS.COIN }} 
              style={styles.coinImageCompact} 
              resizeMode="contain"
            />
            <Text style={[styles.compactBalance, { color: isDark ? '#fff' : '#000' }]}>
              {balance}
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0' }]}>
      <View style={styles.balanceContainer}>
        <Image 
          source={{ uri: EMOJI_PATHS.COIN }} 
          style={styles.coinImage} 
          resizeMode="contain"
        />
        
        {isLoading ? (
          <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} style={{ marginLeft: 10 }} />
        ) : (
          <Text style={[styles.balanceText, { color: isDark ? '#fff' : '#000' }]}>
            {balance} Tokens
          </Text>
        )}
      </View>
      
      {showButtons && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.claimButton,
              { backgroundColor: canClaimDaily ? Colors.primary : '#555' },
              { opacity: isClaimingDaily ? 0.7 : 1 }
            ]}
            onPress={handleClaimDaily}
            disabled={!canClaimDaily || isClaimingDaily}
          >
            {isClaimingDaily ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="calendar-clock" size={18} color="#fff" />
                <Text style={styles.buttonText}>
                  {canClaimDaily ? 'Claim Daily' : 'Next Claim ' + getTimeRemaining()}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.adButton,
              { opacity: isClaimingAd ? 0.7 : 1 }
            ]}
            onPress={handleWatchAd}
            disabled={isClaimingAd}
          >
            {isClaimingAd ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="play-circle-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Watch Ad</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  compactBalance: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5722',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
    marginRight: 8,
  },
  adButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
    fontSize: 14,
  },
  coinImage: {
    width: 28,
    height: 28,
  },
  coinImageCompact: {
    width: 24,
    height: 24,
  },
}); 