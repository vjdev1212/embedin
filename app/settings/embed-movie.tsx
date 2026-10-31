import { Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Text } from '../../components/Themed';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { defaultMovieUrlTemplate } from '@/constants/Embed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeTextInput } from '@/components/NativeUiControls';
import { SettingsPage, SettingsRow, SettingsSection, SettingsTitle } from '@/components/NativeSettings';
import { storageService } from '@/utils/StorageService';

interface EmbedSettings {
    movie?: { template?: string };
    tv?: { template?: string };
}

const EmbedMovieSettingsScreen = () => {
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
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar />
            <SettingsPage>
                <SettingsTitle title="Movie Embed" subtitle="Choose the player URL used for movies." />
                <SettingsSection title="Embed URL" footer="Use {TMDBID} or {IMDBID} as the movie identifier.">
                    <NativeTextInput
                        style={styles.inputHost}
                        inputStyle={styles.textInput}
                        textStyle={styles.inputText}
                        value={movieUrlTemplate}
                        onChangeText={setMovieUrlTemplate}
                        multiline
                        placeholder="Enter your movie embed URL template..."
                        placeholderTextColor="#8e8e93"
                    />
                    <Text style={styles.example}>TMDB: https://player.videasy.net/movie/{'{TMDBID}'}</Text>
                    <Text style={styles.example}>IMDB: https://player.videasy.net/movie/{'{IMDBID}'}</Text>
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
                <SettingsSection>
                    <SettingsRow
                        title="Save Settings"
                        titleColor="#0a84ff"
                        onPress={saveEmbedSettings}
                        leading={<Ionicons name="checkmark-circle-outline" size={20} color="#0a84ff" />}
                        isLast
                    />
                </SettingsSection>
            </SettingsPage>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    inputHost: { width: '100%', minHeight: 120, marginBottom: 8 },
    sectionSubtitle: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
    },
    textInput: {
        backgroundColor: '#1c1c1e',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#38383a',
    },
    inputText: { color: '#f2f2f7', fontSize: 15 },
    example: { fontSize: 13, color: '#8e8e93', fontFamily: 'monospace', marginTop: 6 },
    saveButton: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 340,
    },
    linkText: { color: '#0a84ff', textDecorationLine: 'underline' },
});

export default EmbedMovieSettingsScreen;