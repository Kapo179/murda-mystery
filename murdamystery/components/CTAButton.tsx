import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator,
  Image,
  ImageSourcePropType
} from 'react-native';

interface CTAButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: ImageSourcePropType;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function CTAButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle
}: CTAButtonProps) {
  
  const getBackgroundColor = () => {
    if (disabled) return '#666666';
    
    switch (variant) {
      case 'primary':
        return '#FF3B30'; // The red color used in the app
      case 'secondary':
        return '#4B9EF4'; // Blue color
      case 'danger':
        return '#FF3B30'; // Same red for danger, but useful for semantic reasons
      default:
        return '#FF3B30';
    }
  };
  
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getButtonSize(),
        fullWidth && styles.fullWidth,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {icon && <Image source={icon} style={styles.icon} />}
          <Text
            style={[
              styles.text,
              { fontSize: getFontSize() },
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  }
}); 