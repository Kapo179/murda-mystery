import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';

interface GlowingMarkerProps {
  size?: number;
  color?: string;
}

export function GlowingMarker({ 
  size = 24,
  color = '#FF4B55'
}: GlowingMarkerProps) {
  const pulseAnim = useSharedValue(1);

  React.useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: 1.2 - pulseAnim.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.pulse,
        pulseStyle,
        { 
          width: size * 1.5, 
          height: size * 1.5,
          borderRadius: size * 0.75,
          backgroundColor: color + '40' // 25% opacity
        }
      ]} />
      <View style={[
        styles.marker,
        { 
          width: size, 
          height: size,
          borderRadius: size / 2,
          backgroundColor: color
        }
      ]}>
        <View style={[
          styles.inner,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
          }
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  inner: {
    backgroundColor: '#FFFFFF',
  },
}); 