import { Linking, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Text } from '@vjdev1212/media-ui-kit';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { defaultTvShowUrlTemplate } from '@/constants/Embed';
import { SettingsPage, SettingsRow, SettingsSection } from '@vjdev1212/media-ui-kit';
import { storageService } from '@/utils/StorageService';

interface EmbedSettings {
    movie?: { template?: string };
    tv?: { template?: string };
}

const EmbedTvShowsSettingsScreen = () => {
    const [tvShowsUrlTemplate, setTvShowsUrlTemplate] = useState<string>(defaultTvShowUrlTemplate);

    useEffect(() => {
        const loadEmbedSettings = async () => {
            try {
                const settings = await storageService.getObject<EmbedSettings>('embedSettings');
                setTvShowsUrlTemplate(settings?.tv?.template ?? defaultTvShowUrlTemplate);
            } catch (error) {
                console.error('Failed to load preferences:', error);
            }
        };
        loadEmbedSettings();
    }, []);

    const saveEmbedSettings = async () => {
        try {
            if (await isHapticsSupported()) {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }

            const embedSettings = await storageService.getObject<EmbedSettings>('embedSettings') ?? {};

            embedSettings.tv = {
                template: tvShowsUrlTemplate,
            };

            const saved = await storageService.setObject('embedSettings', embedSettings);
            showAlert(
                saved ? 'Embed Settings Saved' : 'Saved for this Session',
                saved ? 'Your embed settings have been saved.' : 'Local storage is unavailable. Rebuild the development app to save settings between launches.',
            );
        } catch (error) {
            console.error('Failed to save embed settings:', error);
            showAlert('Error', 'Failed to save embed settings.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar />
            <SettingsPage>
                <SettingsSection
                    title="Embed URL"
                    footer={'TMDB: https://player.videasy.net/tv/{TMDBID}/{SEASON}/{EPISODE}\nIMDb: https://player.videasy.net/tv/{IMDBID}/{SEASON}/{EPISODE}'}
                >
                    <TextInput
                        style={styles.textInput}
                        value={tvShowsUrlTemplate}
                        onChangeText={setTvShowsUrlTemplate}
                        multiline
                        textAlignVertical="top"
                        placeholder="Enter your TV shows embed URL template..."
                        placeholderTextColor="#8e8e93"
                    />
                </SettingsSection>
                <SettingsSection>
                    <SettingsRow
                        title="Save Settings"
                        titleColor="#0a84ff"
                        onPress={saveEmbedSettings}
                        leading={<Ionicons name="checkmark-circle-outline" size={20} color="#0a84ff" />}
                        isLast
                    />
                </SettingsSection>
                <SettingsSection title="Ad Blocking">
                    <Text style={styles.sectionSubtitle}>
                        We recommend AdGuard DNS for blocking ads and popups system-wide.{' '}
                        <Text style={styles.linkText} onPress={() => Linking.openURL('https://adguard-dns.io/en/public-dns.html')}>
                            Follow the guide here
                        </Text>
                        {' '}to set it up on your device.
                    </Text>
                </SettingsSection>
            </SettingsPage>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    sectionSubtitle: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
    },
    textInput: {
        width: '100%',
        minHeight: 120,
        backgroundColor: '#1c1c1e',
        borderRadius: 10,
        padding: 12,
        color: '#f2f2f7',
        fontSize: 15,
    },
    saveButton: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 340,
    },
    linkText: { color: '#0a84ff', textDecorationLine: 'underline' },
});

export default EmbedTvShowsSettingsScreen;