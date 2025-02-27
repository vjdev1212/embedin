import { SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { StatusBar, Text, View } from '../../components/Themed';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { defaultMovieUrlTemplate, defaultSandboxAllowed, defaultSeriesUrlTemplate } from '@/constants/Embed';

const EmbedSettingsScreen = () => {
    const [movieUrlTemplate, setMovieUrlTemplate] = useState<string>(defaultMovieUrlTemplate);
    const [tvShowsUrlTemplate, setTvShowsUrlTemplate] = useState<string>(defaultSeriesUrlTemplate);
    const [sandboxAllowed, setSandboxAllowed] = useState<boolean>(defaultSandboxAllowed);
    const colorScheme = useColorScheme();

    useEffect(() => {
        const loadEmbedSettings = async () => {
            try {
                const storedEmbedSettings = await AsyncStorage.getItem('embedSettings');
                if (storedEmbedSettings) {
                    const parsedSettings = JSON.parse(storedEmbedSettings);
                    setMovieUrlTemplate(parsedSettings.movieUrlTemplate ?? defaultMovieUrlTemplate);
                    setTvShowsUrlTemplate(parsedSettings.tvShowsUrlTemplate ?? defaultSeriesUrlTemplate);
                    setSandboxAllowed(parsedSettings.sandboxAllowed ?? false);
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
            const embedSettings = {
                movieUrlTemplate,
                tvShowsUrlTemplate,
                sandboxAllowed
            };
            await AsyncStorage.setItem('embedSettings', JSON.stringify(embedSettings));
            showAlert('Embed Settings Saved', 'Your embed settings have been saved.');
        } catch (error) {
            console.error('Failed to save embed settings:', error);
            showAlert('Error', 'Failed to save embed settings.');
        }
    };

    const toggleSandBoxAllowed = useCallback(() => setSandboxAllowed(prev => !prev), [setSandboxAllowed]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.textInputContainer}>
                    <Text style={styles.label}>Movie Embed URL:</Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            colorScheme === 'dark' ? styles.darkTextInput : styles.lightTextInput,
                        ]}
                        value={movieUrlTemplate}
                        onChangeText={setMovieUrlTemplate}
                        multiline
                        submitBehavior={'blurAndSubmit'}
                    />
                </View>
                <View style={styles.textInputContainer}>
                    <Text style={styles.label}>TV Shows Embed URL:</Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            colorScheme === 'dark' ? styles.darkTextInput : styles.lightTextInput,
                        ]}
                        value={tvShowsUrlTemplate}
                        onChangeText={setTvShowsUrlTemplate}
                        multiline
                    />
                </View>
                <View style={styles.textInputContainer}>
                    <Text style={styles.label}>Enable this to prevent ads and popups:</Text>
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
                    <TouchableOpacity onPress={saveEmbedSettings}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
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
        marginTop: 30,
    },
    textInputContainer: {
        marginBottom: 30,
        paddingHorizontal: 10,
        width: '100%',
    },
    label: {
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
        fontSize: 16
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
        fontSize: 16,
    },
    switch: {
        marginVertical: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default EmbedSettingsScreen;
