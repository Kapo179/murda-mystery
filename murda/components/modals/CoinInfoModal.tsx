import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '../Typography';
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';

interface CoinInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CoinInfoModal({ visible, onClose }: CoinInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark">
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <Animated.View 
            entering={SlideInDown.springify().damping(15)}
            exiting={SlideOutDown.springify().damping(15)}
            style={styles.content}
          >
            <Typography variant="title" weight="bold" style={styles.title}>
              Game Coins
            </Typography>
            
            <Typography style={styles.description}>
              Each game costs 1 coin to play. Get more coins:
            </Typography>
            
            <View style={styles.bulletPoints}>
              <Typography style={styles.bullet}>• Winning games (2 coins)</Typography>
              <Typography style={styles.bullet}>• Daily rewards (3 coins)</Typography>
              <Typography style={styles.bullet}>• Watching ads (1 coin)</Typography>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 8,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    lineHeight: 24,
  },
  bulletPoints: {
    gap: 12,
  },
  bullet: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    lineHeight: 24,
  },
}); 