import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface CameraViewProps {
  photoType?: 'evidence' | 'kill';
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
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  
  // Reference to the camera - using any type to avoid issues
  const cameraRef = useRef<any>(null);

  // Take a picture
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: true 
      });
      console.log('Picture taken:', photo.uri);
      onPhotoTaken(photo.uri);
    } catch (error) {
      console.error('Failed to take picture:', error);
    }
  };

  // Start recording video - FIXED IMPLEMENTATION
  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      console.log('Starting video recording...');
      setIsRecording(true);
      
      // Use the correct recordAsync() method with proper options
      const videoData = await cameraRef.current.recordAsync({
        maxDuration: 15, // Limit recording to 15 seconds
        quality: '720p'  // Use 720p quality for good balance of quality and file size
      });
      
      console.log('Video recorded:', videoData.uri);
      onPhotoTaken(videoData.uri, true);
    } catch (error) {
      console.error('Failed to record video:', error);
      setIsRecording(false);
    }
  };

  // Stop recording video
  const stopRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      console.log('Stopping video recording...');
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
    }
  };

  // Handle capture button press based on mode
  const handleCapture = () => {
    if (isVideoMode) {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    } else {
      takePicture();
    }
  };

  // Toggle between photo and video modes
  const toggleCameraMode = () => {
    setIsVideoMode(!isVideoMode);
  };

  // Function to toggle camera between front and back
  const toggleCameraFacing = () => {
    setFacing(current => (
      current === 'back' ? 'front' : 'back'
    ));
  };

  // If permissions aren't determined yet, show loading
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Checking camera permissions...</Text>
      </View>
    );
  }

  // If permission denied, show request button
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main camera view with minimal UI - using ExpoCameraView instead of CameraView
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        video={true} // Enable video capability
      >
        {/* Mode toggle at the top */}
        <View style={styles.modeContainer}>
          <TouchableOpacity 
            style={[styles.modeButton, !isVideoMode && styles.activeModeButton]} 
            onPress={() => !isRecording && setIsVideoMode(false)}
            disabled={isRecording}
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, isVideoMode && styles.activeModeButton]} 
            onPress={() => !isRecording && setIsVideoMode(true)}
            disabled={isRecording}
          >
            <Ionicons name="videocam" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Main controls at the bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.captureButton, 
              isVideoMode && styles.videoButton,
              isRecording && styles.recordingButton
            ]} 
            onPress={handleCapture}
          >
            {isRecording ? (
              <View style={styles.stopButton} />
            ) : (
              <View style={[
                styles.captureButtonInner,
                isVideoMode && styles.videoButtonInner
              ]} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={toggleCameraFacing}
            disabled={isRecording}
          >
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Info indicator */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {role} • {photoType === 'kill' ? 'Elimination' : 'Evidence'} 
            • {isVideoMode ? 'Video' : 'Photo'}
          </Text>
        </View>
        
        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording</Text>
          </View>
        )}
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  modeContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeModeButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  videoButton: {
    borderColor: '#FF3B30',
  },
  recordingButton: {
    backgroundColor: 'rgba(255,59,48,0.3)',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  videoButtonInner: {
    backgroundColor: '#FF3B30',
  },
  stopButton: {
    width: 30,
    height: 30,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },
  infoContainer: {
    position: 'absolute',
    top: 40,
    width: '100%',
    alignItems: 'center',
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,59,48,0.7)',
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  }
}); 