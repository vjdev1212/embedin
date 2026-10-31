import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StatusBar } from '@/components/Themed';
import { SettingsPage, SettingsSection, SettingsTitle } from '@/components/NativeSettings';

const DisclaimerScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar />
            <SettingsPage>
                <SettingsTitle title="Disclaimer" subtitle="Important information about third-party embeds." />
                <SettingsSection title="Overview">
                    <Text style={styles.intro}>
                        Embedin provides movie and TV information and opens HTTP video embeds configured by the user. It does not host, store, or distribute video content.
                    </Text>
                </SettingsSection>
                <SettingsSection title="Application Purpose">
                    <Text style={styles.sectionText}>
                        Embedin is a dashboard for movie and TV show information. Playback is provided by third-party HTTP embed providers selected through the movie and TV embed URL settings.
                    </Text>
                </SettingsSection>
                <SettingsSection title="Legal Notice">
                    <Text style={styles.sectionText}>
                        Users are responsible for ensuring their use of third-party embed providers complies with applicable laws and licensing agreements in their jurisdiction.
                    </Text>
                </SettingsSection>
                <SettingsSection title="Not Endorsed">
                    <Text style={styles.sectionText}>
                        The developer does not endorse accessing pirated or illegally distributed content, using unauthorized sources, or any activity that violates copyright laws.
                    </Text>
                </SettingsSection>
                <SettingsSection title="Developer Responsibility" footer="This notice explains user responsibilities for third-party content. The developer does not control or moderate external embed providers or their content.">
                    <View style={styles.warningRow}>
                        <Ionicons name="alert-circle" size={22} color="#ff9f0a" />
                        <Text style={styles.sectionText}>
                            The developer is not responsible for user actions, external content, or legal consequences resulting from third-party embed providers.
                        </Text>
                    </View>
                </SettingsSection>
            </SettingsPage>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    intro: { fontSize: 15, color: '#d1d1d6', lineHeight: 22, paddingHorizontal: 16 },
    sectionText: {
        fontSize: 15,
        color: '#d1d1d6',
        lineHeight: 21,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});

export default DisclaimerScreen;