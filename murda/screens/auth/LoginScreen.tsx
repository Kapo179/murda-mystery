import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { signIn, signInWithApple, loading, error, clearError } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Handle login with email/password
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    try {
      await signIn(email, password);
      // No need to navigate, AuthProvider will update state
    } catch (error) {
      // Error is handled by AuthProvider
      console.log('Login failed:', error);
    }
  };
  
  // Handle Apple login
  const handleAppleLogin = async () => {
    try {
      await signInWithApple();
      // No need to navigate, AuthProvider will update state
    } catch (error) {
      // Error is handled by AuthProvider unless cancelled
      if (error instanceof Error && error.message !== 'The operation was canceled.') {
        console.log('Apple login failed:', error);
      }
    }
  };
  
  // Navigate to signup
  const navigateToSignUp = () => {
    router.push('/signup');
  };
  
  // Navigate to forgot password
  const navigateToForgotPassword = () => {
    router.push('/forgot-password');
  };
  
  // Clear error if displayed
  if (error) {
    Alert.alert('Error', error, [
      { text: 'OK', onPress: clearError }
    ]);
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setSecureTextEntry(!secureTextEntry)}
            >
              <Ionicons 
                name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={navigateToForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={8}
              style={styles.appleButton}
              onPress={handleAppleLogin}
            />
          )}
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToSignUp}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#a1cbec',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  appleButton: {
    width: '100%',
    height: 56,
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 