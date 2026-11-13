import { router, useFocusEffect } from 'expo-router';
import React, { useState, useMemo, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar, Text, PosterList, BottomSpacing } from '@vjdev1212/media-ui-kit';
import { PosterCarousel } from '@vjdev1212/media-ui-kit';
import type { CarouselSource, PosterListSource } from '@vjdev1212/media-ui-kit';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported, showAlert } from '@/utils/platform';
import { CatalogUrl } from '@/constants/Tmdb';
import { useTheme } from '@/context/ThemeContext';
import { NativeButton } from '@vjdev1212/media-ui-kit';
import { radius, spacing, typography } from '@/constants/theme';
import {
  DEFAULT_HOME_PREFERENCES,
  getVisibleHomeSections,
  loadHomePreferences,
  type HomePreferences,
} from '@/utils/HomeCustomization';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'movies' | 'series'>('all');
  const [homePreferences, setHomePreferences] = useState<HomePreferences>(DEFAULT_HOME_PREFERENCES);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesError, setPreferencesError] = useState(false);
  const [preferencesRetry, setPreferencesRetry] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setPreferencesLoading(true);
    setPreferencesError(false);
    void loadHomePreferences()
      .then((preferences) => {
        if (!active) return;
        setHomePreferences(preferences);
        setPreferencesLoaded(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('Failed to load home screen preferences:', error);
        setPreferencesError(true);
        showAlert('Unable to Load Catalogues', 'Your saved catalogue settings could not be read.');
      })
      .finally(() => {
        if (active) setPreferencesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [preferencesRetry]));

  const filters: {
    key: 'all' | 'movies' | 'series';
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }[] = [
    { key: 'all', label: 'All', icon: 'albums-outline' },
    { key: 'movies', label: 'Movies', icon: 'film-outline' },
    { key: 'series', label: 'Series', icon: 'tv-outline' },
  ];

  const activeLists = useMemo(
    () => getVisibleHomeSections(homePreferences, filter),
    [filter, homePreferences],
  );

  const fallbackCarouselSources = useMemo((): CarouselSource[] => {
    if (filter === 'movies') {
      return [{ apiUrl: CatalogUrl.trendingMovies, type: 'movie' }];
    }
    if (filter === 'series') {
      return [{ apiUrl: CatalogUrl.trendingSeries, type: 'series' }];
    }
    return [
      { apiUrl: CatalogUrl.trendingMovies, type: 'movie' },
      { apiUrl: CatalogUrl.trendingSeries, type: 'series' },
    ];
  }, [filter]);

  const carouselSources = useMemo((): CarouselSource[] => {
    const configuredSources = activeLists.flatMap((list) => (
      list.sources
        ? list.sources.map((source) => ({
          apiUrl: source.apiUrl,
          type: source.mediaType,
          minimumPopularity: source.minimumPopularity,
        }))
        : [{
          apiUrl: list.apiUrl,
          type: list.mediaType === 'any' ? 'movie' as const : list.mediaType,
          minimumPopularity: list.minimumPopularity,
        }]
    ));
    return configuredSources.length > 0 ? configuredSources : fallbackCarouselSources;
  }, [activeLists, fallbackCarouselSources]);

  const handleFilterChange = useCallback(async (newFilter: 'all' | 'movies' | 'series') => {
    if (await isHapticsSupported()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(newFilter);
  }, []);

  const handleCarouselItemPress = useCallback((item: any) => {
    const type = item.type === 'movie' ? 'movie' : 'series';
    router.push({ pathname: `/${type}/details`, params: { moviedbid: item.tmdbid } });
  }, []);

  const handlePosterItemPress = useCallback(async (tmdbId: number, type: 'movie' | 'series') => {
    if (await isHapticsSupported()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: `/${type}/details`, params: { moviedbid: tmdbId } });
  }, []);

  const handlePosterSeeAllPress = useCallback(async (
    apiUrl: string,
    title: string,
    type: 'movie' | 'series' | 'any',
    minimumPopularity?: number,
    sources?: PosterListSource[],
  ) => {
    if (await isHapticsSupported()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'any') {
      router.push({
        pathname: '/movie/list',
        params: {
          apiUrl,
          title,
          mediaType: 'any',
          movieApiUrl: sources?.find((source) => source.type === 'movie')?.apiUrl ?? '',
          seriesApiUrl: sources?.find((source) => source.type === 'series')?.apiUrl ?? '',
          ...(minimumPopularity !== undefined ? { minimumPopularity: String(minimumPopularity) } : {}),
        },
      });
      return;
    }
    router.push({
      pathname: `/${type}/list`,
      params: {
        apiUrl,
        title,
        ...(minimumPopularity !== undefined ? { minimumPopularity: String(minimumPopularity) } : {}),
      },
    });
  }, []);

  const renderCatalogList = useCallback(({ item }: { item: (typeof activeLists)[number] }) => (
    <PosterList
      apiUrl={item.apiUrl}
      title={item.title}
      type={item.mediaType}
      sources={item.sources?.map((source) => ({ ...source, type: source.mediaType }))}
      minimumPopularity={item.minimumPopularity}
      onItemPress={handlePosterItemPress}
      onSeeAllPress={handlePosterSeeAllPress}
    />
  ), [handlePosterItemPress, handlePosterSeeAllPress]);

  const listHeader = (
    <>
      <PosterCarousel
        apiKey={TMDB_API_KEY}
        posterLists={carouselSources}
        onItemPress={handleCarouselItemPress}
        autoPlay
        autoPlayInterval={6000}
        topInset={Platform.OS === 'ios' ? insets.top : 0}
      />
      <View style={styles.contentContainer}>
        <View style={styles.filtersContainer}>
          {filters.map((item) => (
            <NativeButton
              key={item.key}
              variant="text"
              style={[
                styles.filterButton,
                {
                  backgroundColor: filter === item.key ? colors.primary : colors.primaryCard,
                  borderColor: filter === item.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleFilterChange(item.key)}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={filter === item.key ? colors.onPrimary : colors.textMuted}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  { color: filter === item.key ? colors.onPrimary : colors.textMuted },
                  filter === item.key && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </NativeButton>
          ))}
          <NativeButton
            variant="text"
            style={[styles.filterButton, { backgroundColor: colors.primaryCard, borderColor: colors.border }]}
            onPress={() => router.push('/settings/home')}
            accessibilityLabel="Catalogue settings"
          >
            <Ionicons name="settings-outline" size={18} color={colors.textMuted} />
          </NativeButton>
        </View>
        {preferencesError && preferencesLoaded ? (
          <View style={styles.refreshError}>
            <Text style={{ color: colors.textMuted }}>Could not refresh catalogue settings.</Text>
            <NativeButton variant="text" onPress={() => setPreferencesRetry((value) => value + 1)}>
              <Text style={{ color: colors.primary }}>Retry</Text>
            </NativeButton>
          </View>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar />
      <FlatList
        key={filter}
        data={preferencesLoaded ? activeLists : []}
        keyExtractor={(item) => `${filter}-${item.id}`}
        renderItem={renderCatalogList}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            {!preferencesLoaded ? (
              <>
                <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                  {preferencesLoading ? 'Loading catalogue settings…' : 'Catalogue settings could not be loaded.'}
                </Text>
                {!preferencesLoading ? (
                  <NativeButton variant="text" onPress={() => setPreferencesRetry((value) => value + 1)}>
                    <Text style={{ color: colors.primary }}>Retry</Text>
                  </NativeButton>
                ) : null}
              </>
            ) : (
              <>
                <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                  No sections are enabled for this filter. Enable a catalogue or add a Discover catalogue in Catalogues.
                </Text>
                <NativeButton variant="text" onPress={() => router.push('/settings/home')}>
                  <Text style={{ color: colors.primary }}>Open Catalogues</Text>
                </NativeButton>
              </>
            )}
          </View>
        )}
        ListHeaderComponent={listHeader}
        ListFooterComponent={<BottomSpacing space={50} />}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={5}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.capsule,
    borderWidth: 1,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    ...typography.subhead,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    fontWeight: '600',
  },
  contentContainer: {
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  refreshError: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
