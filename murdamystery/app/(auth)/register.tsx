import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Link } from 'expo-router';
import { Typography } from '@/components/Typography';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { AppleAuthButton } from '@/components/auth/AppleAuthButton';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';

const { width, height } = Dimensions.get('window');

// Remove asset imports that don't exist
// const logo = require('@/assets/images/logo-small.png');
// const backgroundImage = require('@/assets/images/auth-background.png');
// const backIcon = require('@/assets/images/emojis/assets/Left arrow/3D/left_arrow_3d.png');

// Form validation schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, loading, error, clearError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  
  const handleRegister = async () => {
    try {
      // Validate form inputs
      registerSchema.parse({ username, email, password });
      
      // Reset form errors
      setFormErrors({});
      
      // Attempt registration
      await signUp(username, email, password);
      
      // Auth context will handle navigation on success
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: {
          username?: string;
          email?: string;
          password?: string;
        } = {};
        
        error.errors.forEach(err => {
          const field = err.path[0] as string;
          if (field === 'username' || field === 'email' || field === 'password') {
            newErrors[field] = err.message;
          }
        });
        
        setFormErrors(newErrors);
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Replace background image with a gradient-like view */}
      <View style={styles.backgroundView} />
      
      {/* Overlay with blur */}
      <BlurView intensity={40} style={styles.overlay} tint="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header with text back button */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <View style={styles.miniLogoContainer}>
              <Text style={styles.miniLogoText}>MM</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
          
          <Typography style={styles.title}>Create Account</Typography>
          
          {/* Form */}
          <View style={styles.form}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#777"
                value={username}
                onChangeText={text => {
                  setUsername(text);
                  clearError();
                }}
              />
            </View>
            {formErrors.username && (
              <Typography style={styles.errorText}>{formErrors.username}</Typography>
            )}
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#777"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  clearError();
                }}
              />
            </View>
            {formErrors.email && (
              <Typography style={styles.errorText}>{formErrors.email}</Typography>
            )}
            
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  clearError();
                }}
              />
            </View>
            {formErrors.password && (
              <Typography style={styles.errorText}>{formErrors.password}</Typography>
            )}
            
            {/* Error Message */}
            {error && (
              <Typography style={styles.errorText}>{error}</Typography>
            )}
            
            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (!username || !email || !password || loading) && styles.disabledButton
              ]}
              onPress={handleRegister}
              disabled={!username || !email || !password || loading}
            >
              <LinearGradient
                colors={['#FF3B30', '#E62C22']}
                style={styles.buttonGradient}
              >
                <Typography style={styles.registerButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Typography>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Typography style={styles.dividerText}>or</Typography>
              <View style={styles.dividerLine} />
            </View>
            
            {/* Apple Sign Up */}
            <AppleAuthButton />
            
            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Typography style={styles.loginText}>
                Already have an account?
              </Typography>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Typography style={styles.loginLink}>Sign In</Typography>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
  miniLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniLogoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
  },
  registerButton: {
    borderRadius: 12,
    height: 56,
    overflow: 'hidden',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 