import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Text } from '@vjdev1212/media-ui-kit';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import * as Haptics from 'expo-haptics';
import { NativeTextInput } from '@vjdev1212/media-ui-kit';
import { SettingsPage, SettingsRow, SettingsSection } from '@vjdev1212/media-ui-kit';
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
        <View style={styles.container}>
            <StatusBar />
            <SettingsPage>
                <SettingsSection title="Language and Region">
                    <SettingsRow
                        title="Language"
                        detail="Language Code"
                        trailing={(
                            <NativeTextInput
                                style={styles.inputHost}
                                inputStyle={styles.inputStyle}
                                textStyle={styles.inputText}
                                value={language}
                                onChangeText={setLanguage}
                                maxLength={2}
                                autoCapitalize="none"
                                accessibilityLabel="Language code"
                            />
                        )}
                    />
                    <SettingsRow
                        title="Region"
                        detail="Region Code"
                        trailing={(
                            <NativeTextInput
                                style={styles.inputHost}
                                inputStyle={styles.inputStyle}
                                textStyle={styles.inputText}
                                value={region}
                                onChangeText={(text) => setRegion(text.toUpperCase())}
                                maxLength={2}
                                autoCapitalize="characters"
                                accessibilityLabel="Region code"
                            />
                        )}
                        isLast
                    />
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    inputHost: { width: 64, minHeight: 36 },
    inputStyle: { minHeight: 36, paddingHorizontal: 2, backgroundColor: 'transparent' },
    inputText: { color: '#f2f2f7', fontSize: 16, textAlign: 'right' },
    saveButton: { width: '100%', maxWidth: 340, alignSelf: 'center' },
});

export default PreferencesScreen;
