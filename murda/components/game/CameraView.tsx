import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Image, 
  Animated, 
  PanResponder,
  Vibration,
  Dimensions,
  Platform 
} from 'react-native';
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import { Typography } from '@/components/Typography';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

// Import necessary assets
const closeIcon = require('@/assets/images/emojis/assets/Cross mark/3D/cross_mark_3d.png');
const flipIcon = require('@/assets/images/emojis/assets/Repeat button/3D/repeat_button_3d.png');
const mafiaBadge = require('@/assets/images/emojis/assets/Ninja/Default/3D/ninja_3d_default.png');
const detectiveBadge = require('@/assets/images/emojis/assets/Detective/Default/3D/detective_3d_default.png');
const civilianBadge = require('@/assets/images/emojis/assets/Face-without-mouth/3D/face_without_mouth_3d.png');
const killIcon = require('@/assets/images/emojis/assets/Skull and crossbones/3D/skull_and_crossbones_3d.png');
const evidenceIcon = require('@/assets/images/emojis/assets/Magnifying glass tilted left/3D/magnifying_glass_tilted_left_3d.png');
const videoIcon = require('@/assets/images/emojis/assets/Video camera/3D/video_camera_3d.png');
const photoIcon = require('@/assets/images/emojis/assets/Camera/3D/camera_3d.png');

interface CameraViewProps {
  photoType?: 'kill' | 'evidence';
  role?: string;
  onClose: () => void;
  onPhotoTaken: (uri: string, isVideo?: boolean) => void;
}

