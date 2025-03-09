import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Video } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useKillCam } from '@/hooks/useKillCam';
import { useColorScheme } from '@/hooks/useColorScheme';

interface KillCamRecorderProps {
  gameId: string;
  victimId: string;
  onSaveSuccess?: (killCamId: string) => void;
  onCancel?: () => void;
}

export const KillCamRecorder: React.FC<KillCamRecorderProps> = ({
  gameId,
  victimId,
  onSaveSuccess,
  onCancel,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  
  const {
    cameraRef,
    videoRef,
    isRecording,
    recordingProgress,
    isUploading,
    uploadProgress,
    currentRecording,
    startRecording,
    stopRecording,
    uploadRecording,
    error,
    clearError,
    hasCameraPermission,
    requestPermissions,
  } = useKillCam({
    maxDuration: 8, // 8 seconds max
    autoUpload: false, // Manual upload for better UX control
  });
  
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [hasRecorded, setHasRecorded] = useState(false);
  
  // Get screen dimensions
  const { width } = Dimensions.get('window');
  
  // Animated values for UI
  const recordingAnimation = useSharedValue(0);
  const uploadingScale = useSharedValue(1);
  
  // Update recording animation
  useEffect(() => {
    if (isRecording) {
      recordingAnimation.value = withTiming(recordingProgress / 100, {
        duration: 100,
        easing: Easing.linear,
      });
    } else {
      recordingAnimation.value = 0;
    }
  }, [isRecording, recordingProgress]);
  
  // Pulse animation for uploading
  useEffect(() => {
    if (isUploading) {
      const pulseAnimation = () => {
        uploadingScale.value = withTiming(1.2, { duration: 600 }, () => {
          uploadingScale.value = withTiming(1, { duration: 600 }, pulseAnimation);
        });
      };
      pulseAnimation();
    } else {
      uploadingScale.value = 1;
    }
  }, [isUploading]);
  
  // Error handling
  useEffect(() => {
    if (error) {
      Alert.alert('KillCam Error', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [error, clearError]);
  
  // Request camera permissions if needed
  useEffect(() => {
    if (hasCameraPermission === false) {
      Alert.alert(
        'Camera Permission',
        'We need camera access to record KillCams',
        [
          { text: 'Cancel', onPress: onCancel, style: 'cancel' },
          { text: 'Grant Access', onPress: requestPermissions },
        ]
      );
    }
  }, [hasCameraPermission]);
  
  // Start recording
  const handleStartRecording = async () => {
    await startRecording(gameId, victimId);
  };
  
  // Stop recording
  const handleStopRecording = async () => {
    await stopRecording();
    setHasRecorded(true);
  };
  
  // Upload the recording
  const handleUpload = async () => {
    if (!currentRecording) return;
    
    const killCamId = await uploadRecording(currentRecording);
    
    if (killCamId && onSaveSuccess) {
      onSaveSuccess(killCamId);
    }
  };
  
  // Discard the recording
  const handleDiscard = () => {
    Alert.alert(
      'Discard Recording',
      'Are you sure you want to discard this KillCam?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setHasRecorded(false);
          },
        },
      ]
    );
  };
  
  // Toggle camera type (front/back)
  const toggleCameraType = () => {
    setCameraType(current =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };
  
  // Animated styles
  const progressStyle = useAnimatedStyle(() => ({
    width: `${recordingAnimation.value * 100}%`,
  }));
  
  const uploadingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: uploadingScale.value }],
  }));
  
  // If we don't have camera permission yet
  if (hasCameraPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f0f0f0' }]}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }
  
  // If camera permission was denied
  if (hasCameraPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f0f0f0' }]}>
        <MaterialIcons name="no-photography" size={48} color={isDark ? '#fff' : '#000'} />
        <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>
          Camera access denied
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={requestPermissions}
        >
          <Text style={styles.buttonText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {!hasRecorded ? (
        // Camera view for recording
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          ratio="16:9"
        >
          {/* Camera overlay UI */}
          <View style={styles.cameraOverlay}>
            {/* Top controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.cameraTypeButton}
                onPress={toggleCameraType}
                disabled={isRecording}
              >
                <Ionicons
                  name="camera-reverse"
                  size={24}
                  color="#fff"
                  style={{ opacity: isRecording ? 0.5 : 1 }}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
                disabled={isRecording}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#fff"
                  style={{ opacity: isRecording ? 0.5 : 1 }}
                />
              </TouchableOpacity>
            </View>
            
            {/* Recording progress bar */}
            {isRecording && (
              <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, progressStyle]} />
              </View>
            )}
            
            {/* Bottom controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.recordingText}>
                {isRecording ? 'Recording KillCam...' : 'Press to Record'}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  { backgroundColor: isRecording ? '#ff0000' : '#fff' },
                ]}
                onPress={isRecording ? handleStopRecording : handleStartRecording}
              >
                {isRecording ? (
                  <View style={styles.stopIcon} />
                ) : (
                  <View style={styles.recordIcon} />
                )}
              </TouchableOpacity>
              
              <Text style={styles.instructionText}>
                {isRecording
                  ? 'Tap to stop recording'
                  : 'Record the moment of your kill'}
              </Text>
            </View>
          </View>
        </Camera>
      ) : (
        // Video preview after recording
        <View style={styles.previewContainer}>
          <Video
            ref={videoRef}
            style={styles.previewVideo}
            source={{ uri: currentRecording?.uri || '' }}
            resizeMode="cover"
            isLooping
            shouldPlay
            useNativeControls
          />
          
          {/* Preview overlay UI */}
          <View style={styles.previewOverlay}>
            {/* Top controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleDiscard}
                disabled={isUploading}
              >
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color="#fff"
                  style={{ opacity: isUploading ? 0.5 : 1 }}
                />
              </TouchableOpacity>
            </View>
            
            {/* Upload progress bar */}
            {isUploading && (
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    { width: `${uploadProgress}%`, backgroundColor: '#4caf50' },
                  ]}
                />
              </View>
            )}
            
            {/* Bottom controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={[styles.uploadButton, { opacity: isUploading ? 0.7 : 1 }]}
                onPress={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Animated.View style={uploadingStyle}>
                    <ActivityIndicator size="small" color="#fff" />
                  </Animated.View>
                ) : (
                  <>
                    <MaterialCommunityIcons name="upload" size={22} color="#fff" />
                    <Text style={styles.uploadText}>Save KillCam</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <Text style={styles.instructionText}>
                {isUploading
                  ? 'Uploading your KillCam...'
                  : 'Review your KillCam before saving'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    width: '100%',
  },
  cameraTypeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ff0000',
  },
  bottomControls: {
    alignItems: 'center',
    padding: 30,
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#ff0000',
    borderRadius: 4,
  },
  recordIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#ff0000',
    borderRadius: 12,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  previewContainer: {
    flex: 1,
    width: '100%',
  },
  previewVideo: {
    flex: 1,
    width: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    minWidth: 160,
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
}); 