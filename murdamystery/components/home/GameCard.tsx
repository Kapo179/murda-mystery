import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Text, Image } from 'react-native';
import { Typography } from '@/components/Typography';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Get both width and height for proper proportions
const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = width * 0.7;

// Import the coin emoji
const coinEmoji = require('@/assets/images/emojis/assets/Coin/3D/coin_3d.png');

interface GameCardProps {
  onPress: () => void;
  onHostPress?: () => void;
  onJoinPress?: () => void;
  compact?: boolean;
}

export function GameCard({ 
  onPress, 
  onHostPress, 
  onJoinPress, 
  compact = false 
}: GameCardProps) {
  const cardHeight = compact ? CARD_HEIGHT * 0.8 : CARD_HEIGHT;
  
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, compact && styles.compactContainer]}
    >
      <View style={[styles.cardWrapper, { height: cardHeight }]}>
        {/* Clean, text-centered card design */}
        <View style={styles.card}>
          {/* Top Label */}
          <Text style={styles.topLabel}>Don't trust anyone</Text>
          
          {/* Main Title */}
          <Text style={styles.mainTitle}>Murda Mystery</Text>
          
          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>mystery</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>group game</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>detective</Text>
            </View>
          </View>
          
          {/* Buttons Container */}
          <View style={styles.buttonsContainer}>
            {/* Host Button */}
            <TouchableOpacity 
              style={styles.hostButton} 
              onPress={() => onHostPress ? onHostPress() : onPress()}
            >
              <IconSymbol name="plus" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.hostButtonText}>Host</Text>
              
              {/* Inline coin indicator */}
              <View style={styles.inlineCoinContainer}>
                <Image source={coinEmoji} style={styles.coinImage} />
                <Text style={styles.hostCoinText}>1</Text>
              </View>
            </TouchableOpacity>
            
            {/* Join Button */}
            <TouchableOpacity 
              style={styles.joinButton} 
              onPress={() => onJoinPress ? onJoinPress() : onPress()}
            >
              <IconSymbol name="arrow.right" size={18} color="#1A1A1A" style={styles.buttonIcon} />
              <Text style={styles.joinButtonText}>Join</Text>
              
              {/* Inline coin indicator */}
              <View style={styles.inlineCoinContainer}>
                <Image source={coinEmoji} style={styles.coinImage} />
                <Text style={styles.joinCoinText}>1</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  compactContainer: {
    marginVertical: 8,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    position: 'relative',
    borderRadius: 24,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8353B', // Red background like your murder mystery theme
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    marginBottom: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 18, // Reduced to make room for tags
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  hostButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  joinButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  buttonIcon: {
    marginRight: 8,
  },
  hostButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  joinButtonText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    marginRight: 8,
  },
  inlineCoinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  coinImage: {
    width: 14,
    height: 14,
    marginRight: 2,
  },
  hostCoinText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  joinCoinText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 