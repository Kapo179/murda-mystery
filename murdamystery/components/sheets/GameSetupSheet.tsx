import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Typography } from '../Typography';
import { FloatingCard } from '../ui/FloatingCard';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -(SCREEN_HEIGHT * 0.75);

// Add emoji imports
const ninjaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const detectiveEmoji = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');
const faceEmoji = require('@/assets/images/emojis/assets/Face-without-mouth/3D/face_without_mouth_3d.png');
const checkMarkEmoji = require('@/assets/images/emojis/assets/Check mark button/3D/check_mark_button_3d.png');

interface GameSetupSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function GameSetupSheet({ visible, onClose }: GameSetupSheetProps) {
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const [playerCount, setPlayerCount] = React.useState(5);
  const [mafiaCount, setMafiaCount] = React.useState(2);
  const [useDetectives, setUseDetectives] = React.useState(true);
  const router = useRouter();

  const blurIntensity = useAnimatedStyle(() => {
    const intensity = interpolate(
      translateY.value,
      [0, MAX_TRANSLATE_Y],
      [0, 20],
      Extrapolate.CLAMP
    );
    return {
      opacity: Math.abs(translateY.value / MAX_TRANSLATE_Y),
    };
  });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 3) {
        translateY.value = withSpring(0, { damping: 50 }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
    } else {
      translateY.value = withSpring(0, { damping: 50 });
    }
  }, [visible]);

  const handleCreateGame = () => {
    onClose();
    setTimeout(() => {
      router.push({
        pathname: '/lobby',
        params: {
          playerCount,
          mafiaCount,
          useDetectives 
        }
      });
    }, 100);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, blurIntensity]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      </Animated.View>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
          <FloatingCard style={styles.content}>
            {/* Handle bar */}
            <View style={styles.handleBar} />
            
            <Typography 
              variant="title" 
              weight="bold" 
              style={styles.title}
            >
              Game Setup
            </Typography>

            {/* Game Options */}
            <View style={styles.optionsContainer}>
              {/* Player Count */}
              <View style={styles.option}>
                <View style={styles.optionHeader}>
                  <Image source={faceEmoji} style={styles.optionIcon} />
                  <Typography variant="caption" style={styles.optionLabel}>
                    Players
                  </Typography>
                </View>
                <View style={styles.counter}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setPlayerCount(Math.max(5, playerCount - 1))}
                  >
                    <Typography style={styles.counterText}>-</Typography>
                  </TouchableOpacity>
                  <Typography style={styles.counterValue}>{playerCount}</Typography>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setPlayerCount(Math.min(16, playerCount + 1))}
                  >
                    <Typography style={styles.counterText}>+</Typography>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Mafia Count */}
              <View style={styles.option}>
                <View style={styles.optionHeader}>
                  <Image source={ninjaEmoji} style={styles.optionIcon} />
                  <Typography variant="caption" style={styles.optionLabel}>
                    Mafia
                  </Typography>
                </View>
                <View style={styles.counter}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setMafiaCount(Math.max(1, mafiaCount - 1))}
                  >
                    <Typography style={styles.counterText}>-</Typography>
                  </TouchableOpacity>
                  <Typography style={styles.counterValue}>{mafiaCount}</Typography>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setMafiaCount(Math.min(4, mafiaCount + 1))}
                  >
                    <Typography style={styles.counterText}>+</Typography>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Detective Toggle */}
              <TouchableOpacity 
                style={[styles.option, styles.toggleOption]} 
                onPress={() => setUseDetectives(!useDetectives)}
              >
                <View style={styles.optionHeader}>
                  <Image source={detectiveEmoji} style={styles.optionIcon} />
                  <Typography variant="caption" style={styles.optionLabel}>
                    Detectives
                  </Typography>
                </View>
                <Image 
                  source={checkMarkEmoji} 
                  style={[
                    styles.checkIcon,
                    !useDetectives && styles.checkIconInactive
                  ]} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
              >
                <Typography 
                  variant="label" 
                  weight="bold"
                  style={styles.buttonText}
                >
                  Cancel
                </Typography>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.createButton]}
                onPress={handleCreateGame}
              >
                <Typography 
                  variant="label"
                  weight="bold" 
                  style={styles.buttonText}
                >
                  Create Game
                </Typography>
              </TouchableOpacity>
            </View>
          </FloatingCard>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    height: SCREEN_HEIGHT * 0.75,
    width: '100%',
    position: 'absolute',
    top: SCREEN_HEIGHT,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 2,
    opacity: 0.3,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2C2C2E',
  },
  createButton: {
    backgroundColor: '#FF3131',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '400',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  option: {
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    padding: 16,
    borderRadius: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  optionIcon: {
    width: 24,
    height: 24,
  },
  optionLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 12,
    padding: 8,
  },
  counterButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  counterValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  checkIcon: {
    width: 32,
    height: 32,
    opacity: 1,
    marginRight: 13,
  },
  checkIconInactive: {
    opacity: 0.3,
  },
}); 