import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View as RNView,
  Animated,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import { View } from './Themed';
import { useColorScheme } from './useColorScheme';

const MediaContentPoster = ({
  background,
  isPortrait,
}: {
  background: string;
  isPortrait: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const scaleAnim = useState(() => new Animated.Value(1))[0];
  const colorScheme = useColorScheme();

  useEffect(() => {
    const imageLoader = setTimeout(() => {
      setIsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 500);

    return () => clearTimeout(imageLoader);
  }, []);

  const handleHoverIn = () => {
    if (Platform.OS === 'web') {
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const Wrapper = Platform.OS === 'web' ? Pressable : RNView;

  return (
    <View
      style={[
        styles.posterContainer,
        {
          aspectRatio: isPortrait ? 4 / 3 : 16 / 9,
        },
      ]}
    >
      {isLoading ? (
        <RNView style={styles.skeletonBackground} />
      ) : (
        <Wrapper
          onHoverIn={handleHoverIn}
          onHoverOut={handleHoverOut}
          style={{ width: '100%', height: '100%' }}
        >
          <Animated.View
            style={{
              width: '100%',
              height: '100%',
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Image
              source={{ uri: background }}
              resizeMode={isPortrait ? 'cover' : 'contain'}
              style={[
                styles.poster,
                {
                  borderRadius: isPortrait ? 0 : 10,
                },
              ]}
            />
          </Animated.View>
        </Wrapper>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  posterContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  skeletonBackground: {
    width: '100%',
    height: '100%',
    opacity: 0.1
  },
});

export default MediaContentPoster;
