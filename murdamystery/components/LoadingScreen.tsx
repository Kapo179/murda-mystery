import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Animated } from 'react-native';
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
}

export function LoadingScreen({ onFinishLoading }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const tipFadeAnim = React.useRef(new Animated.Value(1)).current;
  
  // Simulate loading process
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Fast initial progress
    if (progress < 70) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 10;
          return next > 70 ? 70 : next;
        });
      }, 100);
    } 
    // Slow down near the end
    else if (progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 5;
          return next > 100 ? 100 : next;
        });
      }, 200);
    } 
    // When progress is complete
    else {
      // Clear any existing interval
      clearInterval(interval);
      
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Call onFinishLoading after animation completes
        onFinishLoading();
      });
      
      return;
    }
    
    return () => clearInterval(interval);
  }, [progress, onFinishLoading, fadeAnim]);
  
  // Start the loading process in a separate effect
  useEffect(() => {
    // Ensure we start immediately
    setProgress(1);
    
    // Set a safety timeout to ensure we eventually finish loading (10 seconds max)
    const safetyTimeout = setTimeout(() => {
      setProgress(100);
    }, 10000);
    
    return () => clearTimeout(safetyTimeout);
  }, []);

  // Cycle through tips
  useEffect(() => {
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
    
    return () => clearInterval(tipInterval);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Typography variant="title" weight="bold" style={styles.title}>
          Murda Mystery
        </Typography>
        
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
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        
        <Text style={styles.loadingText}>
          {progress < 100 ? 'Loading...' : 'Ready!'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '80%',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    marginBottom: 40,
    textAlign: 'center',
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
    height: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF544E',
    borderRadius: 3,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
}); 