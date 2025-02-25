import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Typography } from '@/components/Typography';
import { CustomMapView } from '@/components/game/MapView';
import { sharedStyles } from './shared/styles';

const cameraEmoji = require('@/assets/images/emojis/assets/Camera/3D/camera_3d.png');
const locationEmoji = require('@/assets/images/emojis/assets/Round pushpin/3D/round_pushpin_3d.png');
const meetingEmoji = require('@/assets/images/emojis/assets/Loudspeaker/3D/loudspeaker_3d.png');

export function MafiaView() {
  const [meetingsLeft, setMeetingsLeft] = React.useState(1);

  const handleEmergencyMeeting = () => {
    if (meetingsLeft > 0) {
      setMeetingsLeft(prev => prev - 1);
      // Handle emergency meeting logic
    }
  };

  return (
    <View style={sharedStyles.container}>
      <CustomMapView showAllPlayers />
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
          style={[sharedStyles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => {}}
        >
          <Image source={cameraEmoji} style={sharedStyles.actionIcon} />
          <Typography style={sharedStyles.actionText}>Take Kill Photo</Typography>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[sharedStyles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => {}}
        >
          <Image source={cameraEmoji} style={sharedStyles.actionIcon} />
          <Typography style={sharedStyles.actionText}>Take Evidence Photo</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default MafiaView;