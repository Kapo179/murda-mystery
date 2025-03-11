import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  withRepeat,
  Easing 
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProximityWarningProps {
  dangerLevel: 'safe' | 'caution' | 'danger';
  distanceToClosestHunter?: number;
}

export function ProximityWarning({ 
  dangerLevel = 'safe',
  distanceToClosestHunter 
}: ProximityWarningProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation for pulsing warning
  const pulseAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  
  // Configure animation based on danger level
  useEffect(() => {
    // Reset animations
    pulseAnimation.value = 1;
    rotateAnimation.value = 0;
    
    // Set animations based on danger level
    if (dangerLevel === 'danger') {
      // Fast pulsing for danger
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
      
      // Slight rotation for danger
      rotateAnimation.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 400 }),
          withTiming(5, { duration: 400 })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    } else if (dangerLevel === 'caution') {
      // Slower pulsing for caution
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    }
  }, [dangerLevel, pulseAnimation, rotateAnimation]);
  
  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseAnimation.value },
      { rotate: `${rotateAnimation.value}deg` }
    ],
  }));
  
  // Get color and icon based on danger level
  const getWarningStyles = () => {
    switch (dangerLevel) {
      case 'danger':
        return {
          color: '#FF3B30',
          backgroundColor: isDark ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)',
          icon: 'warning',
          message: 'DANGER! Hunter very close!'
        };
      case 'caution':
        return {
          color: '#FF9500',
          backgroundColor: isDark ? 'rgba(255, 149, 0, 0.2)' : 'rgba(255, 149, 0, 0.1)',
          icon: 'error-outline',
          message: 'Hunter nearby! Be careful'
        };
      default:
        return {
          color: '#34C759',
          backgroundColor: isDark ? 'rgba(52, 199, 89, 0.2)' : 'rgba(52, 199, 89, 0.1)',
          icon: 'check-circle',
          message: 'You are safe'
        };
    }
  };
  
  const warningStyles = getWarningStyles();
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: warningStyles.backgroundColor }
    ]}>
      <Animated.View style={[styles.iconContainer, pulseStyle]}>
        <MaterialIcons 
          name={warningStyles.icon} 
          size={30} 
          color={warningStyles.color} 
        />
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.warningText, { color: warningStyles.color }]}>
          {warningStyles.message}
        </Text>
        
        {distanceToClosestHunter && distanceToClosestHunter < 500 && (
          <Text style={[styles.distanceText, { color: warningStyles.color }]}>
            {dangerLevel === 'safe' 
              ? 'No hunters nearby'
              : `Closest hunter: ~${Math.round(distanceToClosestHunter)}m away`
            }
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  distanceText: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
}); 