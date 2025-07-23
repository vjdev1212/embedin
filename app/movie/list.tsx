import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  View as RNView,
} from 'react-native';
import { ActivityIndicator, StatusBar, Text, View } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported } from '@/utils/platform';
import { getYear } from '@/utils/Date';

const EXPO_PUBLIC_TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

const MoviesList = () => {
  const router = useRouter();
  const { apiUrl } = useLocalSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  const getNumColumns = () => {
    const isMobile = width < 600;
    const isTablet = width >= 600 && width < 1024;

    if (isMobile) return isPortrait ? 3 : 5;
    if (isTablet) return isPortrait ? 5 : 7;
    return isPortrait ? 5 : 7; // Desktop
  };


  const numColumns = getNumColumns();
  const spacing = 16;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const response = await fetch(`${apiUrl}${separator}api_key=${EXPO_PUBLIC_TMDB_API_KEY}`);
        const result = await response.json();
        if (result?.results) {
          const list = result.results
            .filter((item: any) => item.poster_path && item.backdrop_path)
            .map((item: any) => ({
              moviedbid: item.id,
              name: item.title || item.name,
              year: getYear(item.release_date || item.first_air_date),
              poster: `https://image.tmdb.org/t/p/w780${item.poster_path}`,
              background: `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`,
              imdbRating: item.vote_average?.toFixed(1),
              imdbid: item.imdb_id,
            }));
          setData(list);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const renderItem = ({ item }: { item: any }) => {
    const year = item.year?.split('–')[0] || item.year;

    const handlePress = async () => {
      if (isHapticsSupported()) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      router.push({
        pathname: '/movie/details',
        params: { moviedbid: item.moviedbid || item.id },
      });
    };

    return (
      <Pressable
        style={[
          styles.posterContainer,
          {
            flexBasis: `${100 / numColumns}%`,
            paddingHorizontal: spacing / 2,
          },
        ]}
        onPress={handlePress}
      >
        <Image
          source={{ uri: item.poster }}
          style={[styles.posterImage, { aspectRatio: 2 / 3, width: '100%' }]}
          resizeMode="cover"
        />
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.posterTitle}>
          {item.name}
        </Text>
        <Text style={styles.posterYear}>{`★ ${item.imdbRating}   ${year}`}</Text>
      </Pressable>
    );
  };

  return (
    <RNView style={styles.container}>
      <StatusBar />
      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#535aff" />
          <Text style={styles.centeredText}>Loading</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: 'flex-start' }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </RNView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    padding: 5,
  },
  listContent: {
    paddingVertical: 20,
  },
  posterContainer: {
    marginVertical: 10,
  },
  posterImage: {
    borderRadius: 8,
    backgroundColor: '#101010',
  },
  posterTitle: {
    marginTop: 8,
    fontSize: 14,
  },
  posterYear: {
    marginTop: 4,
    fontSize: 12,
    color: '#ccc',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredText: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default MoviesList;
