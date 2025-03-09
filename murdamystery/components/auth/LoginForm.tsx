import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Typography } from '@/components/Typography';
import { z } from 'zod';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signIn, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  
  // Handle form submission
  const handleLogin = async () => {
    try {
      // Validate form inputs
      loginSchema.parse({ email, password });
      
      // Reset form errors
      setFormErrors({});
      
      // Attempt login with Firebase
      await signIn(email, password);
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: { email?: string; password?: string } = {};
        error.errors.forEach(err => {
          if (err.path[0] === 'email') {
            newErrors.email = err.message;
          } else if (err.path[0] === 'password') {
            newErrors.password = err.message;
          }
        });
        setFormErrors(newErrors);
      } else {
        // Firebase errors are handled in the AuthContext
        console.error('Login error:', error);
      }
    }
  };
  
  return (
    <View style={styles.container}>
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
      
      {/* Backend Error Message */}
      {error && (
        <Typography style={styles.errorText}>{error}</Typography>
      )}
      
      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, (loading || !email || !password) && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading || !email || !password}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Typography style={styles.loginButtonText}>Login</Typography>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  loginButton: {
    borderRadius: 12,
    height: 56,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 