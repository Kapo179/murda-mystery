import React, { useState } from 'react';
import { StyleSheet, View, Platform, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Typography } from '@/components/Typography';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { StatusBar } from 'expo-status-bar';
import { FloatingCard } from '@/components/ui/FloatingCard';
import { GameIcon } from '@/components/ui/GameIcon';
import { BellIcon } from '@/components/ui/BellIcon';
import { GameSetupSheet } from '@/components/sheets/GameSetupSheet';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { CoinInfoModal } from '@/components/modals/CoinInfoModal';
import { GameInstructionsModal } from '@/components/modals/GameInstructionsModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const murdaImage = require('@/assets/images/game-modes/murdaa-mystery.png');
const grinningEmoji = require('@/assets/images/emojis/assets/grinning-face-with-big-eyes/3d/grinning_face_with_big_eyes_3d.png');
const globeEmoji = require('@/assets/images/emojis/assets/globe-showing-americas/3d/globe_showing_americas_3d.png');
const medalEmoji = require('@/assets/images/emojis/assets/Coin/3D/coin_3d.png');
const detectiveEmoji = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');
const gearEmoji = require('@/assets/images/emojis/assets/Gear/3D/gear_3d.png');
const coinEmoji = require('@/assets/images/emojis/assets/Coin/3D/coin_3d.png');

export default function HomeScreen() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showCoinInfo, setShowCoinInfo] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Image source={gearEmoji} style={styles.headerIcon} />
        </TouchableOpacity>
        
        <Typography 
          variant="title" 
          weight="normal"
          style={styles.headerTitle}
        >
          Play
        </Typography>
        
        <TouchableOpacity style={styles.notificationButton}>
          <BellIcon size={24} color="rgba(255, 255, 255, 1)" />
        </TouchableOpacity>
      </View>

      {/* Game Mode Card */}
      <TouchableOpacity 
        style={styles.cardContainer}
        onPress={() => setShowInstructions(true)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          <Typography 
            variant="label" 
            weight="bold"
            style={styles.cardTitle}
          >
            Murda Mystery
          </Typography>
          <Typography 
            variant="caption" 
            style={styles.playerCount}
          >
            5 - 16 Players
          </Typography>
          <Image 
            source={murdaImage}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <Image 
            source={detectiveEmoji}
            style={styles.detectiveEmoji}
            resizeMode="contain"
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Indicators */}
      <View style={styles.indicators}>
        <View style={styles.indicator}>
          <View style={styles.iconContainer}>
            <Image source={grinningEmoji} style={styles.indicatorIcon} />
          </View>
          <Typography 
            variant="caption" 
            style={styles.indicatorText}
            numberOfLines={1}
          >
            5-16 Players
          </Typography>
        </View>
        
        <View style={styles.indicator}>
          <View style={styles.iconContainer}>
            <Image source={globeEmoji} style={styles.indicatorIcon} />
          </View>
          <Typography 
            variant="caption" 
            style={styles.indicatorText}
            numberOfLines={1}
          >
            Play Anywhere
          </Typography>
        </View>
        
        <View style={[styles.indicator, styles.gamesLeft]}>
          <TouchableOpacity 
            style={styles.iconContainer}
            onPress={() => setShowCoinInfo(true)}
          >
            <Image source={medalEmoji} style={styles.indicatorIcon} />
          </TouchableOpacity>
          <Typography 
            variant="caption" 
            style={styles.indicatorText}
            numberOfLines={1}
          >
            3
          </Typography>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.hostButton}
          onPress={() => setShowSetup(true)}
        >
          <View style={styles.buttonContent}>
            <Typography variant="label" style={styles.buttonText}>
              Host Game
            </Typography>
            <View style={styles.coinIndicator}>
              <Image source={coinEmoji} style={styles.coinIcon} />
              <Typography variant="caption" style={styles.coinText}>
                1
              </Typography>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.buttonGap} />
        <TouchableOpacity style={styles.joinButton}>
          <View style={styles.buttonContent}>
            <Typography variant="label" style={styles.buttonText}>
              Join Game
            </Typography>
            <View style={styles.coinIndicator}>
              <Image source={coinEmoji} style={styles.coinIcon} />
              <Typography variant="caption" style={styles.coinText}>
                1
              </Typography>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <GameInstructionsModal 
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
        onStartSetup={() => {
          setShowInstructions(false);
          setShowSetup(true);
        }}
      />

      <GameSetupSheet 
        visible={showSetup}
        onClose={() => setShowSetup(false)}
      />

      <CoinInfoModal 
        visible={showCoinInfo}
        onClose={() => setShowCoinInfo(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    position: 'absolute',
    left: 20,
    bottom: -60,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  card: {
    width: '100%',
    aspectRatio: 1.8,
    backgroundColor: '#FF3131',
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
    zIndex: 2,
    position: 'relative',
  },
  playerCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
    zIndex: 2,
    position: 'relative',
  },
  cardImage: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: '120%',
    width: '120%',
  },
  detectiveEmoji: {
    position: 'absolute',
    bottom: -9,
    right: 16,
    width: 140,
    height: 140,
    zIndex: 1,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    marginTop: 'auto',
  },
  hostButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 32,
    padding: 16,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 32,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  indicators: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 'auto',
  },
  indicator: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    flex: 1,
  },
  iconContainer: {
    marginBottom: 4,
  },
  indicatorIcon: {
    width: 24,
    height: 24,
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
  },
  gamesLeft: {
    flex: 0,
    width: 80,
  },
  buttonGap: {
    height: 12,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  menuButton: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  coinIcon: {
    width: 16,
    height: 16,
  },
  coinText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
}); 