import { ScrollView, StyleSheet, TextInput, Pressable, Platform, Linking } from 'react-native';
import { StatusBar, Text, View } from '../../components/Themed';
import { confirmAction, isHapticsSupported, showAlert } from '@/utils/platform';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { defaultTvShowUrlTemplate } from '@/constants/Embed';
import { SafeAreaView } from 'react-native-safe-area-context';

const EmbedTvShowsSettingsScreen = () => {
    const [tvShowsUrlTemplate, setTvShowsUrlTemplate] = useState<string>(defaultTvShowUrlTemplate);

    useEffect(() => {
        const loadEmbedSettings = async () => {
            try {
                const storedEmbedSettings = await AsyncStorage.getItem('embedSettings');
                if (storedEmbedSettings) {
                    const parsedSettings = JSON.parse(storedEmbedSettings);
                    setTvShowsUrlTemplate(parsedSettings.tv?.template ?? defaultTvShowUrlTemplate);
                }
            } catch (error) {
                console.error('Failed to load preferences:', error);
            }
        };
        loadEmbedSettings();
    }, []);

    const saveEmbedSettings = async () => {
        try {
            if (isHapticsSupported()) {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }

            const existingSettings = await AsyncStorage.getItem('embedSettings');
            const embedSettings = existingSettings ? JSON.parse(existingSettings) : {};

            embedSettings.tv = {
                template: tvShowsUrlTemplate,
            };

            await AsyncStorage.setItem('embedSettings', JSON.stringify(embedSettings));
            showAlert('Embed Settings Saved', 'Your embed settings have been saved.');
        } catch (error) {
            console.error('Failed to save embed settings:', error);
            showAlert('Error', 'Failed to save embed settings.');
        }
    };

    const installAdGuard = async () => {
        try {
            if (isHapticsSupported()) {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }

            if (Platform.OS === 'ios') {
                const adguardProfileUrl = 'https://adguard-dns.io/public_api/v1/settings/ad1aed6b-c448-4c08-97b5-76ac3ab3cffb/doh_mobileconfig.xml';

                const canOpen = await Linking.canOpenURL(adguardProfileUrl);
                if (canOpen) {
                    await Linking.openURL(adguardProfileUrl);
                    showAlert(
                        'Install AdGuard Profile',
                        'You will be redirected to Settings. Please follow the instructions to install the AdGuard DNS profile.'
                    );
                } else {
                    showAlert('Error', 'Unable to open profile installation URL.');
                }
            } else if (Platform.OS === 'android') {
                const isConfirmed = confirmAction('AdGuard DNS Setup', 'To block ads system-wide on Android:\n\n1. Go to Settings > Network & Internet > Private DNS\n2. Select "Private DNS provider hostname"\n3. Enter: dns.adguard-dns.com\n4. Tap Save\n\nWould you like to open DNS settings now?', 'Open Settings');
                if (!isConfirmed) {
                    return;
                }
                try {
                    await Linking.openSettings();
                } catch (error) {
                    console.error('Failed to open settings:', error);
                }
            } else {
                showAlert(
                    'AdGuard Not Available',
                    'AdGuard DNS profile installation is only available on mobile devices. Please use a browser extension for ad blocking on web.'
                );
            }
        } catch (error) {
            console.error('Failed to install AdGuard:', error);
            showAlert('Error', 'Failed to initiate AdGuard installation.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar />
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {/* TV Shows URL Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>TV Shows Embed URL</Text>
                    </View>
                    
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            value={tvShowsUrlTemplate}
                            onChangeText={setTvShowsUrlTemplate}
                            multiline
                            submitBehavior={'blurAndSubmit'}
                            placeholder="Enter your TV shows embed URL template..."
                            placeholderTextColor="#666"
                        />
                    </View>
                    
                    <View style={styles.hintContainer}>
                        <Text style={styles.hintLabel}>TMDB:</Text>
                        <Text style={styles.hintText}>https://player.videasy.net/tv/{'{TMDBID}'}/{'{SEASON}'}/{'{EPISODE}'}</Text>
                        <Text style={styles.hintLabel}>IMDB:</Text>
                        <Text style={styles.hintText}>https://player.videasy.net/tv/{'{IMDBID}'}/{'{SEASON}'}/{'{EPISODE}'}</Text>
                    </View>
                </View>

                {/* AdGuard Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Ad Blocking</Text>
                        <Text style={styles.sectionSubtitle}>
                            {Platform.OS === 'ios'
                                ? 'Install AdGuard DNS profile to block ads and popups system-wide'
                                : Platform.OS === 'android'
                                    ? 'Configure Private DNS to block ads and popups system-wide'
                                    : 'AdGuard is not available on web platform'}
                        </Text>
                    </View>

                    {Platform.OS !== 'web' && (
                        <Pressable
                            style={({ pressed }) => [
                                styles.adguardButton,
                                pressed && styles.adguardButtonPressed
                            ]}
                            onPress={installAdGuard}
                        >
                            <Text style={styles.adguardButtonText}>
                                {Platform.OS === 'ios' ? '📱 Install AdGuard Profile' : '⚙️ Setup AdGuard DNS'}
                            </Text>
                            <Text style={styles.adguardButtonSubtext}>
                                {Platform.OS === 'ios'
                                    ? 'Blocks ads and Popups'
                                    : 'Configure Private DNS settings'}
                            </Text>
                        </Pressable>
                    )}                    
                </View>

                {/* Save Button */}
                <Pressable 
                    style={({ pressed }) => [
                        styles.saveButton,
                        pressed && styles.saveButtonPressed
                    ]}
                    onPress={saveEmbedSettings}
                >
                    <Text style={styles.saveButtonText}>Save Settings</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 30,
        width: '100%',
        maxWidth: 780,
        alignSelf: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    textInput: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    hintContainer: {
        gap: 8,
        marginTop: 8,
    },
    hintLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
    },
    hintText: {
        fontSize: 13,
        color: '#888',
        fontFamily: 'monospace',
        marginTop: 2,
    },
    adguardButton: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    adguardButtonPressed: {
        backgroundColor: '#252525',
        transform: [{ scale: 0.98 }],
    },
    adguardButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    adguardButtonSubtext: {
        color: '#888',
        fontSize: 13,
    },
    saveButton: {
        backgroundColor: '#535aff',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,        
        elevation: 8,
        width: 200,
        alignSelf: 'center',
    },
    saveButtonPressed: {
        backgroundColor: '#4248e6',
        transform: [{ scale: 0.98 }],
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default EmbedTvShowsSettingsScreen;