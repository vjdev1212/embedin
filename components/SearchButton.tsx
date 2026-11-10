import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@vjdev1212/media-ui-kit';
import { NativeButton } from '@vjdev1212/media-ui-kit';
import { settingsActionBlue } from '@/constants/theme';

const SearchButton = ({ onPress, text }: { onPress: () => void, text: string }) => (
  <NativeButton style={[styles.button, { backgroundColor: settingsActionBlue }]} onPress={onPress} variant="filled">
    <Ionicons name="search" size={20} color="#fff" style={styles.icon} />
    <Text style={styles.text}>Search {text}</Text>
  </NativeButton>
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  icon: {
    marginRight: 8,
  }
});

export default SearchButton;
