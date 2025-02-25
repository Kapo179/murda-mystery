import React from 'react';
import { CameraView } from '@/components/game/CameraView';
import { useRouter } from 'expo-router';

export default function CameraScreen() {
  console.log('CameraScreen mounted'); // Track screen mount
  const router = useRouter();

  return (
    <CameraView
      onClose={() => {
        console.log('Camera closed, navigating back'); // Track navigation
        router.back();
      }}
      onPhotoTaken={(uri) => {
        console.log('Photo taken, URI:', uri); // Track photo capture
        console.log('Navigating back with photo');
        router.back();
      }}
    />
  );
} 