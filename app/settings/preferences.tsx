import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, Text } from '@/components/Themed';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

const PreferencesScreen = () => {
    const [language, setLanguage] = useState('en');
    const [region, setRegion] = useState('US');

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const storedPreferences = await AsyncStorage.getItem('preferences');
                if (storedPreferences) {
                    const { language, region } = JSON.parse(storedPreferences);
                    setLanguage(language || 'en');
                    setRegion(region || 'US');
                }
            } catch (error) {
                console.error('Failed to load preferences:', error);
            }
        };
        loadPreferences();
    }, []);

    const savePreferences = async () => {
        try {
            if (isHapticsSupported()) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); // Don't await
            }
            const preferences = { language, region };
            await AsyncStorage.setItem('preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
            showAlert('Error', 'Failed to save preferences.');
            return;
        }
        showAlert('Preferences Saved', 'Your preferences have been saved.'); // Moved outside the try-catch
    };
    const textInputStyle = styles.darkSearchInput;


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.searchInputContainer}>
                    <Text style={{ color: '#888', marginBottom: 10 }}>Language Code:</Text>
                    <TextInput
                        style={[
                            styles.searchInput,
                            textInputStyle
                        ]}
                        value={language}
                        onChangeText={(text) => setLanguage(text)}
                        maxLength={2}
                        autoCapitalize="none"
                        submitBehavior={'blurAndSubmit'}
                    />
                </View>
                <View style={styles.searchInputContainer}>                    
                    <Text style={{ color: '#888', marginBottom: 10 }}>Region Code:</Text>
                    <TextInput
                        style={[
                            styles.searchInput,
                            textInputStyle
                        ]}
                        value={region}
                        onChangeText={(text) => setRegion(text.toUpperCase())}
                        maxLength={2}
                        autoCapitalize="characters"
                        submitBehavior={'blurAndSubmit'}
                    />
                </View>
                <View style={styles.saveButton}>
                    <Pressable onPress={savePreferences}>
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
    },
    searchInputContainer: {
        marginBottom: 30,
        paddingHorizontal: 10,
        width: '100%'
    },
    searchInput: {
        height: 40,
        borderRadius: 12,
        paddingLeft: 20,
        fontSize: 16,
    },
    lightSearchInput: {
        backgroundColor: '#f0f0f0',
        color: '#000',
    },
    darkSearchInput: {
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
        width: 150
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16
    },
});

export default PreferencesScreen;
