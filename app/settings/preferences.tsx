import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Text } from '@vjdev1212/media-ui-kit';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import * as Haptics from 'expo-haptics';
import { NativeTextInput } from '@vjdev1212/media-ui-kit';
import { SettingsPage, SettingsRow, SettingsSection } from '@vjdev1212/media-ui-kit';
import { storageService } from '@/utils/StorageService';
import { settingsActionBlue } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const PreferencesScreen = () => {
    const { colors, colorScheme } = useTheme();
    const inputTextStyle = {
        ...styles.inputText,
        color: colorScheme === 'dark' ? '#F2F2F7' : '#1C1C1E',
    };
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar />
            <SettingsPage>
                <SettingsSection title="Language and Region">
                    <SettingsRow
                        title="Language"
                        trailing={(
                            <NativeTextInput
                                style={styles.inputHost}
                                inputStyle={styles.inputStyle}
                                textStyle={inputTextStyle}
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
                        trailing={(
                            <NativeTextInput
                                style={styles.inputHost}
                                inputStyle={styles.inputStyle}
                                textStyle={inputTextStyle}
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
                        titleColor={settingsActionBlue}
                        onPress={savePreferences}
                        leading={<Ionicons name="checkmark-circle-outline" size={20} color={settingsActionBlue} />}
                        isLast
                    />
                </SettingsSection>
            </SettingsPage>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    inputHost: { width: 64, minHeight: 36 },
    inputStyle: { minHeight: 36, paddingHorizontal: 2, backgroundColor: 'transparent' },
    inputText: { fontSize: 16, textAlign: 'right' },
    saveButton: { width: '100%', maxWidth: 340, alignSelf: 'center' },
});

export default PreferencesScreen;
