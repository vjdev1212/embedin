import { ActivityIndicator, BlurGradientBackground, StatusBar, Text, View } from '@vjdev1212/media-ui-kit';
import { MediaGrid, GENRE_NAMES, type MediaGridItem } from '@vjdev1212/media-ui-kit';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { router, Stack } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput as NativeTextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, typography } from '@/constants/theme';
import { showAlert } from '@/utils/platform';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
type SearchFilter = 'all' | 'movie' | 'series';
const FILTER_OPTIONS: { id: SearchFilter; title: string }[] = [
  { id: 'all', title: 'All' },
  { id: 'movie', title: 'Movies' },
  { id: 'series', title: 'Series' },
];

interface TMDBSearchItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  imdb_id?: string;
  genre_ids?: number[];
  popularity?: number;
}

function toMediaItem(item: TMDBSearchItem, type: 'movie' | 'series'): MediaGridItem {
  const date = item.release_date || item.first_air_date || '';
  return {
    tmdbid: item.id,
    name: item.title || item.name || 'Untitled',
    year: date.slice(0, 4),
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '',
    background: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
    imdbRating: item.vote_average?.toFixed(1),
    imdbid: item.imdb_id,
    genres: (item.genre_ids ?? [])
      .map((id) => GENRE_NAMES[id])
      .filter((genre): genre is string => Boolean(genre)),
    type,
    popularity: item.popularity ?? 0,
  };
}

async function fetchSearchResults(query: string, signal: AbortSignal): Promise<MediaGridItem[]> {
  if (!TMDB_API_KEY) throw new Error('Search is unavailable because the TMDB API key is not configured.');
  const encodedQuery = encodeURIComponent(query);
  const endpoints = [
    { type: 'movie' as const, path: 'movie' },
    { type: 'series' as const, path: 'tv' },
  ];
  const responses = await Promise.all(endpoints.map(async ({ type, path }) => {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/${path}?query=${encodedQuery}&include_adult=false&api_key=${TMDB_API_KEY}`,
      { signal },
    );
    if (!response.ok) throw new Error(`Search request failed (${response.status}). Please try again.`);
    const result = await response.json() as { results?: TMDBSearchItem[] };
    return (result.results ?? []).map((item) => toMediaItem(item, type));
  }));
  return responses.flat().sort((left, right) => (right.popularity ?? 0) - (left.popularity ?? 0));
}

export default function SearchScreen() {
  const { colors, colorScheme } = useTheme();
  const headerHeight = useHeaderHeight();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaGridItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<SearchFilter>('all');
  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const filteredResults = useMemo(
    () => selectedFilter === 'all' ? results : results.filter((item) => item.type === selectedFilter),
    [results, selectedFilter],
  );

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setResults([]);
    setError(null);
    setLoading(true);
    const timeout = setTimeout(() => {
      void fetchSearchResults(trimmedQuery, controller.signal)
        .then(setResults)
        .catch((fetchError: unknown) => {
          if (!controller.signal.aborted) setError(fetchError instanceof Error ? fetchError.message : 'Unable to search right now.');
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 300);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [retryCount, trimmedQuery]);

  const changeQuery = (value: string) => { setQuery(value); setSelectedFilter('all'); };

  return (
    <View style={styles.container}>
      <BlurGradientBackground />
      <StatusBar />
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackVisible: false,
          headerTitle: 'Search',
          headerUserInterfaceStyle: colorScheme,
          headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
          headerSearchBarOptions: Platform.OS === 'ios' ? {
            placeholder: 'Search movies or series',
            autoCapitalize: 'none',
            hideWhenScrolling: false,
            placement: 'stacked',
            onChangeText: (event) => changeQuery(event.nativeEvent.text),
            onCancelButtonPress: () => changeQuery(''),
            onSearchButtonPress: (event) => changeQuery(event.nativeEvent.text),
          } : undefined,
        }}
      />
      {Platform.OS !== 'ios' && (
        <View style={styles.searchHeader}>
          <View style={[styles.searchField, { backgroundColor: colors.primaryCard, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={22} color={colors.text} />
            <NativeTextInput
              accessibilityLabel="Search movies or series"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="never"
              keyboardAppearance={colorScheme}
              onChangeText={changeQuery}
              placeholder="Search movies or series"
              placeholderTextColor={colors.textDim}
              returnKeyType="search"
              style={[styles.searchInput, { color: colors.text }]}
              underlineColorAndroid="transparent"
              value={query}
            />
            {query.length > 0 && (
              <Pressable
                accessibilityLabel="Clear search"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => changeQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close" size={20} color={colors.textDim} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      <SafeAreaView
        edges={['left', 'right']}
        style={[styles.container, { backgroundColor: 'transparent', paddingTop: headerHeight }]}
      >
        {trimmedQuery.length > 0 && (
          <View style={styles.filterRow}>
            <SegmentedControl
              accessibilityLabel="Filter search results"
              appearance={colorScheme}
              selectedIndex={FILTER_OPTIONS.findIndex((option) => option.id === selectedFilter)}
              style={{ backgroundColor: 'transparent' }}
              tintColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
              values={FILTER_OPTIONS.map((option) => option.title)}
              onValueChange={(value) => {
                const option = FILTER_OPTIONS.find((filter) => filter.title === value);
                if (option) setSelectedFilter(option.id);
              }}
            />
          </View>
        )}
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.statusContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : error ? (
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: colors.textMuted }]}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={() => setRetryCount((count) => count + 1)}>
                <Text style={[styles.retryText, { color: colors.primary }]}>Try again</Text>
              </Pressable>
            </View>
          ) : trimmedQuery && filteredResults.length > 0 ? (
            <MediaGrid
              detailsPath="/movie/details"
              items={filteredResults}
              safeAreaEdges={['left', 'right']}
              showGenres={false}
              yearOnSeparateLine
              onItemPress={(item) => router.push({
                pathname: item.type === 'movie' ? '/movie/details' : '/series/details',
                params: { moviedbid: String(item.tmdbid) },
              })}
              onActionError={showAlert}
            />
          ) : trimmedQuery ? (
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: colors.textMuted }]}>
                {results.length === 0 ? 'No results found' : selectedFilter === 'movie' ? 'No movies found' : 'No TV shows found'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textDim }]}>Try searching with different keywords.</Text>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: colors.textMuted }]}>Search movies and TV shows</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textDim }]}>Enter a title to get started.</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  searchField: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.capsule,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontSize: 17,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  resultsContainer: { flex: 1 },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  statusText: { textAlign: 'center', ...typography.title },
  retryText: { fontSize: 16, fontWeight: '600', padding: 8 },
  emptySubtitle: { textAlign: 'center', fontSize: 14 },
});
