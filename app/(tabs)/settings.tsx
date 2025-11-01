import React from 'react';
import { StyleSheet, Pressable, View, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics'
import { isHapticsSupported } from '@/utils/platform';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSpacing from '@/components/BottomSpacing';
import Constants from 'expo-constants';

const SettingsScreen = () => {
  const showContact = process.env.EXPO_PUBLIC_SHOW_CONTACT === 'true';
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version;

  const contactList: { title: string, route: string, icon: keyof typeof Ionicons.glyphMap }[] = [
    { title: 'Contact', route: '/settings/contact', icon: 'mail-outline' },
    { title: 'Support', route: '/settings/donate', icon: 'cash-outline' },
  ];

  const preferencesList: { title: string, route: string, icon: keyof typeof Ionicons.glyphMap }[] = [
    { title: 'Movie', route: '/settings/embed-movie', icon: 'film-outline' },
    { title: 'TV', route: '/settings/embed-tv', icon: 'tv-outline' },
  ];

  const resourcesList: { title: string, route: string, icon: keyof typeof Ionicons.glyphMap }[] = [
    { title: 'Downloads', route: '/settings/downloads', icon: 'download-outline' },
  ];

  const SettingItem = ({
    title,
    icon,
    onPress,
    isFirst = false,
    isLast = false
  }: {
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    onPress: () => void,
    isFirst?: boolean,
    isLast?: boolean
  }) => {
    return (
      <Pressable
        style={[
          styles.settingItem,
          {
            backgroundColor: '#101010',
            borderTopLeftRadius: isFirst ? 10 : 0,
            borderTopRightRadius: isFirst ? 10 : 0,
            borderBottomLeftRadius: isLast ? 10 : 0,
            borderBottomRightRadius: isLast ? 10 : 0,
          }
        ]}
        onPress={onPress}
        android_ripple={{ color: '#2C2C2E' }}
      >
        <View style={styles.leftContent}>
          <Ionicons
            name={icon}
            size={20}
            color='#535aff'
            style={styles.icon}
          />
          <Text style={[
            styles.settingText,
            { color: '#FFFFFF' }
          ]}>
            {title}
          </Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color='#8E8E93'
        />
        {!isLast && (
          <View style={styles.separator} />
        )}
      </Pressable>
    );
  };

  const onSettingsItemPress = async (item: any) => {
    if (isHapticsSupported()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: item.route });
  }

  return (
    <SafeAreaView style={[
      styles.container,
    ]}>
      <StatusBar />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* General Section */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionHeader,
            { color: '#8E8E93' }
          ]}>
            EMBED SETTINGS
          </Text>
          <View style={styles.settingsGroup}>
            {preferencesList.map((item, index) => (
              <SettingItem
                key={index}
                title={item.title}
                icon={item.icon}
                onPress={() => onSettingsItemPress(item)}
                isFirst={index === 0}
                isLast={index === preferencesList.length - 1}
              />
            ))}
          </View>
        </View>

        {resourcesList.length > 0 && (
          <View style={styles.section}>
            <Text style={[
              styles.sectionHeader,
              { color: '#8E8E93' }
            ]}>
              RESOURCES
            </Text>
            <View style={styles.settingsGroup}>
              {resourcesList.map((item, index) => (
                <SettingItem
                  key={index}
                  title={item.title}
                  icon={item.icon}
                  onPress={() => onSettingsItemPress(item)}
                  isFirst={index === 0}
                  isLast={index === resourcesList.length - 1}
                />
              ))}
            </View>
          </View>
        )}

        {/* Contact Section - Only render if showContact is true */}
        {showContact && (
          <View style={styles.section}>
            <Text style={[
              styles.sectionHeader,
              { color: '#8E8E93' }
            ]}>
              CONTACT
            </Text>
            <View style={styles.settingsGroup}>
              {contactList.map((item, index) => (
                <SettingItem
                  key={index}
                  title={item.title}
                  icon={item.icon}
                  onPress={() => onSettingsItemPress(item)}
                  isFirst={index === 0}
                  isLast={index === contactList.length - 1}
                />
              ))}
            </View>
          </View>
        )}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version: {appVersion}</Text>
        </View>
        <BottomSpacing space={50} />
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
    margin: 'auto'
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 35,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '400',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 20,
    marginRight: 20,
  },
  settingsGroup: {
    marginHorizontal: 16,
    // iOS uses subtle shadow for grouped sections
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 4, // iOS minimum touch target
    position: 'relative',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    flex: 1,
  },
  icon: {
    marginRight: 12,
    width: 22, // Fixed width for consistent alignment
  },
  separator: {
    position: 'absolute',
    bottom: 0,
    left: 50, // Start separator from where the title begins (icon width + margin + padding)
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
  },
   versionContainer: {
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  versionText: {
    color: '#ccc',
  }
});

export default SettingsScreen;