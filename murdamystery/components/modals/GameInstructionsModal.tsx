import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  useWindowDimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EMOJI_PATHS } from '@/constants/AssetPaths';

interface GameInstructionsModalProps {
  visible: boolean;
  onClose: () => void;
  onStartSetup: () => void;
}

export function GameInstructionsModal({ 
  visible, 
  onClose,
  onStartSetup 
}: GameInstructionsModalProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const backgroundColor = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
  const modalBgColor = isDark ? '#1A1A1A' : '#FFFFFF';
  
  // Calculate modal dimensions based on screen size
  const modalWidth = Math.min(width * 0.9, 500);
  const modalHeight = Math.min(height * 0.8, 700);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={95}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.blurContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom }
        ]}
      >
        <View 
          style={[
            styles.modalContainer, 
            { 
              backgroundColor: modalBgColor,
              width: modalWidth,
              maxHeight: modalHeight
            }
          ]}
        >
          {/* Modal Header */}
          <View style={styles.headerContainer}>
            <Text style={[styles.headerText, { color: textColor }]}>
              Game Instructions
            </Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: textColor }]}>×</Text>
            </TouchableOpacity>
          </View>
          
          {/* Modal Content */}
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Role Instructions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Role Instructions
              </Text>
              
              <View style={styles.instructionItem}>
                <Image 
                  source={{ uri: EMOJI_PATHS.SKULL }}
                  style={styles.emoji}
                  resizeMode="contain"
                />
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: textColor }]}>
                    Murderer
                  </Text>
                  <Text style={[styles.instructionDescription, { color: isDark ? '#CCCCCC' : '#555555' }]}>
                    Your goal is to eliminate all players without being caught.
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Image 
                  source={{ uri: EMOJI_PATHS.SLEUTH }}
                  style={styles.emoji}
                  resizeMode="contain"
                />
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: textColor }]}>
                    Detective
                  </Text>
                  <Text style={[styles.instructionDescription, { color: isDark ? '#CCCCCC' : '#555555' }]}>
                    Find evidence and identify the murderer before it's too late.
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Image 
                  source={{ uri: EMOJI_PATHS.GHOST }}
                  style={styles.emoji}
                  resizeMode="contain"
                />
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: textColor }]}>
                    Civilian
                  </Text>
                  <Text style={[styles.instructionDescription, { color: isDark ? '#CCCCCC' : '#555555' }]}>
                    Stay alive and help the detectives identify the murderer.
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Game Mechanics */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Game Mechanics
              </Text>
              
              <View style={styles.instructionItem}>
                <Image 
                  source={{ uri: EMOJI_PATHS.KNIFE }}
                  style={styles.emoji}
                  resizeMode="contain"
                />
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: textColor }]}>
                    Proximity Kills
                  </Text>
                  <Text style={[styles.instructionDescription, { color: isDark ? '#CCCCCC' : '#555555' }]}>
                    Murderers must be near their victims to eliminate them.
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Image 
                  source={{ uri: EMOJI_PATHS.MAGNIFIER }}
                  style={styles.emoji}
                  resizeMode="contain"
                />
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: textColor }]}>
                    Evidence Collection
                  </Text>
                  <Text style={[styles.instructionDescription, { color: isDark ? '#CCCCCC' : '#555555' }]}>
                    Detectives can collect evidence when near a crime scene.
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Image 
                  source={{ uri: EMOJI_PATHS.PROHIBITED }}
                  style={styles.emoji}
                  resizeMode="contain"
                />
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: textColor }]}>
                    Do not lie about your role
                  </Text>
                  <Text style={[styles.instructionDescription, { color: isDark ? '#CCCCCC' : '#555555' }]}>
                    Players must be honest about their assigned role during gameplay.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
          
          {/* Continue button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onStartSetup}
            >
              <Text style={styles.continueButtonText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 500,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  emoji: {
    width: 36,
    height: 36,
    marginRight: 16,
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.3)',
  },
  continueButton: {
    backgroundColor: '#FF5E3A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 