export function CameraView({ 
  photoType = 'evidence', 
  role = 'civilian', 
  onClose, 
  onPhotoTaken 
}: CameraViewProps) {
  // 1. STATE HOOKS - Group all useState hooks together
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [latestPhoto, setLatestPhoto] = useState<string | null>(null);
  const [shotsRemaining, setShotsRemaining] = useState(
    photoType === 'kill' ? 1 : 3
  );
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 2. REF HOOKS - Group all useRef hooks together
  const cameraRef = useRef<Camera | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shutterScale = useRef(new Animated.Value(1)).current;
  
  // 3. CONTEXT HOOKS
  const insets = useSafeAreaInsets();
  
  // 4. EFFECT HOOKS - Place all useEffect hooks together
  // Cleanup effect for unmounting
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      
      if (isRecording && cameraRef.current) {
        try {
          cameraRef.current.stopRecording();
        } catch (error) {
          console.error('Error stopping recording during unmount:', error);
        }
      }
    };
  }, [recordingTimer, isRecording]);
  
  // 5. Screen dimensions constants (not hooks)
  const { width: screenWidth } = Dimensions.get('window');
  const LOCK_SLIDE_THRESHOLD = 80; // pixels to slide to lock recording
  
  // 6. Function definitions remain the same
  function takePicture() {
    if (!cameraRef.current || isCapturing || shotsRemaining <= 0) return;
    
    try {
      flashScreen();
      cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: Platform.OS === 'android',
      }).then((photo) => {
        console.log('Photo taken:', photo.uri);
        setLatestPhoto(photo.uri);
        setShotsRemaining(prev => prev - 1);
        setIsCapturing(false);
        onPhotoTaken(photo.uri);
        
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      });
    } catch (error) {
      console.error('Error taking picture:', error);
      setIsCapturing(false);
      onPhotoTaken('');
      
      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function startVideoRecording() {
    if (!cameraRef.current || isRecording || shotsRemaining <= 0) return;
    
    console.log('Starting video recording...');
    
    // Set state first
    setIsRecording(true);
    
    try {
      // Start recording timer
      let seconds = 0;
      const timer = setInterval(() => {
        seconds += 1;
        setRecordingDuration(seconds);
        
        // Auto-stop after 30 seconds
        if (seconds >= 30) {
          if (isRecording) {
            stopVideoRecording();
          }
        }
      }, 1000);
      
      setRecordingTimer(timer);
      
      // Vibration - wrap in try/catch
      try {
        if (Platform.OS === 'android') {
          Vibration.vibrate(200);
        }
      } catch (vibrationError) {
        console.warn('Vibration error:', vibrationError);
        // Non-critical, continue without vibration
      }
      
      // Use simpler video recording settings
      const recordingOptions = {
        quality: Platform.OS === 'ios' ? '720p' : 'high',
        maxDuration: 30,
        mute: false,
      };
      
      console.log('Recording with options:', recordingOptions);
      
      cameraRef.current.recordAsync(recordingOptions)
        .then((video: { uri: string }) => {
          console.log('Video recording complete:', video.uri);
          
          // Clear timer
          if (recordingTimer) {
            clearInterval(recordingTimer);
          }
          
          // Update state
          setLatestPhoto(video.uri);
          setShotsRemaining(prev => prev - 1);
          setRecordingTimer(null);
          setRecordingDuration(0);
          setIsRecording(false);
          
          // Success haptic
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (hapticError) {
            console.warn('Haptic error:', hapticError);
          }
          
          // Notify parent
          onPhotoTaken(video.uri, true);
        })
        .catch((recordError) => {
          console.error('Recording error:', recordError);
          
          // Clean up on error
          if (recordingTimer) {
            clearInterval(recordingTimer);
          }
          
          setRecordingTimer(null);
          setRecordingDuration(0);
          setIsRecording(false);
        });
    } catch (outerError) {
      console.error('Fatal recording error:', outerError);
      
      // Reset all state
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      
      setRecordingTimer(null);
      setRecordingDuration(0);
      setIsRecording(false);
    }
  }

  function stopVideoRecording() {
    console.log('Stopping video recording...');
    
    if (!cameraRef.current || !isRecording) return;
    
    try {
      cameraRef.current.stopRecording();
      
      // Vibration feedback
      try {
        if (Platform.OS === 'android') {
          Vibration.vibrate(100);
        }
      } catch (vibrationError) {
        console.warn('Vibration error:', vibrationError);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    } finally {
      // Always clean up, even if there's an error
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      
      setRecordingTimer(null);
      setRecordingDuration(0);
      setIsRecording(false);
    }
  }

  function startPhotoCapture() {
    if (isCapturing || shotsRemaining <= 0) return;
    
    setIsCapturing(true);
    setCountdown(3);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            takePicture();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  
  function flashScreen() {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }
  
  function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  function toggleCameraFacing() {
    if (isRecording) return; // Don't allow camera switching while recording
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function getRoleBadge() {
    switch (role) {
      case 'mafia':
        return mafiaBadge;
      case 'detective':
        return detectiveBadge;
      default:
        return civilianBadge;
    }
  }

  // Replace PanResponder with a simpler button press handler
  function handleShutterPress() {
    if (shotsRemaining <= 0) return;
    
    if (isVideoMode) {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    } else {
      // Photo mode
      startPhotoCapture();
    }
  }

  // Toggle between photo and video modes
  function toggleCameraMode() {
    if (isRecording) return; // Don't allow mode switching while recording
    setIsVideoMode(!isVideoMode);
    
    // Provide haptic feedback on mode change
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  // 8. Permission checks and rendering logic
  if (!permission) {
    return <View style={styles.container} />;
  }
  
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <StatusBar style="light" />
        <Typography style={styles.permissionTitle}>Camera Access Required</Typography>
        <Typography style={styles.message}>
          We need camera access to take evidence and elimination photos.
        </Typography>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 9. Main render
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Camera */}
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        ratio="16:9"
        facing={facing}
        onMountError={(error) => {
          console.error('Camera mount error:', error);
          onClose();
        }}
      >
        {/* Content container with proper inset spacing */}
        <View style={{
          flex: 1,
          paddingTop: insets.top > 0 ? insets.top + 10 : 20,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          paddingLeft: insets.left > 0 ? insets.left : 10,
          paddingRight: insets.right > 0 ? insets.right : 10
        }}>
          {/* Role badge - move down from the top */}
          <View style={[styles.topBadgeContainer, { marginTop: 20 }]}>
            <BlurView intensity={30} tint="dark" style={styles.roleBadgeBlur}>
              <Image source={getRoleBadge()} style={styles.badgeIcon} />
              <Typography style={styles.badgeText}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Typography>
            </BlurView>
          </View>
          
          {/* Latest photo/video preview */}
          {latestPhoto && (
            <TouchableOpacity style={styles.previewContainer}>
              <Image source={{ uri: latestPhoto }} style={styles.previewImage} />
            </TouchableOpacity>
          )}
          
          {/* Recording indicator - position lower */}
          {isRecording && (
            <View style={[styles.recordingIndicator, { top: insets.top > 0 ? insets.top + 20 : 40 }]}>
              <View style={styles.recordingDot} />
              <Typography style={styles.recordingText}>
                {formatDuration(recordingDuration)}
              </Typography>
            </View>
          )}
          
          {/* Bottom controls area */}
          <View style={styles.bottomControls}>
            {/* Shots remaining indicator */}
            <View style={styles.infoContainer}>
              <Typography style={styles.shotsText}>
                {shotsRemaining} {shotsRemaining === 1 ? 'Shot' : 'Shots'} Left
              </Typography>
            </View>
            
            {/* Mode toggle tab above shutter */}
            <View style={styles.modeToggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.modeTab, 
                  !isVideoMode && styles.activeTab
                ]}
                onPress={() => toggleCameraMode()}
                disabled={isRecording}
              >
                <Image 
                  source={photoIcon} 
                  style={[
                    styles.modeIcon, 
                    !isVideoMode && styles.activeIcon,
                    isRecording && styles.disabledIcon
                  ]} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.modeTab, 
                  isVideoMode && styles.activeTab
                ]}
                onPress={() => toggleCameraMode()}
                disabled={isRecording}
              >
                <Image 
                  source={videoIcon} 
                  style={[
                    styles.modeIcon, 
                    isVideoMode && styles.activeIcon,
                    isRecording && styles.disabledIcon
                  ]} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Simplified Shutter Button */}
            <TouchableOpacity 
              style={[
                styles.shutterButton,
                isVideoMode && styles.videoShutterButton,
                isRecording && styles.recordingButton,
                shotsRemaining <= 0 && styles.disabledButton
              ]}
              onPress={handleShutterPress}
              disabled={shotsRemaining <= 0}
            >
              {isRecording ? (
                <View style={styles.stopButton} />
              ) : (
                <>
                  {countdown > 0 ? (
                    <Text style={styles.countdownText}>{countdown}</Text>
                  ) : (
                    <View style={[
                      styles.shutterButtonInner,
                      isVideoMode && styles.videoButtonInner
                    ]} />
                  )}
                </>
              )}
            </TouchableOpacity>
            
            {/* Camera flip button */}
            <TouchableOpacity 
              style={styles.flipButton} 
              onPress={toggleCameraFacing}
              disabled={isRecording}
            >
              <Image source={flipIcon} style={[
                styles.flipIcon,
                isRecording && styles.disabledIcon
              ]} />
            </TouchableOpacity>
          </View>
          
          {/* Photo type indicator - position with respect to safe area */}
          <View style={[styles.photoTypeIndicator, { top: insets.top > 0 ? insets.top + 10 : 20 }]}>
            <BlurView intensity={40} tint="dark" style={styles.photoTypeBlur}>
              <Image 
                source={photoType === 'kill' ? killIcon : evidenceIcon} 
                style={styles.indicatorIcon} 
              />
              <Typography style={styles.indicatorText}>
                {photoType === 'kill' ? 'KILL PHOTO' : 'EVIDENCE'}
              </Typography>
            </BlurView>
          </View>
          
          {/* Close button - position with respect to safe area */}
          <TouchableOpacity 
            style={[styles.closeButton, { top: insets.top > 0 ? insets.top + 10 : 20 }]}
            onPress={onClose}
            disabled={isRecording}
          >
            <Image source={closeIcon} style={[
              styles.closeIcon,
              isRecording && styles.disabledIcon
            ]} />
          </TouchableOpacity>
        </View>
        
        {/* Flash effect */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            styles.flash, 
            { opacity: fadeAnim }
          ]} 
        />
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  topBadgeContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  roleBadgeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    position: 'absolute',
    left: 20,
    top: 80,
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  infoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  shotsText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  shutterContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterTouchArea: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  shutterButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
  recordingShutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  flipButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
  flipIcon: {
    width: 30,
    height: 30,
  },
  disabledIcon: {
    opacity: 0.4,
  },
  photoTypeIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  photoTypeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  indicatorIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  flash: {
    backgroundColor: '#fff',
  },
  message: {
    textAlign: 'center',
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  permissionButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#4B9EF4',
    borderRadius: 12,
    width: '80%',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownText: {
    fontSize: 32, 
    fontWeight: 'bold',
    color: '#fff',
  },
  modeToggleContainer: {
    position: 'absolute',
    flexDirection: 'row',
    top: -40,
    left: '50%',
    marginLeft: -60,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 120,
    height: 36,
    overflow: 'hidden',
  },
  modeTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeIcon: {
    width: 20,
    height: 20,
    opacity: 0.7,
  },
  activeIcon: {
    opacity: 1,
  },
  videoShutterButton: {
    borderColor: '#FF3B30',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    borderColor: '#FF3B30',
  },
  stopButton: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    opacity: 0.4,
  },
  videoButtonInner: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
}); 