import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';

const PreferencesScreen = () => {
    const [language, setLanguage] = useState('en');
    const [region, setRegion] = useState('US');
    const colorScheme = useColorScheme();

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

    const savePreferences = async (key: string, value: string) => {
        try {
            const currentPreferences = await AsyncStorage.getItem('preferences');
            const preferences = currentPreferences ? JSON.parse(currentPreferences) : {};
            preferences[key] = value;
            await AsyncStorage.setItem('preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.searchInputContainer}>
                    <Text style={{ color: '#888', marginBottom: 10 }}>Language Code:</Text>
                    <TextInput
                        style={[
                            styles.searchInput,
                            colorScheme === 'dark' ? styles.darkSearchInput : styles.lightSearchInput,
                        ]}
                        value={language}
                        onChangeText={(text) => {
                            setLanguage(text);
                            savePreferences('language', text);
                        }}
                        maxLength={2}
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.searchInputContainer}>
                    <Text style={{ color: '#888', marginBottom: 10 }}>Region Code:</Text>
                    <TextInput
                        style={[
                            styles.searchInput,
                            colorScheme === 'dark' ? styles.darkSearchInput : styles.lightSearchInput,
                        ]}
                        value={region}
                        onChangeText={(text) => {
                            setRegion(text.toUpperCase());
                            savePreferences('region', text.toUpperCase());
                        }}
                        maxLength={2}
                        autoCapitalize="characters"
                    />
                </View>

                <View style={styles.saveButton}     >
                    <TouchableOpacity
                        onPress={async () => {
                            await savePreferences('language', language);
                            await savePreferences('region', region);
                        }}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
        width: '100%',
        maxWidth: 780,
        alignSelf: 'center',
    },
    content: {
        padding: 20,
    },
    searchInputContainer: {
        marginTop: 30,
        paddingHorizontal: 20,
        width: '100%',
        maxWidth: 780,
        margin: 'auto',
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
        marginTop: 50,
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
