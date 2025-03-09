import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import api from '@/services/api';
import { captureRef } from 'react-native-view-shot';

interface KillCamRecording {
  id?: string;
  uri: string;
  thumbnailUri?: string;
  gameId: string;
  victimId: string;
  killerId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: string;
}

interface KillCamOptions {
  maxDuration?: number; // seconds
  quality?: '720p' | '1080p' | '480p' | '2160p';
  includeAudio?: boolean;
  autoUpload?: boolean;
}

interface UseKillCamReturn {
  // Camera state
  isRecording: boolean;
  recordingProgress: number; // 0-100
  cameraRef: React.RefObject<Camera>;
  videoRef: React.RefObject<Video>;
  
  // Recording functions
  startRecording: (gameId: string, victimId: string) => Promise<void>;
  stopRecording: () => Promise<string | null>;
  
  // Upload state
  isUploading: boolean;
  uploadProgress: number; // 0-100
  
  // Upload functions
  uploadRecording: (recording: KillCamRecording) => Promise<string | null>;
  
  // Playback state
  currentRecording: KillCamRecording | null;
  isPlaying: boolean;
  isMuted: boolean;
  
  // Playback functions
  playRecording: (recording: KillCamRecording) => Promise<void>;
  pausePlayback: () => Promise<void>;
  toggleMute: () => void;
  
  // KillCam list
  killCams: KillCamRecording[];
  isLoading: boolean;
  
  // List functions
  fetchKillCams: (type?: 'killer' | 'victim' | 'all') => Promise<void>;
  
  // Permissions
  hasCameraPermission: boolean | null;
  requestPermissions: () => Promise<boolean>;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

const DEFAULT_OPTIONS: KillCamOptions = {
  maxDuration: 10, // 10 seconds max
  quality: '720p',
  includeAudio: true,
  autoUpload: true,
};

/**
 * Hook for managing KillCam recordings
 */
export function useKillCam(options: KillCamOptions = {}): UseKillCamReturn {
  // Merge options with defaults
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // Refs
  const cameraRef = useRef<Camera>(null);
  const videoRef = useRef<Video>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [currentRecording, setCurrentRecording] = useState<KillCamRecording | null>(null);
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // KillCam list
  const [killCams, setKillCams] = useState<KillCamRecording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Permission state
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Recording timer
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Request camera permissions on mount
  useEffect(() => {
    requestPermissions();
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);
  
  /**
   * Request camera and audio permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      
      const hasPermissions = 
        cameraPermission.status === 'granted' && 
        microphonePermission.status === 'granted' &&
        mediaLibraryPermission.status === 'granted';
      
      setHasCameraPermission(hasPermissions);
      return hasPermissions;
    } catch (err) {
      setError('Failed to request camera permissions');
      return false;
    }
  };
  
  /**
   * Start recording a killcam
   */
  const startRecording = async (gameId: string, victimId: string): Promise<void> => {
    if (!cameraRef.current) {
      setError('Camera not available');
      return;
    }
    
    if (!hasCameraPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        setError('Camera permission is required to record');
        return;
      }
    }
    
    try {
      setIsRecording(true);
      setRecordingProgress(0);
      
      // Get current location
      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
      } catch (err) {
        console.warn('Could not get location for killcam');
      }
      
      // Start recording video
      const options = {
        maxDuration: config.maxDuration,
        quality: config.quality as any,
        mute: !config.includeAudio,
      };
      
      await cameraRef.current.recordAsync(options);
      
      // Start the progress timer
      const startTime = Date.now();
      const maxDurationMs = (config.maxDuration || 10) * 1000;
      
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / maxDurationMs) * 100, 100);
        setRecordingProgress(progress);
        
