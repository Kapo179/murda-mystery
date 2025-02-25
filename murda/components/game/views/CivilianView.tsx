import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';
import { CustomMapView } from '@/components/game/MapView';
import { sharedStyles } from './shared/styles';

const cameraEmoji = require('@/assets/images/emojis/assets/Camera/3D/camera_3d.png');
const meetingEmoji = require('@/assets/images/emojis/assets/Loudspeaker/3D/loudspeaker_3d.png');

export function CivilianView() {
  const [meetingsLeft, setMeetingsLeft] = React.useState(1);
  const router = useRouter();

  const handleEmergencyMeeting = () => {
    if (meetingsLeft > 0) {
      setMeetingsLeft(prev => prev - 1);
      // Handle emergency meeting logic
    }
  };

  const handleTakePhoto = () => {
    router.push({
      pathname: '/camera',
      params: { 
        type: 'evidence',
        role: 'civilian'
      }
    });
  };

  return (
    <View style={sharedStyles.container}>
      <CustomMapView showNearbyPlayers />
      <View style={sharedStyles.actions}>
        <TouchableOpacity 
          style={sharedStyles.emergencyButton}
          onPress={handleEmergencyMeeting}
          disabled={meetingsLeft === 0}
        >
          <Image source={meetingEmoji} style={sharedStyles.actionIcon} />
          <Typography style={sharedStyles.actionText}>
            Emergency Meeting
          </Typography>
          <View style={sharedStyles.emergencyCounter}>
            <Typography style={sharedStyles.emergencyCounterText}>
              {meetingsLeft}
            </Typography>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[sharedStyles.actionButton, { backgroundColor: '#32D74B' }]}
          onPress={handleTakePhoto}
        >
          <Image source={cameraEmoji} style={sharedStyles.actionIcon} />
          <Typography style={sharedStyles.actionText}>Take Evidence Photo</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default CivilianView; 