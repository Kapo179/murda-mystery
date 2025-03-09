import React from 'react';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/context/AuthContext';
import { Typography } from '@/components/Typography';

interface AppleAuthButtonProps {
  onSuccess?: () => void;
}

export function AppleAuthButton({ onSuccess }: AppleAuthButtonProps) {
  const { signInWithApple, loading } = useAuth();
  
  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log('Apple sign in was canceled or failed');
      // User cancellation is handled in the AuthContext
    }
  };
  
  // Only show Apple Sign In on iOS devices
  if (Platform.OS !== 'ios') return null;
  
  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={12}
        style={styles.button}
        onPress={handleAppleSignIn}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <Typography style={styles.loadingText}>Signing in...</Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
    marginTop: 16,
    position: 'relative',
  },
  button: {
    width: '100%',
    height: 56,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
}); 