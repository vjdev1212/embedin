import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import {
  FlatList,
  StyleSheet,
  Pressable,
  View as RNView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Text, View } from './Themed';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported } from '@/utils/platform';
import { getYear } from '@/utils/Date';
import { SvgXml } from 'react-native-svg';
import { DefaultPosterImgXml } from '@/utils/Svg';

const EXPO_PUBLIC_TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

const SkeletonLoader = memo(() => {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  const skeletonBgColor = '#0f0f0f';
  const skeletonWidth = isPortrait ? 100 : 150;
  const skeletonHeight = isPortrait ? 150 : 220;

  return (
    <RNView style={styles.skeletonContainer}>
      <RNView
        style={[
          styles.skeletonImage,
          {
            backgroundColor: skeletonBgColor,
            width: skeletonWidth,
            height: skeletonHeight,
          },
        ]}
      />
    </RNView>
  );
});

interface PosterItemData {
  moviedbid: number;
  name: string;
  poster: string;
  background: string;
  year: string;
  imdbRating: string;
}

const PosterItem = memo(({ item, layout, type }: { item: PosterItemData, layout?: 'horizontal' | 'vertical', type: string }) => {
  const [imgError, setImgError] = useState(false);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  const year = useMemo(() => {
    if (item.year && typeof item.year === 'string' && item.year.includes('–')) {
      return item.year.split('–')[0];
    }
    return item.year;
  }, [item.year]);

  const posterUri = item.poster; // Always use poster

  const handleImageLoad = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePress = useCallback(async () => {
    if (isHapticsSupported()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    router.push({
      pathname: type === 'movie' ? '/movie/details' : '/series/details',
      params: { moviedbid: item.moviedbid },
    });
  }, [item.moviedbid, type]);

  const handleHoverIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleHoverOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const posterImageBgColor = '#0f0f0f';
  
  const posterYearColor = useMemo(() => ({
    color: '#afafaf',
  }), []);

  const imageDimensions = useMemo(() => ({
    width: isPortrait ? 100 : 150,
    height: isPortrait ? 150 : 220,
  }), [isPortrait]);

  const handleImageError = useCallback(() => setImgError(true), []);

  return (
    <Pressable
      style={[styles.posterContainer, layout === 'vertical' && styles.verticalContainer]}
      onPress={handlePress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
    >
      <Animated.View>
        {!imgError ? (
          <Animated.Image
            source={{ uri: posterUri }}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={[
              styles.posterImage,
              layout === 'vertical' ? styles.verticalImage : styles.horizontalImage,
              {
                opacity: fadeAnim,
                backgroundColor: posterImageBgColor,
                ...imageDimensions,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.posterImagePlaceHolder,
              layout === 'vertical' ? styles.verticalImage : styles.horizontalImage,
              {
                backgroundColor: posterImageBgColor,
                width: 100,
                height: 150,
              },
            ]}
          >
            <SvgXml xml={DefaultPosterImgXml} />
          </View>
        )}
      </Animated.View>

      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.posterTitle, { maxWidth: 100 }]}
      >
        {item.name}
      </Text>
      <Text style={[styles.posterYear, posterYearColor]}>
        {`★ ${item.imdbRating}   ${year}`}
      </Text>
    </Pressable>
  );
});

const PosterList = ({
  apiUrl,
  title,
  type,
  layout = 'horizontal',
}: {
  apiUrl: string;
  title: string;
  type: 'movie' | 'series';
  layout?: 'horizontal' | 'vertical';
}) => {
  const [data, setData] = useState<PosterItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const skeletonData = useMemo(() => new Array(10).fill(null), []);

  const processMovieData = useCallback((collection: any[]): PosterItemData[] => {
    return collection
      .filter((movie: any) => movie.poster_path && movie.backdrop_path)
      .map((movie: any) => ({
        moviedbid: movie.id,
        name: movie.title,
        poster: `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
        background: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
        year: getYear(movie.release_date),
        imdbRating: movie.vote_average?.toFixed(1),
      }));
  }, []);

  const processSeriesData = useCallback((collection: any[]): PosterItemData[] => {
    return collection
      .filter((series: any) => series.poster_path && series.backdrop_path)
      .map((series: any) => ({
        moviedbid: series.id,
        name: series.name,
        poster: `https://image.tmdb.org/t/p/w780${series.poster_path}`,
        background: `https://image.tmdb.org/t/p/w1280${series.backdrop_path}`,
        year: getYear(series.first_air_date),
        imdbRating: series.vote_average?.toFixed(1),
      }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const response = await fetch(`${apiUrl}${separator}api_key=${EXPO_PUBLIC_TMDB_API_KEY}`);
        const result = await response.json();
        const collection = result.results;

        const list = type === 'movie' 
          ? processMovieData(collection)
          : processSeriesData(collection);

        setData(list);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, type, processMovieData, processSeriesData]);

  const handleSeeAllPress = useCallback(async () => {
    if (isHapticsSupported()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    router.push({
      pathname: `/${type}/list`,
      params: { apiUrl, title, type },
    });
  }, [apiUrl, title, type]);

  const renderPosterItem = useCallback(({ item }: { item: PosterItemData }) => (
    <PosterItem item={item} layout={layout} type={type} />
  ), [layout, type]);

  const renderSkeletonItem = useCallback(() => <SkeletonLoader />, []);

  const keyExtractor = useCallback((item: PosterItemData, index: number) => 
    item ? `${item.moviedbid}-${index}` : index.toString(), 
    []
  );

  const skeletonKeyExtractor = useCallback((_: null, index: number) => index.toString(), []);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <RNView style={styles.container}>
      <RNView style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>See All</Text>
        </Pressable>
      </RNView>

      {loading ? (
        <FlatList
          data={skeletonData}
          renderItem={renderSkeletonItem}
          keyExtractor={skeletonKeyExtractor}
          horizontal={layout === 'horizontal'}
          showsHorizontalScrollIndicator={false}
          numColumns={layout === 'vertical' ? 2 : 1}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
        />
      ) : (
        <FlatList
          data={data}
          renderItem={renderPosterItem}
          keyExtractor={keyExtractor}
          horizontal={layout === 'horizontal'}
          showsHorizontalScrollIndicator={false}
          numColumns={layout === 'vertical' ? 2 : 1}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          getItemLayout={layout === 'horizontal' ? (data: ArrayLike<PosterItemData> | null | undefined, index: number) => ({
            length: 120,
            offset: 120 * index,
            index,
          }) : undefined}
        />
      )}
    </RNView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  posterContainer: {
    padding: 10,
  },
  verticalContainer: {
    flex: 1,
    marginBottom: 10,
  },
  posterImagePlaceHolder: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  posterImage: {
    borderRadius: 8,
  },
  horizontalImage: {
    width: 100,
    height: 150,
    borderRadius: 8
  },
  verticalImage: {
    flex: 1,
    aspectRatio: 2 / 3,
  },
  posterTitle: {
    marginTop: 8,
    width: '100%',
    overflow: 'hidden',
    fontSize: 14,
  },
  posterYear: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
  skeletonContainer: {
    marginRight: 15,
    width: 100,
    alignItems: 'center',
  },
  skeletonImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#888888',
    borderRadius: 8,
  },
});

export default PosterList;