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
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions } from 'expo-camera';
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
  const [isRecordingLocked, setIsRecordingLocked] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  
  const cameraRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  
  // New animated values for the shutter button
  const shutterScale = useRef(new Animated.Value(1)).current;
  const recordButtonX = useRef(new Animated.Value(0)).current;
  const lockIndicatorOpacity = useRef(new Animated.Value(0)).current;
  
  // Screen dimensions
  const { width: screenWidth } = Dimensions.get('window');
  const LOCK_SLIDE_THRESHOLD = 80; // pixels to slide to lock recording
  
  // Setup PanResponder for the shutter button
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        console.log('Shutter button pressed');
        // Start the long press timer
        if (shotsRemaining <= 0) return;
        
        setLongPressTriggered(false);
        
        // Animate button scale down slightly to provide visual feedback
        Animated.timing(shutterScale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        // After a delay, transition to video recording if still pressed
        setTimeout(() => {
          if (shotsRemaining <= 0) return;
          
          // Only trigger if finger is still down and not already recording
          if (!isRecording && !isCapturing) {
            console.log('Long press detected - starting recording');
            setLongPressTriggered(true);
            
            // Provide haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            // Show lock indicator
            Animated.timing(lockIndicatorOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
            
            // Start video recording
            startVideoRecording();
          }
        }, 500); // 500ms for long press
      },
      
      onPanResponderMove: (_, gestureState) => {
        // Only handle horizontal movement if we're recording
        if (isRecording && !isRecordingLocked) {
          // Update position with bounds (don't let it go left of origin)
          const newX = Math.max(0, gestureState.dx);
          recordButtonX.setValue(newX);
          
          // Check if we should lock recording
          if (newX > LOCK_SLIDE_THRESHOLD) {
            setIsRecordingLocked(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            
            // Animate to final "locked" position
            Animated.spring(recordButtonX, {
              toValue: LOCK_SLIDE_THRESHOLD + 10,
              useNativeDriver: true,
              friction: 7,
            }).start();
            
            // Hide the lock indicator
            Animated.timing(lockIndicatorOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        }
      },
      
      onPanResponderRelease: () => {
        console.log('Shutter button released');
        
        // Reset button scale
        Animated.timing(shutterScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        // Hide lock indicator
        Animated.timing(lockIndicatorOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        // Reset button position if not locked
        if (!isRecordingLocked) {
          Animated.spring(recordButtonX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
        
        // If we were recording but not locked, stop recording
        if (isRecording && !isRecordingLocked) {
          stopVideoRecording();
        }
        
        // If it was a short tap (not a long press) and not already capturing, take a photo
        if (!longPressTriggered && !isCapturing && !isRecording && shotsRemaining > 0) {
          startPhotoCapture();
        }
      },
      
      onPanResponderTerminate: () => {
        // Similar cleanup to release
        Animated.timing(shutterScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        Animated.timing(lockIndicatorOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        if (!isRecordingLocked) {
          Animated.spring(recordButtonX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          
          if (isRecording) {
            stopVideoRecording();
          }
        }
      }
    })
  ).current;
  
  // Animation for the flash effect
  const flashScreen = () => {
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
  };

  // Toggle between photo and video mode
  const toggleCameraMode = () => {
    setIsVideoMode(!isVideoMode);
  };

  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Start photo capture with countdown
  const startPhotoCapture = () => {
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
  };

  // Get appropriate role badge
  const getRoleBadge = () => {
    switch (role) {
      case 'mafia':
        return mafiaBadge;
      case 'detective':
        return detectiveBadge;
      default:
        return civilianBadge;
    }
  };

  // Handle permission request
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

  function toggleCameraFacing() {
    if (isRecording) return; // Don't allow camera switching while recording
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing || shotsRemaining <= 0) return;
    
    try {
      flashScreen();
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: Platform.OS === 'android',
      });
      
      console.log('Photo taken:', photo.uri);
      setLatestPhoto(photo.uri);
      setShotsRemaining(prev => prev - 1);
      setIsCapturing(false);
      onPhotoTaken(photo.uri);
      
      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error taking picture:', error);
      setIsCapturing(false);
      onPhotoTaken('');
      
      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const startVideoRecording = async () => {
    if (!cameraRef.current || isRecording || shotsRemaining <= 0) return;
    
    try {
      console.log('Starting video recording...');
      setIsRecording(true);
      
      // Start recording timer
      let seconds = 0;
      const timer = setInterval(() => {
        seconds += 1;
        setRecordingDuration(seconds);
        
        // Auto-stop after 30 seconds to prevent massive files
        if (seconds >= 30) {
          stopVideoRecording();
        }
      }, 1000);
      
      setRecordingTimer(timer);
      
      // Vibrate to indicate recording start
      if (Platform.OS === 'android') {
        Vibration.vibrate(200);
      }
      
      await cameraRef.current.recordAsync({
        quality: '720p',
        maxDuration: 30,
        mute: false,
      }).then(video => {
        console.log('Video recording complete:', video.uri);
        setLatestPhoto(video.uri); // Use the same preview for videos
        setShotsRemaining(prev => prev - 1);
        clearInterval(recordingTimer);
        setRecordingTimer(null);
        setRecordingDuration(0);
        setIsRecording(false);
        setIsRecordingLocked(false);
        onPhotoTaken(video.uri, true);
        
        // Reset animation values
        recordButtonX.setValue(0);
        
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      });
    } catch (error) {
      console.error('Error recording video:', error);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      setRecordingDuration(0);
      setIsRecording(false);
      setIsRecordingLocked(false);
      
      // Reset animation values
      recordButtonX.setValue(0);
      
      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const stopVideoRecording = async () => {
    if (!cameraRef.current || !isRecording) return;
    
    try {
      console.log('Stopping video recording...');
      await cameraRef.current.stopRecording();
      
      // Vibrate to indicate recording stop
      if (Platform.OS === 'android') {
        Vibration.vibrate(100);
      }
    } catch (error) {
      console.error('Error stopping video recording:', error);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      setRecordingDuration(0);
      setIsRecording(false);
      setIsRecordingLocked(false);
    }
  };

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
              {isRecordingLocked && (
                <View style={styles.lockedBadge}>
                  <Typography style={styles.lockedText}>LOCKED</Typography>
                </View>
              )}
            </View>
          )}
          
          {/* Bottom controls area */}
          <View style={styles.bottomControls}>
            {/* Shots remaining indicator */}
            <View style={styles.infoContainer}>
              <Typography style={styles.shotsText}>
                {shotsRemaining} {shotsRemaining === 1 ? 'Shot' : 'Shots'} Left
              </Typography>
              <Typography style={styles.hintText}>
                {isRecording 
                  ? isRecordingLocked 
                    ? 'Tap to end recording' 
                    : 'Slide right to lock recording'
                  : 'Tap for photo, hold for video'}
              </Typography>
            </View>
            
            {/* Enhanced Shutter Button with PanResponder */}
            <View style={styles.shutterContainer}>
              {/* Slide-to-lock indicator */}
              <Animated.View style={[
                styles.lockIndicator,
                { opacity: lockIndicatorOpacity }
              ]}>
                <Image 
                  source={require('@/assets/images/emojis/assets/Right arrow/3D/right_arrow_3d.png')} 
                  style={styles.lockArrow} 
                />
                <Typography style={styles.lockText}>SLIDE TO LOCK</Typography>
              </Animated.View>
              
              {/* The actual shutter button */}
              <Animated.View 
                style={[
                  styles.shutterTouchArea,
                  { 
                    transform: [
                      { translateX: recordButtonX },
                      { scale: shutterScale }
                    ] 
                  }
                ]}
                {...panResponder.panHandlers}
              >
                {isRecording ? (
                  <View style={[
                    styles.recordingShutterButton,
                    isRecordingLocked && styles.recordingLockedButton
                  ]}>
                    <View style={styles.recordingButtonInner} />
                  </View>
                ) : (
                  <View style={styles.shutterButton}>
                    {countdown > 0 ? (
                      <Text style={styles.countdownText}>{countdown}</Text>
                    ) : (
                      <View style={styles.shutterButtonInner} />
                    )}
                  </View>
                )}
              </Animated.View>
            </View>
            
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
            disabled={isRecording && !isRecordingLocked}
          >
            <Image source={closeIcon} style={[
              styles.closeIcon,
              (isRecording && !isRecordingLocked) && styles.disabledIcon
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
  recordingLockedButton: {
    borderColor: '#FF7B30',
    backgroundColor: 'rgba(255, 123, 48, 0.2)',
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  lockIndicator: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: -120,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 1,
  },
  lockArrow: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  lockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockedBadge: {
    backgroundColor: '#FF7B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  lockedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
}); 