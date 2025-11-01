import { SafeAreaView, ScrollView, StyleSheet, TextInput, Switch, Pressable } from 'react-native';
import { StatusBar, Text, View } from '../../components/Themed';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { defaultTvShowUrlTemplate, defaultSandboxAllowedForTv } from '@/constants/Embed';

const EmbedTvShowsSettingsScreen = () => {
    const [tvShowsUrlTemplate, setTvShowsUrlTemplate] = useState<string>(defaultTvShowUrlTemplate);
    const [sandboxAllowed, setSandboxAllowed] = useState<boolean>(defaultSandboxAllowedForTv);

    useEffect(() => {
        const loadEmbedSettings = async () => {
            try {
                const storedEmbedSettings = await AsyncStorage.getItem('embedSettings');
                if (storedEmbedSettings) {
                    const parsedSettings = JSON.parse(storedEmbedSettings);
                    setTvShowsUrlTemplate(parsedSettings.tv?.template ?? defaultTvShowUrlTemplate);
                    setSandboxAllowed(parsedSettings.tv?.sandboxAllowed ?? defaultSandboxAllowedForTv);
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
                sandboxAllowed: sandboxAllowed,
            };

            await AsyncStorage.setItem('embedSettings', JSON.stringify(embedSettings));
            showAlert('Embed Settings Saved', 'Your embed settings have been saved.');
        } catch (error) {
            console.error('Failed to save embed settings:', error);
            showAlert('Error', 'Failed to save embed settings.');
        }
    };

    const toggleSandBoxAllowed = useCallback(() => setSandboxAllowed(prev => !prev), []);

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

                {/* Sandbox Settings Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Security Settings</Text>
                        <Text style={styles.sectionSubtitle}>Disabling this may show ads and popups</Text>
                    </View>
                    
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Allow Sandbox</Text>
                            <Text style={styles.settingDescription}>
                                Enables secure iframe sandboxing
                            </Text>
                        </View>
                        <Switch
                            value={sandboxAllowed}
                            onValueChange={toggleSandBoxAllowed}
                            thumbColor={sandboxAllowed ? '#535aff' : '#f4f3f4'}
                            trackColor={{ false: '#767577', true: '#a5afff' }}
                            ios_backgroundColor="#767577"
                        />
                    </View>
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
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
    saveButton: {
        backgroundColor: '#535aff',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,        
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