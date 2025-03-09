import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Link } from 'expo-router';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppleAuthButton } from '@/components/auth/AppleAuthButton';
import { Typography } from '@/components/Typography';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Remove background image import
// const backgroundImage = require('@/assets/images/auth-background.png');

export default function LoginScreen() {
  const router = useRouter();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const formOpacity = React.useRef(new Animated.Value(0)).current;
  
  const handleFormToggle = () => {
    if (showLoginForm) {
      // Hide form
      Animated.timing(formOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowLoginForm(false));
    } else {
      // Show form
      setShowLoginForm(true);
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  
  const handleLoginSuccess = () => {
    // This will be handled by the auth context routing
    console.log('Login successful');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Replace background image with a colored View */}
      <View style={styles.backgroundView} />
      
      {/* Overlay with blur */}
      <BlurView intensity={40} style={styles.overlay} tint="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Text Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.textLogoContainer}>
            <Text style={styles.logoTextMurda}>MURDA</Text>
            <Text style={styles.logoTextMystery}>MYSTERY</Text>
          </View>
          <Typography style={styles.tagline}>
            Solve the mystery. Survive the night.
          </Typography>
        </View>
        
        <View style={styles.authContainer}>
          {/* Apple Sign In - Primary one-tap option */}
          <AppleAuthButton onSuccess={handleLoginSuccess} />
          
          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Typography style={styles.dividerText}>or</Typography>
            <View style={styles.dividerLine} />
          </View>
          
          {/* Email Sign In Toggle */}
          {showLoginForm ? (
            <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
              <LoginForm onSuccess={handleLoginSuccess} />
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleFormToggle}
              >
                <Typography style={styles.cancelText}>Cancel</Typography>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity 
              style={styles.emailButton} 
              onPress={handleFormToggle}
            >
              <LinearGradient
                colors={['#333333', '#222222']}
                style={styles.emailButtonGradient}
              >
                <Typography style={styles.emailButtonText}>Sign In with Email</Typography>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Typography style={styles.signupText}>
              New to MurdaMystery? 
            </Typography>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Typography style={styles.signupLink}>Sign Up</Typography>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Replace background image with a gradient-like view
  backgroundView: {
    position: 'absolute',
    width,
    height,
    backgroundColor: '#121212',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  textLogoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoTextMurda: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '200', // Ultra light
    letterSpacing: 8,
  },
  logoTextMystery: {
    color: '#FF3B30',
    fontSize: 32,
    fontWeight: '300', // Light
    letterSpacing: 4,
    marginTop: -5,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  authContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  emailButton: {
    borderRadius: 12,
    height: 56,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emailButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 16,
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    alignItems: 'center',
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginRight: 4,
  },
  signupLink: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 