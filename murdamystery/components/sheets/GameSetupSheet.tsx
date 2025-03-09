import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal,
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
  Easing
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

// Import role emoji assets
const mafiaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const civilianEmoji = require('@/assets/images/emojis/assets/Beaming face with smiling eyes/3D/beaming_face_with_smiling_eyes_3d.png');
const keyEmoji = require('@/assets/images/emojis/assets/Key/3D/key_3d.png');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 100; // Pixels to drag down before dismissing

interface GameSetupSheetProps {
  visible: boolean;
  onClose: () => void;
}

type SetupMode = 'host' | 'join';

// Animation configuration
const SPRING_CONFIG = {
  damping: 20,
  mass: 1,
  stiffness: 100,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export function GameSetupSheet({ 
  visible, 
  onClose 
}: GameSetupSheetProps) {
  // State for animations
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(visible);
  
  // Update local visibility state when prop changes
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Smooth entry animation with spring physics for natural bounce
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      translateY.value = withSpring(0, SPRING_CONFIG);
    } else {
      // Smooth exit animation
      opacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) });
      translateY.value = withTiming(SCREEN_HEIGHT, { 
        duration: 300, 
        easing: Easing.out(Easing.cubic) 
      }, () => {
        runOnJS(setIsVisible)(false);
      });
    }
  }, [visible]);
  
  // Mode selection (host or join)
  const [mode, setMode] = useState<SetupMode>('host');
  
  // Host mode state
  const [mafiaCount, setMafiaCount] = useState(2);
  const [civilianCount, setCivilianCount] = useState(6);
  
  // Join mode state
  const [gameCode, setGameCode] = useState('');
  
  const handleCreateGame = () => {
    console.log('Creating game with:', { 
      mafiaCount, 
      civilianCount
    });
    onClose();
  };
  
  const handleJoinGame = () => {
    console.log('Joining game with code:', gameCode);
    onClose();
  };
  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  // Fix the TypeScript error with proper typing
  type AnimatedGestureContext = {
    startY: number;
  };
  
  // Gesture handler for pan gesture
  const gestureHandler = useAnimatedGestureHandler<any, AnimatedGestureContext>({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      if (event.translationY > 0) { // Only allow dragging down
        translateY.value = ctx.startY + event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > DISMISS_THRESHOLD) {
        // Dismiss the sheet if dragged down past threshold with timing function
        translateY.value = withTiming(SCREEN_HEIGHT, { 
          duration: 300, 
          easing: Easing.out(Easing.cubic) 
        });
        opacity.value = withTiming(0, { 
          duration: 250, 
          easing: Easing.out(Easing.quad) 
        });
        runOnJS(onClose)();
      } else {
        // Snap back to position with spring physics for bounce effect
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    },
  });

  // Animated styles for the sheet
  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      // Add shadow that increases with elevation
      shadowOpacity: interpolate(
        translateY.value,
        [0, SCREEN_HEIGHT * 0.2],
        [0.2, 0],
        Extrapolate.CLAMP
      ),
    };
  });
  
  // Animated styles for the backdrop - fade based on sheet position
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  
  // Scale animation for buttons on press
  const getButtonAnimatedStyle = (isPressed: boolean) => {
    return {
      transform: [{ scale: isPressed ? 0.97 : 1 }],
      opacity: isPressed ? 0.9 : 1,
    };
  };

  // If not visible based on local state, don't render anything
  if (!isVisible) return null;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={StyleSheet.absoluteFill}>
          <Animated.View 
            style={[StyleSheet.absoluteFill, backdropAnimatedStyle]}
          >
            <BlurView 
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            >
              <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
              >
                <PanGestureHandler onGestureEvent={gestureHandler}>
                  <Animated.View
                    style={[styles.sheetContainer, sheetAnimatedStyle]}
                  >
                    {/* Gray drag indicator at top of sheet */}
                    <View style={styles.dragIndicatorContainer}>
                      <View style={styles.dragIndicator} />
                    </View>
                    
                    {/* Prevent touches from propagating through the sheet */}
                    <TouchableOpacity 
                      activeOpacity={1} 
                      style={styles.sheet}
                      onPress={(e) => e.stopPropagation()}
                    >
                      {/* Mode Selector */}
                      <View style={styles.modeSelector}>
                        <TouchableOpacity
                          style={[
                            styles.modeButton,
                            mode === 'host' && styles.modeButtonActive
                          ]}
                          onPress={() => setMode('host')}
                        >
                          <Text style={[
                            styles.modeButtonText,
                            mode === 'host' && styles.modeButtonTextActive
                          ]}>Host</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[
                            styles.modeButton,
                            mode === 'join' && styles.modeButtonActive
                          ]}
                          onPress={() => setMode('join')}
                        >
                          <Text style={[
                            styles.modeButtonText,
                            mode === 'join' && styles.modeButtonTextActive
                          ]}>Join</Text>
                        </TouchableOpacity>
                      </View>
                      
                      {/* Host Mode Content */}
                      {mode === 'host' && (
                        <>
                          {/* Mafia Count Selector */}
                          <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                              <Image source={mafiaEmoji} style={styles.roleEmoji} />
                              <Text style={styles.sectionTitle}>Mafia</Text>
                            </View>
                            
                            <View style={styles.counterContainer}>
                              <TouchableOpacity 
                                style={styles.counterButton}
                                onPress={() => setMafiaCount(Math.max(1, mafiaCount - 1))}
                              >
                                <Text style={styles.counterButtonText}>-</Text>
                              </TouchableOpacity>
                              
                              <Text style={styles.counterValue}>{mafiaCount}</Text>
                              
                              <TouchableOpacity 
                                style={styles.counterButton}
                                onPress={() => setMafiaCount(Math.min(5, mafiaCount + 1))}
                              >
                                <Text style={styles.counterButtonText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          {/* Civilian Count Selector */}
                          <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                              <Image source={civilianEmoji} style={styles.roleEmoji} />
                              <Text style={styles.sectionTitle}>Civilians</Text>
                            </View>
                            
                            <View style={styles.counterContainer}>
                              <TouchableOpacity 
                                style={styles.counterButton}
                                onPress={() => setCivilianCount(Math.max(3, civilianCount - 1))}
                              >
                                <Text style={styles.counterButtonText}>-</Text>
                              </TouchableOpacity>
                              
                              <Text style={styles.counterValue}>{civilianCount}</Text>
                              
                              <TouchableOpacity 
                                style={styles.counterButton}
                                onPress={() => setCivilianCount(Math.min(14, civilianCount + 1))}
                              >
                                <Text style={styles.counterButtonText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          {/* Total Players Info */}
                          <View style={styles.totalPlayersContainer}>
                            <Text style={styles.totalPlayersText}>
                              Total: {mafiaCount + civilianCount} players
                            </Text>
                          </View>
                          
                          {/* Host Action Buttons */}
                          <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                              style={styles.cancelButton}
                              onPress={onClose}
                              activeOpacity={0.9}
                            >
                              <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={styles.createButton}
                              onPress={handleCreateGame}
                              activeOpacity={0.9}
                            >
                              <Text style={styles.createButtonText}>Create Game</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                      
                      {/* Join Mode Content */}
                      {mode === 'join' && (
                        <>
                          {/* Game Code Input */}
                          <View style={styles.joinSection}>
                            <View style={styles.sectionHeader}>
                              <Image source={keyEmoji} style={styles.roleEmoji} />
                              <Text style={styles.sectionTitle}>Game Code</Text>
                            </View>
                            
                            <View style={styles.inputContainer}>
                              <TextInput
                                style={styles.input}
                                placeholder="Enter game code"
                                placeholderTextColor="#999999"
                                value={gameCode}
                                onChangeText={setGameCode}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                maxLength={6}
                              />
                            </View>
                            
                            <Text style={styles.joinInfo}>
                              Ask the host for the game code to join.
                            </Text>
                          </View>
                          
                          {/* Join Action Buttons */}
                          <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                              style={styles.cancelButton}
                              onPress={onClose}
                              activeOpacity={0.9}
                            >
                              <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={[
                                styles.createButton,
                                !gameCode.trim() && styles.disabledButton
                              ]}
                              onPress={handleJoinGame}
                              disabled={!gameCode.trim()}
                              activeOpacity={0.9}
                            >
                              <Text style={styles.createButtonText}>Join Game</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </PanGestureHandler>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#1C1C1E',
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
  },
  dragIndicatorContainer: {
    width: '100%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragIndicator: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sheet: {
    padding: 24,
    paddingBottom: 40, // Extra bottom padding for safety
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  modeButtonActive: {
    backgroundColor: '#FF544E',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AAAAAA',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleEmoji: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    width: 40,
    textAlign: 'center',
  },
  totalPlayersContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  totalPlayersText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  joinSection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 2,
  },
  joinInfo: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FF544E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 49, 49, 0.5)',
  },
}); 