import { Platform } from 'react-native';
import { NativeTabs } from 'expo-router/native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor="#0A84FF"
      backgroundColor="#000000"
    >
      <NativeTabs.Trigger name="index" contentStyle={styles.tabContent}>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house" drawable="ic_home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role={Platform.OS === 'ios' ? 'search' : undefined} contentStyle={styles.tabContent}>
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        {Platform.OS !== 'ios' && <NativeTabs.Trigger.Icon sf="magnifyingglass" drawable="ic_search" />}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings" contentStyle={styles.tabContent}>
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" drawable="ic_settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const styles = {
  tabContent: { backgroundColor: '#000000' },
};