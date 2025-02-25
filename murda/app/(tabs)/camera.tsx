import React from 'react';
import { CameraView } from '@/components/game/CameraView';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const photoType = params.type as 'kill' | 'evidence';
  const role = params.role as string;

  console.log('CameraScreen mounted with params:', params);

  return (
    <CameraView
      photoType={photoType}
      role={role}
      onClose={() => {
        console.log('Camera closed, navigating back');
        router.back();
      }}
      onPhotoTaken={(uri, isVideo) => {
        const mediaType = isVideo ? 'video' : 'photo';
        console.log(`${photoType} ${mediaType} taken by ${role}, URI:`, uri);
        
        // You would handle the media differently based on type and role
        router.back();
      }}
    />
  );
} 