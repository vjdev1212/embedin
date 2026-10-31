import React from 'react';
import { StyleSheet, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import { Ionicons } from '@expo/vector-icons';
import { NativeButton } from '@/components/NativeUiControls';

interface WatchTrailerButtonProps {
    trailerKey: string | null;
}

const WatchTrailerButton: React.FC<WatchTrailerButtonProps> = ({ trailerKey }) => {
    const handleTrailerPress = async () => {
        if (!trailerKey) {
            showAlert('No Trailer Available', 'Sorry, no trailer is available for this movie.');
            return;
        }
        if (await isHapticsSupported()) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        const youtubeUrl = `https://www.youtube.com/watch?v=${trailerKey}`;

        try {
            await Linking.openURL(youtubeUrl);
        } catch (error) {
            console.error('Error opening trailer:', error);
            showAlert('Error', 'Failed to open trailer');
        }
    };

    return (
        <NativeButton
            accessibilityLabel={trailerKey ? 'Watch trailer on YouTube' : 'No trailer available'}
            style={[
                styles.button,
                !trailerKey && styles.buttonDisabled,
            ]}
            onPress={handleTrailerPress}
            disabled={!trailerKey}
            variant="text"
        >
            <Ionicons name="logo-youtube" size={24} color={trailerKey ? '#ffffff' : '#8e8e93'} />
        </NativeButton>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: '#1c1c1e',
        borderWidth: 1,
        borderColor: '#38383a',
    },
    buttonDisabled: {
        opacity: 0.5,
    }
});

export default WatchTrailerButton;