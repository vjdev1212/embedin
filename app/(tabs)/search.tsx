import { Text, ActivityIndicator, TextInput, View, StatusBar } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { Animated, View as RNView, SafeAreaView, ScrollView, useWindowDimensions } from 'react-native';
import { StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported } from '@/utils/platform';
import { getYear } from '@/utils/Date';
import BottomSpacing from '@/components/BottomSpacing';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

const SearchScreen = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<any>(null);

  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;
  const shortSide = Math.min(width, height);

  const isMobile = shortSide < 580;
  const isTablet = shortSide >= 580 && shortSide < 1024;
  const isLaptop = shortSide >= 1024 && shortSide < 1440;
  const isDesktop = shortSide >= 1440;

  const postersPerScreen = useMemo(() => {
    if (isMobile) return isPortrait ? 3 : 5;
    if (isTablet) return isPortrait ? 5 : 7;
    if (isLaptop) return isPortrait ? 6 : 8;
    if (isDesktop) return isPortrait ? 7 : 10;
    return 5;
  }, [shortSide, isPortrait]);

  const spacing = 12;
  const posterWidth = useMemo(() => {
    const totalSpacing = spacing * (postersPerScreen - 1);
    return (width - totalSpacing - 20) / postersPerScreen;
  }, [width, postersPerScreen]);
  const posterHeight = posterWidth * 1.5;

  const fetchData = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const [moviesResponse, seriesResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`),
        fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`),
      ]);

      const moviesResult = await moviesResponse.json();
      const seriesResult = await seriesResponse.json();

      const movieList = moviesResult.results
        .filter((movie: any) => movie.poster_path && movie.backdrop_path)
        .map((movie: any) => ({
          moviedbid: movie.id,
          name: movie.title,
          poster: `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
          background: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
          year: getYear(movie.release_date),
        }));

      const seriesList = seriesResult.results
        .filter((series: any) => series.poster_path && series.backdrop_path)
        .map((series: any) => ({
          moviedbid: series.id,
          name: series.name,
          poster: `https://image.tmdb.org/t/p/w780${series.poster_path}`,
          background: `https://image.tmdb.org/t/p/w1280${series.backdrop_path}`,
          year: getYear(series.first_air_date),
        }));

      setMovies(movieList);
      setSeries(seriesList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (!query.trim()) {
      clearSearch(); // Don't return it!
      return;
    }

    const timeout = setTimeout(() => {
      fetchData(); // Call it, don't return it
    }, 500);

    setDebounceTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [query]);

  const PosterContent = ({ item, type }: { item: any; type: string }) => {
    const scaleAnim = new Animated.Value(1);

    const handlePress = async () => {
      if (isHapticsSupported()) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      router.push({
        pathname: type === 'movie' ? '/movie/details' : '/series/details',
        params: { moviedbid: item.moviedbid },
      });
    };

    const handleHoverIn = () => Animated.spring(scaleAnim, { toValue: 1.1, useNativeDriver: true }).start();
    const handleHoverOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Pressable
        style={[styles.posterContainer, { width: posterWidth, marginRight: spacing }]}
        onPress={handlePress}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
      >
        <Image source={{ uri: item.poster }} style={[styles.posterImage, { width: posterWidth, height: posterHeight }]} />
        <Text numberOfLines={1} style={styles.posterTitle}>{item.name}</Text>
        <Text style={styles.posterYear}>{item.year}</Text>
      </Pressable>
    );
  };

  const clearSearch = async () => {
    if (isHapticsSupported()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    setQuery('');
    setMovies([]);
    setSeries([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <View style={styles.searchInputContainer}>
        <TextInput
          style={[styles.searchInput, styles.darkSearchInput]}
          placeholder="Search movies or series..."
          placeholderTextColor="#888888"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable onPress={clearSearch} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </Pressable>
        )}
      </View>

      {loading && <ActivityIndicator size="large" color="#535aff" style={styles.loader} />}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.searchResultsContainer}>
        {!loading && movies.length === 0 && series.length === 0 && (
          <View style={styles.centeredContainer}>
            <Ionicons name="search-outline" color="#535aff" size={70} style={styles.noResults} />
            <Text style={styles.noResultsText}>
              {query.length > 0 ? 'No results found.' : 'What would you like to watch today?'}
            </Text>
          </View>
        )}

        {movies.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Movies</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
              <RNView style={styles.postersRow}>
                {movies.map((movie, i) => <PosterContent key={`movie-${i}`} item={movie} type="movie" />)}
              </RNView>
            </ScrollView>
          </View>
        )}

        {series.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Series</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
              <RNView style={styles.postersRow}>
                {series.map((s, i) => <PosterContent key={`series-${i}`} item={s} type="series" />)}
              </RNView>
            </ScrollView>
          </View>
        )}
      </ScrollView>
      <BottomSpacing space={50} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 20 },
  searchInputContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 780,
    margin: 'auto',
  },
  searchInput: {
    height: 40,
    borderRadius: 25,
    paddingLeft: 20,
    paddingRight: 40,
    fontSize: 16,
  },
  darkSearchInput: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
  },
  clearIcon: {
    position: 'absolute',
    right: 30,
    justifyContent: 'center',
    height: 40,
  },
  loader: {
    marginTop: 20
  },
  searchResultsContainer: {
    marginVertical: 10,
    marginHorizontal: 10
  },
  horizontalScrollView: {
    flexGrow: 0
  },
  postersRow: { flexDirection: 'row' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  posterContainer: {
    marginBottom: 10,
  },
  posterImage: {
    borderRadius: 8,
    backgroundColor: '#101010',
  },
  posterTitle: {
    marginTop: 8,
    fontSize: 14,
    maxWidth: 100,
  },
  posterYear: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResults: {
    marginTop: 100,
    paddingBottom: 20,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: '5%',
    color: '#888',
  },
});

export default SearchScreen;
