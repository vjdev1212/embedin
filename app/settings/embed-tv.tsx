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
            console.log('Existing settings:', existingSettings);
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

    const toggleSandBoxAllowed = useCallback(() => setSandboxAllowed(prev => !prev), [setSandboxAllowed]);
    const textInputStyle = styles.darkTextInput;

    const tmdbHint = "Example (TMDB): https://player.videasy.net/tv/{TMDBID}/{SEASON}/{EPISODE}"
    const imdbHint = "Example (IMDB): https://player.videasy.net/tv/{IMDBID}/{SEASON}/{EPISODE}"

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.textInputContainer}>
                    <Text style={styles.label}>TV Shows Embed URL:</Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            textInputStyle
                        ]}
                        value={tvShowsUrlTemplate}
                        onChangeText={setTvShowsUrlTemplate}
                        multiline
                        submitBehavior={'blurAndSubmit'}
                    />
                    <View style={styles.hintContainer}>
                        <Text style={styles.hint}>{tmdbHint}</Text>
                        <Text style={styles.hint}>{imdbHint}</Text>
                    </View>
                </View>
                <View style={styles.textInputContainer}>
                    <Text style={styles.label}>Disabling this may show ads and popups.</Text>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Allow Sandbox</Text>
                        <Switch
                            value={sandboxAllowed}
                            onValueChange={toggleSandBoxAllowed}
                            style={styles.switch}
                            thumbColor={sandboxAllowed ? '#535aff' : '#ccc'}
                            trackColor={{ false: '#e0e0e0', true: '#a5afff' }}
                        />
                    </View>
                </View>
                <View style={styles.saveButton}>
                    <Pressable onPress={saveEmbedSettings}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </Pressable>
                </View>
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
    content: {
        padding: 20,
        marginTop: 20,
    },
    hintContainer:{
        marginVertical: 10,
    },
    textInputContainer: {
        marginBottom: 30,
        paddingHorizontal: 10,
        width: '100%',
    },
    label: {
        marginBottom: 10,
    },
    hint: {
        color: '#888',
        marginBottom: 10,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    textInput: {
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 16,
        paddingVertical: 10,
        minHeight: 90
    },
    lightTextInput: {
        backgroundColor: '#f0f0f0',
        color: '#000',
    },
    darkTextInput: {
        backgroundColor: '#1f1f1f',
        color: '#fff',
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#535aff',
        padding: 12,
        borderRadius: 30,
        alignSelf: 'center',
        alignItems: 'center',
        width: 150,
    },
    switchLabel: {
        fontSize: 14,
    },
    switch: {
        marginVertical: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default EmbedTvShowsSettingsScreen;