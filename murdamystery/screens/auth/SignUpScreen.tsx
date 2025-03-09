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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  
  const { signUp, loading, error, clearError } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate password strength
  const isStrongPassword = (password: string) => {
    return password.length >= 8;
  };
  
  // Handle sign up
  const handleSignUp = async () => {
    // Validation checks
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    
    if (!isStrongPassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    try {
      await signUp(email, password, username);
      // No need to navigate, AuthProvider will update state
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      // Error is handled by AuthProvider
      console.log('Sign up failed:', error);
    }
  };
  
  // Navigate back to login
  const navigateToLogin = () => {
    router.replace('/login');
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={navigateToLogin}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={confirmSecureTextEntry}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
            >
              <Ionicons 
                name={confirmSecureTextEntry ? "eye-outline" : "eye-off-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.passwordRequirements}>
            Password must be at least 8 characters long
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
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
  passwordRequirements: {
    color: '#666',
    fontSize: 12,
    marginBottom: 24,
    marginTop: -8,
    paddingLeft: 4,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 