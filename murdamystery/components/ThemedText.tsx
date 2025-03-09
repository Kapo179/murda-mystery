import React from 'react';
import { Text, TextStyle, StyleSheet, Platform } from 'react-native';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'title' | 'caption' | 'label';
  style?: TextStyle;
  numberOfLines?: number;
  weight?: 'normal' | 'bold' | '500' | '600' | '700';
}

export function Typography({ 
  children, 
  variant = 'label',
  style,
  numberOfLines,
  weight = 'normal'
}: TypographyProps) {
  const getSystemFont = () => {
    if (Platform.OS === 'ios') {
      switch (weight) {
        case 'light': return '-apple-system-thin';
        case 'medium': return '-apple-system-medium';
        case 'bold': return '-apple-system-bold';
        default: return '-apple-system';
      }
    } else {
      // Android system fonts
      switch (weight) {
        case 'light': return 'sans-serif-light';
        case 'medium': return 'sans-serif-medium';
        case 'bold': return 'sans-serif-bold';
        default: return 'sans-serif';
      }
    }
  };

  return (
    <Text style={[
      styles[variant],
      { fontFamily: getSystemFont() },
      style
    ]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  // Variants
  display: {
    fontSize: 48,
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
    lineHeight: 52,
  },
  title: {
    fontSize: 32,
    letterSpacing: Platform.OS === 'ios' ? 0.2 : 0,
    lineHeight: 38,
  },
  heading: {
    fontSize: 20,
    letterSpacing: Platform.OS === 'ios' ? 0.15 : 0,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    letterSpacing: Platform.OS === 'ios' ? 0.1 : 0,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0,
    lineHeight: 18,
    opacity: 0.7,
  },
  metric: {
    fontSize: 36,
    letterSpacing: Platform.OS === 'ios' ? -0.2 : 0,
    lineHeight: 40,
  },
  label: {
    fontSize: 15,
    letterSpacing: Platform.OS === 'ios' ? 0.25 : 0,
    lineHeight: 20,
  },

  // Weights
  light: {
    fontWeight: '300',
  },
  regular: {
    fontWeight: '400',
  },
  medium: {
    fontWeight: '500',
  },
  bold: {
    fontWeight: '600',
  },
}); 