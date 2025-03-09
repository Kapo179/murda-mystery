import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

// Get screen width to calculate proper scaling
const { width: screenWidth } = Dimensions.get('window');

// Define exact dimensions from design
const CARD_WIDTH = 363;
const CARD_HEIGHT = 320;

interface GameCardProps {
  onPress?: () => void;
  onHostPress?: () => void;
  onJoinPress?: () => void;
  compact?: boolean;
  showCoinIndicator?: boolean;
}

export function GameCard({ 
  onPress, 
  onHostPress, 
  onJoinPress,
  compact = false,
  showCoinIndicator = true
}: GameCardProps) {
  // Get the current theme
  const colorScheme = useColorScheme() ?? 'dark';
  
  // Animation value for the info button
  const scale = useSharedValue(1);
  
  // Set up the pulsing animation
  useEffect(() => {
    // Create a pulsing animation sequence
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Repeat infinitely
      true // Reverse each cycle
    );
  }, []);
  
  // Create the animated style for the info button
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    };
  });
  
  // Import coin emoji asset
  const coinEmoji = require('@/assets/images/emojis/assets/Coin/3D/coin_3d.png');
  
  // Banner images based on theme
  const bannerDark = require('@/assets/images/Banner-dark.png');
  const bannerLight = require('@/assets/images/Banner-light.png');
  
  // Select the appropriate banner based on theme
  const bannerSource = colorScheme === 'dark' ? bannerDark : bannerLight;

  // Separate handler for info button click - with event stop propagation
  const handleInfoButtonPress = (e: any) => {
    // Stop event propagation to prevent the card's onPress from firing
    e.stopPropagation();
    
    console.log('Info button clicked explicitly');
    if (onPress) {
      onPress();
    }
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.container,
        compact && styles.compactContainer
      ]}
      onPress={onPress}
    >
      <ImageBackground
        source={bannerSource}
        style={styles.bannerBackground}
        imageStyle={styles.bannerImage}
        resizeMode="cover"
      >
        <View style={styles.contentContainer}>
          {/* Title and Info Button */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Murda Mystery</Text>
              <Text style={styles.subtitle}>GPS-Game</Text>
            </View>
            
            {/* Make the info button a standalone touchable with its own onPress handler */}
            <TouchableOpacity 
              style={styles.infoButtonContainer}
              onPress={handleInfoButtonPress}
              activeOpacity={0.6}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <Animated.View style={animatedStyle}>
                <Text style={styles.infoButtonText}>!</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
          
          {/* Coin Indicator */}
          {showCoinIndicator !== false && (
            <View style={styles.coinContainer}>
              <View style={styles.coinIndicator}>
                <Image source={coinEmoji} style={styles.coinIcon} />
                <Text style={styles.coinText}>1/1</Text>
              </View>
            </View>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: CARD_WIDTH / CARD_HEIGHT, // Exactly 363/320 = 1.134
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  compactContainer: {
    aspectRatio: 3,
  },
  bannerBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bannerImage: {
    borderRadius: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500', // Medium
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500', // Medium
    marginTop: 4,
  },
  infoButtonContainer: {
    zIndex: 10, // Higher z-index to ensure it's clickable
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  coinContainer: {
    alignItems: 'flex-end',
  },
  coinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  coinIcon: {
    width: 28,
    height: 28,
    marginRight: 6,
  },
  coinText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500', // Medium
  },
}); 