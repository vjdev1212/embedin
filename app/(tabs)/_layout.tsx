import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/components/useColorScheme';
import { Platform, StyleSheet, View } from 'react-native';
import { isHapticsSupported } from '@/utils/platform';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}


export default function TabLayout() {

  const colorScheme = useColorScheme();
  const getTabBarHeight = () => {
    switch (Platform.OS) {
      case 'web':
        return 70;
      case 'ios':
        return 85;
      default:
        return 65;
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#535aff',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: getTabBarHeight(),
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              intensity={50}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: () => {
            if (isHapticsSupported()) {
              Haptics.selectionAsync();
            }
          },
        }}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          tabBarIconStyle: { marginVertical: 5 }
        }}
      />
      <Tabs.Screen
        name="search"
        listeners={{
          tabPress: () => {
            if (isHapticsSupported()) {
              Haptics.selectionAsync();
            }
          },
        }}
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          tabBarIconStyle: { marginVertical: 5 },
        }}
      />
      <Tabs.Screen
        name="settings"
        listeners={{
          tabPress: () => {
            if (isHapticsSupported()) {
              Haptics.selectionAsync();
            }
          },
        }}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
          tabBarIconStyle: { marginVertical: 5 },
        }}
      />
    </Tabs>
  );
}
