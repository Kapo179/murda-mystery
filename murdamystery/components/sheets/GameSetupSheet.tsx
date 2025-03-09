import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal,
  Image,
  ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  SlideInUp, 
  SlideOutDown,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';

// Import role emoji assets
const mafiaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const detectiveEmoji = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');

interface GameSetupSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function GameSetupSheet({ 
  visible, 
  onClose 
}: GameSetupSheetProps) {
  // State for game setup
  const [mafiaCount, setMafiaCount] = useState(2);
  const [detectiveEnabled, setDetectiveEnabled] = useState(true);
  
  const handleCreateGame = () => {
    console.log('Creating game with:', { 
      mafiaCount, 
      detectiveEnabled 
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={StyleSheet.absoluteFill}
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
            <Animated.View
              entering={SlideInUp.springify().damping(15)}
              exiting={SlideOutDown.springify().damping(15)}
              style={styles.sheetContainer}
            >
              {/* Prevent touches from propagating through the sheet */}
              <TouchableOpacity 
                activeOpacity={1} 
                style={styles.sheet}
                onPress={(e) => e.stopPropagation()}
              >
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
                
                {/* Detective Toggle */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Image source={detectiveEmoji} style={styles.roleEmoji} />
                    <Text style={styles.sectionTitle}>Detectives</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      detectiveEnabled && styles.toggleButtonActive
                    ]}
                    onPress={() => setDetectiveEnabled(!detectiveEnabled)}
                  >
                    {detectiveEnabled && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={handleCreateGame}
                  >
                    <Text style={styles.createButtonText}>Create Game</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40, // Extra bottom padding for safety
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
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4CFF00',
  },
  checkmark: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
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
    backgroundColor: '#FF3131',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 