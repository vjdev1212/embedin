import { ActivityIndicator, StatusBar, Text, View } from '@/components/Themed';
import MediaGrid, { GENRE_NAMES, type MediaGridItem } from '@/components/MediaGrid';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeTextInput } from '@/components/NativeUiControls';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
type SearchFilter = 'all' | 'movie' | 'series';

interface TMDBSearchItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  popularity?: number;
}

function toMediaItem(item: TMDBSearchItem, type: 'movie' | 'series'): MediaGridItem {
  const date = item.release_date || item.first_air_date || '';
  return {
    moviedbid: item.id,
    name: item.title || item.name || 'Untitled',
    year: date.slice(0, 4),
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '',
    background: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
    imdbRating: item.vote_average?.toFixed(1),
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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaGridItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<SearchFilter>('all');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const filteredResults = useMemo(
    () => selectedFilter === 'all' ? results : results.filter((item) => item.type === selectedFilter),
    [results, selectedFilter],
  );

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

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

  const clearSearch = () => setQuery('');
  const changeQuery = (value: string) => { setQuery(value); setSelectedFilter('all'); };
  const showFilters = Boolean(trimmedQuery) && !loading && !error && !keyboardVisible;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.container}>
      <StatusBar />
      <View style={styles.searchHeader}>
        <Text style={styles.screenTitle}>Search</Text>
        <View style={styles.webSearchField}>
          <Ionicons name="search-outline" size={22} color="#ffffff" />
          <NativeTextInput
            accessibilityLabel="Search movies or series"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={changeQuery}
            onFocus={() => setKeyboardVisible(true)}
            onBlur={() => setKeyboardVisible(false)}
            placeholder="Search movies or series"
            placeholderTextColor="#8e8e93"
            style={styles.searchInputHost}
            inputStyle={styles.searchNativeInput}
            textStyle={styles.searchNativeText}
            value={query}
          />
          {query.length > 0 && (
            <Pressable accessibilityLabel="Clear search text" accessibilityRole="button" hitSlop={8} onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#d1d1d6" />
            </Pressable>
          )}
        </View>
      </View>

      {showFilters && (
        <View accessibilityRole="tablist" style={styles.filterBar}>
          {([
            { id: 'all', label: 'All' },
            { id: 'movie', label: 'Movies' },
            { id: 'series', label: 'TV Shows' },
          ] as const).map((filter) => {
            const selected = selectedFilter === filter.id;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                style={[styles.filterButton, selected && styles.selectedFilterButton]}
              >
                <Text style={[styles.filterLabel, { color: selected ? '#000000' : '#d1d1d6' }]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.statusContainer}><ActivityIndicator size="large" color="#0a84ff" /></View>
        ) : error ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => setRetryCount((count) => count + 1)}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : trimmedQuery && filteredResults.length > 0 ? (
          <MediaGrid compact detailsPath="/movie/details" items={filteredResults} safeAreaEdges={['left', 'right']} />
        ) : trimmedQuery ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {results.length === 0 ? 'No results found' : selectedFilter === 'movie' ? 'No movies found' : 'No TV shows found'}
            </Text>
            <Text style={styles.emptySubtitle}>Try searching with different keywords.</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={30} color="#8e8e93" />
            <Text style={styles.emptySubtitle}>What would you like to watch today?</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  searchHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
  screenTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', color: '#ffffff' },
  webSearchField: {
    height: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16,
    borderRadius: 999, backgroundColor: '#1c1c1e', borderWidth: StyleSheet.hairlineWidth, borderColor: '#38383a',
  },
  searchInputHost: { flex: 1, minWidth: 0 },
  searchNativeInput: { backgroundColor: 'transparent', paddingVertical: 0 },
  searchNativeText: { fontSize: 17, color: '#ffffff' },
  filterBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  filterButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#1c1c1e' },
  selectedFilterButton: { backgroundColor: '#ffffff' },
  filterLabel: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  resultsContainer: { flex: 1 },
  statusContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, gap: 10 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, gap: 12 },
  statusText: { color: '#d1d1d6', textAlign: 'center', fontSize: 22, lineHeight: 28, fontWeight: '700' },
  retryText: { color: '#0a84ff', fontSize: 16, fontWeight: '600', padding: 8 },
  emptySubtitle: { color: '#8e8e93', textAlign: 'center', fontSize: 14 },
});
