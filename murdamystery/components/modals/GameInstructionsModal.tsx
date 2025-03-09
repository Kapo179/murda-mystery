import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '../Typography';
import Animated, { 
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';

// Import emoji assets
const ninjaEmoji = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const detectiveEmoji = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');
const cameraEmoji = require('@/assets/images/emojis/assets/Camera/3D/camera_3d.png');
const locationEmoji = require('@/assets/images/emojis/assets/Round pushpin/3D/round_pushpin_3d.png');
const meetingEmoji = require('@/assets/images/emojis/assets/Loudspeaker/3D/loudspeaker_3d.png');
const ghostEmoji = require('@/assets/images/emojis/assets/Ghost/3D/ghost_3d.png');
const stopEmoji = require('@/assets/images/emojis/assets/Prohibited/3D/prohibited_3d.png');

interface GameInstructionsModalProps {
  visible: boolean;
  onClose: () => void;
  onStartSetup: () => void;
}

export function GameInstructionsModal({ visible, onClose, onStartSetup }: GameInstructionsModalProps) {
  const handleContinue = () => {
    // Close this modal first to prevent gesture conflicts
    onClose();
    // Small delay to ensure the modal is properly closed before opening the sheet
    setTimeout(() => {
      onStartSetup();
    }, 100);
  };

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
              How To Play
            </Typography>

            {/* Role Instructions */}
            <View style={styles.section}>
              <View style={styles.instruction}>
                <Image source={ninjaEmoji} style={styles.emoji} />
                <Typography style={styles.text}>
                  Catch the Mafia before they win
                </Typography>
              </View>
            </View>

            {/* Game Mechanics */}
            <View style={styles.section}>
              <View style={styles.instruction}>
                <Image source={meetingEmoji} style={styles.emoji} />
                <Typography style={styles.text}>
                  Each player gets 1 emergency meeting
                </Typography>
              </View>

              <View style={styles.instruction}>
                <Image source={ghostEmoji} style={styles.emoji} />
                <Typography style={styles.text}>
                  Dead players can't join meetings
                </Typography>
              </View>
            </View>

            {/* Evidence System */}
            <View style={styles.section}>
              <View style={styles.instruction}>
                <Image source={cameraEmoji} style={styles.emoji} />
                <Typography style={styles.text}>
                  Mafia must photograph their victims
                </Typography>
              </View>

              <View style={styles.instruction}>
                <Image source={cameraEmoji} style={styles.emoji} />
                <Typography style={styles.text}>
                  Civilians can photograph suspects
                </Typography>
              </View>
            </View>

            {/* Do Not Lie Instruction */}
            <View style={styles.section}>
              <View style={styles.instruction}>
                <Image source={stopEmoji} style={styles.emoji} />
                <Typography style={styles.text}>
                  Do Not Lie or Deceive
                </Typography>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={handleContinue}
            >
              <Typography variant="label" weight="bold" style={styles.buttonText}>
                Continue
              </Typography>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  section: {
    gap: 16,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
  },
  emoji: {
    width: 32,
    height: 32,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    flex: 1,
  },
  button: {
    backgroundColor: '#FF3131',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
}); 