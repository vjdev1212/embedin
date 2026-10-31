import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Text } from '@/components/Themed';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeTextInput } from '@/components/NativeUiControls';
import { SettingsPage, SettingsRow, SettingsSection, SettingsTitle } from '@/components/NativeSettings';
import { storageService } from '@/utils/StorageService';

const PreferencesScreen = () => {
    const [language, setLanguage] = useState('en');
    const [region, setRegion] = useState('US');

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const preferences = await storageService.getObject<{ language?: string; region?: string }>('preferences');
                setLanguage(preferences?.language || 'en');
                setRegion(preferences?.region || 'US');
            } catch (error) {
                console.error('Failed to load preferences:', error);
            }
        };
        loadPreferences();
    }, []);

    const savePreferences = async () => {
        try {
            if (await isHapticsSupported()) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); // Don't await
            }
            const preferences = { language, region };
            const saved = await storageService.setObject('preferences', preferences);
            if (!saved) {
                showAlert('Saved for this Session', 'Local storage is unavailable. Rebuild the development app to save preferences between launches.');
                return;
            }
        } catch (error) {
            console.error('Failed to save preferences:', error);
            showAlert('Error', 'Failed to save preferences.');
            return;
        }
        showAlert('Preferences Saved', 'Your preferences have been saved.'); // Moved outside the try-catch
    };
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar />
            <SettingsPage>
                <SettingsTitle title="Preferences" subtitle="Set the language and region used for discovery." />
                <SettingsSection title="Language and Region">
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Language Code</Text>
                        <NativeTextInput
                            style={styles.inputHost}
                            inputStyle={styles.searchInput}
                            textStyle={styles.inputText}
                            value={language}
                            onChangeText={setLanguage}
                            maxLength={2}
                            autoCapitalize="none"
                            accessibilityLabel="Language code"
                        />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Region Code</Text>
                        <NativeTextInput
                            style={styles.inputHost}
                            inputStyle={styles.searchInput}
                            textStyle={styles.inputText}
                            value={region}
                            onChangeText={(text) => setRegion(text.toUpperCase())}
                            maxLength={2}
                            autoCapitalize="characters"
                            accessibilityLabel="Region code"
                        />
                    </View>
                </SettingsSection>
                <SettingsSection>
                    <SettingsRow
                        title="Save"
                        titleColor="#0a84ff"
                        onPress={savePreferences}
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
    field: { paddingVertical: 8, paddingHorizontal: 16, gap: 8 },
    fieldLabel: { color: '#8e8e93', fontSize: 13 },
    inputHost: { width: '100%' },
    searchInput: { minHeight: 40, backgroundColor: '#1c1c1e', borderRadius: 8, paddingHorizontal: 12 },
    inputText: { color: '#f2f2f7', fontSize: 16 },
    saveButton: { width: '100%', maxWidth: 340, alignSelf: 'center' },
});

export default PreferencesScreen;
