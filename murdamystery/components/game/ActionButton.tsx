import React from 'react';
import { TouchableOpacity, Image, StyleSheet, ViewStyle, ImageSourcePropType, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ActionButtonProps {
  icon: ImageSourcePropType;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'emergency' | 'evidence' | 'kill' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export function ActionButton({ 
  icon, 
  onPress, 
  style, 
  variant = 'default',
  size = 'medium'
}: ActionButtonProps) {
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'emergency':
        return styles.emergencyButton;
      case 'evidence':
        return styles.evidenceButton;
      case 'kill':
        return styles.killButton;
      default:
        return styles.defaultButton;
    }
  };
  
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, borderRadius: 20 };
      case 'large':
        return { width: 70, height: 70, borderRadius: 35 };
      default: // medium
        return { width: 56, height: 56, borderRadius: 28 };
    }
  };
  
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return { width: 20, height: 20 };
      case 'large':
        return { width: 35, height: 35 };
      default: // medium
        return { width: 28, height: 28 };
    }
  };
  
  const getIconAdjustment = () => {
    // For camera icon, apply specific positioning
    if (variant === 'evidence') {
      return {
        marginTop: -3,     // Move up more
        marginLeft: 2,     // Move right more
      };
    }
    
    // For kill icon (skull & crossbones), might need adjustment too
    if (variant === 'kill') {
      return {
        marginTop: -1,
      };
    }
    
    return {};  // No adjustment for other icons
  };
  
  // Complete replacement for the emergency button gradient
  if (variant === 'emergency') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          getSize(),
          { backgroundColor: '#220000' }, // Very dark red base for better contrast
          style
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Inner circular glow */}
        <View
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 60, 50, 0.25)', // Subtle red glow
            opacity: 0.8,
          }}
        />
        
        {/* Inner highlight */}
        <View
          style={{
            position: 'absolute',
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(255, 60, 50, 0.4)', // Brighter inner highlight
            opacity: 0.9,
          }}
        />
        
        <View style={styles.iconContainer}>
          <Image 
            source={icon}
            style={[styles.icon, getIconSize()]}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  }
  
  // For camera icon specifically, use absolute positioning
  if (variant === 'evidence') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          getButtonStyle(),
          getSize(),
          style
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Image 
            source={icon}
            style={[
              styles.icon, 
              getIconSize(),
              { position: 'absolute', top: '47%', left: '51%', transform: [{ translateX: -14 }, { translateY: -14 }] }
            ]}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  }
  
  // Regular rendering for other buttons
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSize(),
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Image 
          source={icon}
          style={[
            styles.icon, 
            getIconSize(),
            getIconAdjustment()
          ]}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  defaultButton: {
    backgroundColor: '#000000',
  },
  emergencyButton: {
    backgroundColor: '#1A1A1A', // Dark background (as fallback if gradient fails)
  },
  killButton: {
    backgroundColor: '#000000',
  },
  evidenceButton: {
    backgroundColor: '#000000',
  },
  icon: {
    width: 28,
    height: 28,
  }
}); 