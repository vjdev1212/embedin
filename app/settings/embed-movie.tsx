import { Linking, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Text } from '@vjdev1212/media-ui-kit';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { defaultMovieUrlTemplate } from '@/constants/Embed';
import { SettingsPage, SettingsRow, SettingsSection } from '@vjdev1212/media-ui-kit';
import { storageService } from '@/utils/StorageService';
import { settingsActionBlue } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface EmbedSettings {
    movie?: { template?: string };
    tv?: { template?: string };
}

const EmbedMovieSettingsScreen = () => {
    const { colors, colorScheme } = useTheme();
    const [movieUrlTemplate, setMovieUrlTemplate] = useState<string>(defaultMovieUrlTemplate);

    useEffect(() => {
        const loadEmbedSettings = async () => {
            try {
                const settings = await storageService.getObject<EmbedSettings>('embedSettings');
                setMovieUrlTemplate(settings?.movie?.template ?? defaultMovieUrlTemplate);
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

            embedSettings.movie = {
                template: movieUrlTemplate,
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar />
            <SettingsPage>
                <SettingsSection
                    title="Embed URL"
                    footer={'TMDB: https://vidy.st/movie/{TMDBID}\nIMDb: https://vidy.st/movie/{IMDBID}'}
                >
                    <TextInput
                        style={[styles.textInput, { backgroundColor: colors.primaryCard, color: colors.text }]}
                        value={movieUrlTemplate}
                        onChangeText={setMovieUrlTemplate}
                        multiline
                        textAlignVertical="top"
                        placeholder="Enter your movie embed URL template..."
                        placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#6C6C70'}
                    />
                </SettingsSection>
                <SettingsSection>
                    <SettingsRow
                        title="Save Settings"
                        titleColor={settingsActionBlue}
                        onPress={saveEmbedSettings}
                        leading={<Ionicons name="checkmark-circle-outline" size={20} color={settingsActionBlue} />}
                        isLast
                    />
                </SettingsSection>
                <SettingsSection title="Ad Blocking">
                    <Text style={[styles.sectionSubtitle, { color: colors.textDim }]}>
                        We recommend AdGuard DNS for blocking ads and popups system-wide.{' '}
                        <Text style={[styles.linkText, { color: settingsActionBlue }]} onPress={() => Linking.openURL('https://adguard-dns.io/en/public-dns.html')}>
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
    container: { flex: 1 },
    sectionSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    textInput: {
        width: '100%',
        minHeight: 120,
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
    },
    saveButton: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 340,
    },
    linkText: { textDecorationLine: 'underline' },
});

export default EmbedMovieSettingsScreen;