import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  Text,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from './Typography';

// Game tips to show during loading
const GAME_TIPS = [
  "The Mafia can see all players on the map.",
  "As a Detective, look for clues left behind by the Mafia.",
  "Take photos as evidence to help identify the Mafia.",
  "Emergency meetings can be called when you find a body.",
  "Stay close to other players for safety.",
  "If you're a Civilian, trust no one!",
  "The Mafia must take a photo to eliminate a player.",
  "Detectives can see the last known location of the Mafia.",
  "Evidence photos help during emergency meetings.",
  "Watch for suspicious behavior from other players."
];

interface LoadingScreenProps {
  onFinishLoading: () => void;
  minDisplayTime?: number; // Minimum time to show loading screen (ms)
}

export function LoadingScreen({ onFinishLoading, minDisplayTime = 3000 }: LoadingScreenProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const tipFadeAnim = React.useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  
  // Simulate loading progress
  useEffect(() => {
    const startTime = Date.now();
    
    // Fade in the loading screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + (Math.random() * 0.1);
        return newProgress >= 1 ? 1 : newProgress;
      });
    }, 200);
    
    // Cycle through tips
    const tipInterval = setInterval(() => {
      // Fade out current tip
      Animated.timing(tipFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change tip
        setCurrentTipIndex(prev => (prev + 1) % GAME_TIPS.length);
        
        // Fade in new tip
        Animated.timing(tipFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);
    
    // Clean up and finish loading
    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
      
      // Ensure minimum display time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minDisplayTime) {
        setTimeout(() => {
          onFinishLoading();
        }, minDisplayTime - elapsedTime);
      } else {
        onFinishLoading();
      }
    };
  }, []);
  
  // Once progress reaches 100%, fade out and trigger onFinishLoading
  useEffect(() => {
    if (loadingProgress >= 1) {
      // Wait a moment at 100% before fading out
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          // Wait for fade out to complete
          setTimeout(onFinishLoading, 100);
        });
      }, 300);
    }
  }, [loadingProgress]);
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          paddingTop: insets.top,
          paddingBottom: insets.bottom 
        }
      ]}
    >
      <View style={styles.logoContainer}>
        <Typography variant="title" style={styles.title}>
          MURDA MYSTERY
        </Typography>
      </View>
      
      <View style={styles.tipContainer}>
        <Typography variant="caption" style={styles.tipHeader}>
          TIP:
        </Typography>
        <Animated.View style={{ opacity: tipFadeAnim }}>
          <Typography style={styles.tipText}>
            {GAME_TIPS[currentTipIndex]}
          </Typography>
        </Animated.View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBar,
              { width: `${loadingProgress * 100}%` }
            ]} 
          />
        </View>
        <Typography style={styles.progressText}>
          {Math.floor(loadingProgress * 100)}%
        </Typography>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  tipContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 40,
    minHeight: 120,
    justifyContent: 'center',
    width: '90%',
  },
  tipHeader: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF3B30',
  },
  progressText: {
    fontSize: 14,
    color: '#999',
  },
}); 