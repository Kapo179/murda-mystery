import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useKillCam } from '@/hooks/useKillCam';
import { formatDistanceToNow } from 'date-fns';
import { useColorScheme } from '@/hooks/useColorScheme';

interface KillCamGalleryProps {
  type?: 'killer' | 'victim' | 'all';
  onClose?: () => void;
}

type TabType = 'all' | 'killer' | 'victim';

export const KillCamGallery: React.FC<KillCamGalleryProps> = ({
  type = 'all',
  onClose,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const {
    killCams,
    isLoading,
    error,
    clearError,
    videoRef,
    fetchKillCams,
    playRecording,
    pausePlayback,
    isPlaying,
    currentRecording,
  } = useKillCam();
  
  const [activeTab, setActiveTab] = useState<TabType>(type as TabType);
  const [selectedKillCam, setSelectedKillCam] = useState<string | null>(null);
  
  // Fetch killcams on mount and when tab changes
  useEffect(() => {
    fetchKillCams(activeTab);
  }, [activeTab]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [error, clearError]);
  
  // Handle selecting a killcam
  const handleSelectKillCam = async (id: string) => {
    const killCam = killCams.find(cam => cam.id === id);
    if (killCam) {
      setSelectedKillCam(id);
      await playRecording(killCam);
    }
  };
  
  // Clear selected killcam and pause playback
  const handleCloseVideo = async () => {
    await pausePlayback();
    setSelectedKillCam(null);
  };
  
  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  // Determine if app is in single column or multi-column layout
  const { width } = Dimensions.get('window');
  const numColumns = width > 600 ? 3 : 2;
  const columnWidth = width / numColumns;
  
  // Render each killcam item
  const renderKillCamItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.killCamItem, { width: columnWidth - 8 }]}
      onPress={() => handleSelectKillCam(item.id)}
      activeOpacity={0.7}
    >
      {/* Thumbnail image */}
      <View style={styles.thumbnailContainer}>
        {item.thumbnailUri ? (
          <Image
            source={{ uri: item.thumbnailUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <MaterialIcons name="videocam" size={40} color="#fff" />
          </View>
        )}
        
        {/* Play button overlay */}
        <View style={styles.playButtonOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#fff" />
          </View>
        </View>
      </View>
      
      {/* KillCam details */}
      <View style={[styles.killCamDetails, { backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0' }]}>
        <Text style={[styles.killCamTitle, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
          {item.killerId ? 'Your Kill' : 'You Were Killed'}
        </Text>
        <Text style={[styles.killCamDate, { color: isDark ? '#ccc' : '#666' }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
          KillCam Gallery
        </Text>
        
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && styles.activeTab,
            activeTab === 'all' && { backgroundColor: isDark ? '#333' : '#e0e0e0' },
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
              { color: isDark ? '#fff' : '#000' },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'killer' && styles.activeTab,
            activeTab === 'killer' && { backgroundColor: isDark ? '#333' : '#e0e0e0' },
          ]}
          onPress={() => setActiveTab('killer')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'killer' && styles.activeTabText,
              { color: isDark ? '#fff' : '#000' },
            ]}
          >
            My Kills
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'victim' && styles.activeTab,
            activeTab === 'victim' && { backgroundColor: isDark ? '#333' : '#e0e0e0' },
          ]}
          onPress={() => setActiveTab('victim')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'victim' && styles.activeTabText,
              { color: isDark ? '#fff' : '#000' },
            ]}
          >
            My Deaths
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* KillCam grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>
            Loading KillCams...
          </Text>
        </View>
      ) : killCams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="videocam-off"
            size={64}
            color={isDark ? '#666' : '#999'}
          />
          <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
            No KillCams found
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#ccc' : '#666' }]}>
            {activeTab === 'killer'
              ? "You haven't recorded any kills yet"
              : activeTab === 'victim'
              ? "You haven't been killed yet"
              : "There are no KillCams to display"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={killCams}
          renderItem={renderKillCamItem}
          keyExtractor={(item) => item.id || item.uri}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Video player modal */}
      {selectedKillCam && (
        <View style={styles.videoModal}>
          <BlurView
            style={styles.videoBlurBackground}
            intensity={90}
            tint={isDark ? 'dark' : 'light'}
          />
          
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              style={styles.video}
              source={{ uri: currentRecording?.uri || '' }}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
            
            <TouchableOpacity
              style={styles.closeVideoButton}
              onPress={handleCloseVideo}
            >
              <Ionicons name="close-circle" size={36} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  gridContainer: {
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  killCamItem: {
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    height: 160,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  killCamDetails: {
    padding: 12,
  },
  killCamTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  killCamDate: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  videoModal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  videoBlurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  videoContainer: {
    width: '90%',
    height: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  closeVideoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
}); 