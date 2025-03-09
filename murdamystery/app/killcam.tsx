import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KillCamRecorder } from '@/components/killcam/KillCamRecorder';
import { KillCamGallery } from '@/components/killcam/KillCamGallery';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UI_ASSETS } from '@/constants/AssetPaths';

export default function KillCamScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [mode, setMode] = useState<'gallery' | 'record' | 'info'>('info');
  
  // Mock game ID and victim ID for demonstration
  const mockGameId = 'game-123';
  const mockVictimId = 'victim-456';
  
  // Handle a successful kill recording
  const handleKillCamSaved = (killCamId: string) => {
    console.log('KillCam saved with ID:', killCamId);
    setMode('gallery');
  };
  
  // Go back to the previous screen
  const handleGoBack = () => {
    router.back();
  };
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? '#000' : '#f5f5f5',
          paddingTop: insets.top
        }
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header - only shown in info mode */}
      {mode === 'info' && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
            KillCam Features
          </Text>
          <View style={styles.headerRight} />
        </View>
      )}
      
      {/* Main content area */}
      {mode === 'info' ? (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
          <View style={styles.infoSection}>
            <MaterialCommunityIcons
              name="video-vintage"
              size={64}
              color={isDark ? '#ff5252' : '#d32f2f'}
            />
            <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#000' }]}>
              KillCam Feature
            </Text>
            <Text style={[styles.infoText, { color: isDark ? '#ccc' : '#666' }]}>
              Murda Mystery's KillCam feature lets you record and share your kills with other players.
              Capture the moment when you eliminate another player and build your collection of
              KillCams.
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4caf50' }]}
              onPress={() => setMode('record')}
            >
              <MaterialCommunityIcons name="record-circle" size={24} color="#fff" />
              <Text style={styles.buttonText}>Record a KillCam</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2196f3' }]}
              onPress={() => setMode('gallery')}
            >
              <MaterialCommunityIcons name="view-gallery" size={24} color="#fff" />
              <Text style={styles.buttonText}>View KillCam Gallery</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCardContainer}>
            <View style={[styles.infoCard, { backgroundColor: isDark ? '#1A1A1A' : '#fff' }]}>
              <View style={styles.infoCardIcon}>
                <MaterialCommunityIcons name="timer-outline" size={28} color="#ff9800" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Quick Recordings
                </Text>
                <Text style={[styles.infoCardText, { color: isDark ? '#ccc' : '#666' }]}>
                  KillCams are short 8-second clips that capture your eliminations.
                </Text>
              </View>
            </View>
            
            <View style={[styles.infoCard, { backgroundColor: isDark ? '#1A1A1A' : '#fff' }]}>
              <View style={styles.infoCardIcon}>
                <MaterialCommunityIcons name="compass" size={28} color="#4caf50" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Location Tracking
                </Text>
                <Text style={[styles.infoCardText, { color: isDark ? '#ccc' : '#666' }]}>
                  KillCams include location data to show where the elimination occurred.
                </Text>
              </View>
            </View>
            
            <View style={[styles.infoCard, { backgroundColor: isDark ? '#1A1A1A' : '#fff' }]}>
              <View style={styles.infoCardIcon}>
                <MaterialCommunityIcons name="share-variant" size={28} color="#2196f3" />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Share Your Kills
                </Text>
                <Text style={[styles.infoCardText, { color: isDark ? '#ccc' : '#666' }]}>
                  Share your best kills with friends or on social media.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : mode === 'record' ? (
        <KillCamRecorder
          gameId={mockGameId}
          victimId={mockVictimId}
          onSaveSuccess={handleKillCamSaved}
          onCancel={() => setMode('info')}
        />
      ) : (
        <KillCamGallery
          onClose={() => setMode('info')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginVertical: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoCardContainer: {
    marginTop: 10,
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 