        if (progress >= 100) {
          stopRecording();
        }
      }, 100);
      
      // Set initial recording info
      setCurrentRecording({
        uri: '', // Will be set when recording completes
        gameId,
        victimId,
        location,
      });
      
    } catch (err) {
      setIsRecording(false);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      console.error('Error starting recording:', err);
    }
  };
  
  /**
   * Stop recording and save the video
   */
  const stopRecording = async (): Promise<string | null> => {
    if (!cameraRef.current || !isRecording) {
      return null;
    }
    
    try {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      const video = await cameraRef.current.stopRecording();
      setIsRecording(false);
      setRecordingProgress(100);
      
      // Generate a thumbnail from the video
      let thumbnailUri = '';
      try {
        if (videoRef.current) {
          thumbnailUri = await captureRef(videoRef.current, {
            format: 'jpg',
            quality: 0.8,
          });
        }
      } catch (err) {
        console.warn('Error generating thumbnail:', err);
      }
      
      // Update the current recording with the video URI
      if (currentRecording) {
        const updatedRecording = {
          ...currentRecording,
          uri: video.uri,
          thumbnailUri,
        };
        setCurrentRecording(updatedRecording);
        
        // Auto-upload if enabled
        if (config.autoUpload) {
          await uploadRecording(updatedRecording);
        }
        
        return video.uri;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
      console.error('Error stopping recording:', err);
      return null;
    }
  };
  
  /**
   * Upload a recording to the server
   */
  const uploadRecording = async (recording: KillCamRecording): Promise<string | null> => {
    if (!recording.uri) {
      setError('No video to upload');
      return null;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // First we need to upload the video file to storage (this would normally go to S3 or similar)
      // For now, we'll simulate this and just use the local URI
      
      // In a real implementation, you would:
      // 1. Upload the video file to S3 or your storage service
      // 2. Get the public URL for the uploaded video
      // 3. Save that URL to your server
      
      // Simulating file upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // For this example, we'll assume the video is available at this URL
      // In a real app, this would be the URL returned from your storage service
      const videoUrl = recording.uri;
      const thumbnailUrl = recording.thumbnailUri;
      
      // Save the killcam to the server
      const result = await api.killcam.saveKillCam({
        gameId: recording.gameId,
        victimId: recording.victimId,
        videoUrl,
        thumbnailUrl,
        location: recording.location,
      });
      
      // Update the current recording with the server ID
      if (result?.id) {
        setCurrentRecording({
          ...recording,
          id: result.id,
        });
        
        // Refresh the list of killcams
        await fetchKillCams();
        
        return result.id;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload recording');
      console.error('Error uploading recording:', err);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  /**
   * Play a recording
   */
  const playRecording = async (recording: KillCamRecording): Promise<void> => {
    setCurrentRecording(recording);
    
    if (videoRef.current) {
      try {
        await videoRef.current.loadAsync({ uri: recording.uri });
        await videoRef.current.playAsync();
        setIsPlaying(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to play recording');
        console.error('Error playing recording:', err);
      }
    }
  };
  
  /**
   * Pause playback
   */
  const pausePlayback = async (): Promise<void> => {
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } catch (err) {
        console.error('Error pausing playback:', err);
      }
    }
  };
  
  /**
   * Toggle mute
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (videoRef.current) {
      videoRef.current.setIsMutedAsync(!isMuted);
    }
  };
  
  /**
   * Fetch killcams from the server
   */
  const fetchKillCams = async (type: 'killer' | 'victim' | 'all' = 'all'): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await api.killcam.getUserKillCams({ type });
      
      if (result?.killCams) {
        // Transform the API response to match our KillCamRecording type
        const formattedKillCams: KillCamRecording[] = result.killCams.map(cam => ({
          id: cam.id,
          uri: cam.videoUrl,
          thumbnailUri: cam.thumbnailUrl,
          gameId: cam.gameId,
          victimId: cam.victimId,
          killerId: cam.killerId,
          location: cam.location,
          createdAt: cam.createdAt,
        }));
        
        setKillCams(formattedKillCams);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch killcams');
      console.error('Error fetching killcams:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };
  
  return {
    // Camera state
    isRecording,
    recordingProgress,
    cameraRef,
    videoRef,
    
    // Recording functions
    startRecording,
    stopRecording,
    
    // Upload state
    isUploading,
    uploadProgress,
    
    // Upload functions
    uploadRecording,
    
    // Playback state
    currentRecording,
    isPlaying,
    isMuted,
    
    // Playback functions
    playRecording,
    pausePlayback,
    toggleMute,
    
    // KillCam list
    killCams,
    isLoading,
    
    // List functions
    fetchKillCams,
    
    // Permissions
    hasCameraPermission,
    requestPermissions,
    
    // Error state
    error,
    clearError,
  };
} 