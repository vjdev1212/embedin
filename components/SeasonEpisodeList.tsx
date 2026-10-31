import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { MenuView } from '@expo/ui/community/menu';
import type { MenuAction, NativeActionEvent } from '@expo/ui/community/menu';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, typography } from '@/constants/theme';
import { formatDate } from '@/utils/Date';
import { DefaultEpisodeThumbnailImgXml } from '@/utils/Svg';
import { SvgXml } from 'react-native-svg';
import CustomContextMenu from './ContextMenu';
import { Text, View } from './Themed';
import PosterArtwork from '@/components/PosterArtwork';

interface Episode {
  name: string;
  title: string;
  season: number;
  episode: number;
  number: number;
  thumbnail: string;
  description: string;
  overview: string;
  firstAired: string;
  released: string;
}

interface SeasonEpisodeListProps {
  videos: Episode[];
  onEpisodeSelect: (season: number, episode: number) => void;
}

interface EpisodeItemProps {
  item: Episode;
  onEpisodeSelect: (season: number, episode: number) => void;
  cardWidth: number;
}

interface WebSeasonMenuItem {
  id: string;
  title: string;
  value: number;
  key: string;
}

const THUMBNAIL_ASPECT_RATIO = 16 / 9;
const CARD_GAP = spacing.md;

const getCardWidth = (screenWidth: number, screenHeight: number) =>
  screenHeight > screenWidth ? 210 : 240;

const EpisodeItem: React.FC<EpisodeItemProps> = React.memo(
  ({ item, onEpisodeSelect, cardWidth }) => {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(Boolean(item.thumbnail));
    const [imgError, setImgError] = useState(!item.thumbnail);
    const [scaleAnim] = useState(() => new Animated.Value(1));

    const computedValues = useMemo(
      () => ({
        episodeTitle: `${item.episode || item.number}. ${item.name || item.title}`,
        episodeAired: formatDate(item.firstAired) || formatDate(item.released),
      }),
      [item],
    );

    const handleImageLoad = useCallback((onImageLoad: () => void) => {
      setIsLoading(false);
      onImageLoad();
    }, []);

    const handleImageError = useCallback(() => {
      setImgError(true);
      setIsLoading(false);
    }, []);

    const handlePress = useCallback(
      () => onEpisodeSelect(item.season, item.number),
      [onEpisodeSelect, item.season, item.number],
    );

    const handlePressIn = useCallback(
      () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start(),
      [scaleAnim],
    );

    const handlePressOut = useCallback(
      () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start(),
      [scaleAnim],
    );

    useEffect(() => {
      setImgError(!item.thumbnail);
      setIsLoading(Boolean(item.thumbnail));
    }, [item.thumbnail]);

    return (
      <Animated.View style={{ width: cardWidth, transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.episodePressable}
        >
          <View style={styles.episodeCard}>
            <PosterArtwork
              key={item.thumbnail}
              style={[styles.thumbnailArtwork, { backgroundColor: colors.background }]}
            >
              {(onImageLoad) => (
                <>
                  {!imgError && (
                    <Animated.Image
                      source={{ uri: item.thumbnail }}
                      onLoad={() => handleImageLoad(onImageLoad)}
                      onError={handleImageError}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  )}
                  {isLoading && (
                    <View
                      pointerEvents="none"
                      style={[
                        StyleSheet.absoluteFill,
                        styles.skeletonBackground,
                        { backgroundColor: colors.background },
                      ]}
                    />
                  )}
                  {imgError && (
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        styles.thumbnailPlaceHolder,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <SvgXml xml={DefaultEpisodeThumbnailImgXml} width="40%" height="40%" />
                    </View>
                  )}
                </>
              )}
            </PosterArtwork>
            <View style={styles.episodeInfo}>
              <Text
                style={[styles.episodeTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {computedValues.episodeTitle}
              </Text>
              <Text style={[styles.episodeAired, { color: colors.textMuted }]}>
                {computedValues.episodeAired}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  },
);

const SeasonEpisodeList: React.FC<SeasonEpisodeListProps> = ({ videos, onEpisodeSelect }) => {
  const { colors } = useTheme();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const { width, height } = useWindowDimensions();
  const menuRef = useRef<React.ElementRef<typeof MenuView>>(null);
  const [webMenuVisible, setWebMenuVisible] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });

  const cardWidth = useMemo(() => getCardWidth(width, height), [height, width]);

  const groupedEpisodes = useMemo(
    () =>
      videos.reduce((acc, video) => {
        if (!acc[video.season]) acc[video.season] = [];
        acc[video.season].push(video);
        return acc;
      }, {} as Record<number, Episode[]>),
    [videos],
  );

  const seasonData = useMemo(
    () => [
      ...Object.keys(groupedEpisodes)
        .map(Number)
        .filter((season) => season !== 0)
        .sort((a, b) => a - b),
      ...(groupedEpisodes[0] ? [0] : []),
    ],
    [groupedEpisodes],
  );

  const menuActions = useMemo<MenuAction[]>(
    () =>
      seasonData.map((season) => ({
        id: `season-${season}`,
        title: season === 0 ? 'Specials' : `Season ${season}`,
        titleColor: selectedSeason === season ? colors.primary : '#ffffff',
        state: selectedSeason === season ? 'on' : undefined,
      })),
    [colors.primary, seasonData, selectedSeason],
  );

  const webMenuItems = useMemo<WebSeasonMenuItem[]>(
    () =>
      seasonData.map((season, index) => ({
        id: `season-${season}-${index}`,
        title: season === 0 ? 'Specials' : `Season ${season}`,
        value: season,
        key: `season-item-${season}-${index}`,
      })),
    [seasonData],
  );

  const handleSeasonSelect = useCallback((season: number) => {
    setSelectedSeason(season);
    setWebMenuVisible(false);
  }, []);

  const handleMenuPress = useCallback(
    ({ nativeEvent }: NativeActionEvent) => {
      const match = nativeEvent.event.match(/season-(\d+)/);
      if (match) handleSeasonSelect(Number(match[1]));
    },
    [handleSeasonSelect],
  );

  const handleWebSeasonDropdownPress = useCallback((event: { nativeEvent: { pageX: number; pageY: number } }) => {
    const { pageX, pageY } = event.nativeEvent;
    setAnchorPosition({ x: pageX, y: pageY });
    setWebMenuVisible(true);
  }, []);

  const handleWebContextMenuItemSelect = useCallback(
    (item: WebSeasonMenuItem) => handleSeasonSelect(item.value),
    [handleSeasonSelect],
  );

  const renderEpisodeItem = useCallback(
    (episode: Episode, index: number) => (
      <EpisodeItem
        key={`episode-${episode.season}-${episode.episode || episode.number}-${episode.thumbnail}-${index}`}
        item={episode}
        onEpisodeSelect={onEpisodeSelect}
        cardWidth={cardWidth}
      />
    ),
    [onEpisodeSelect, cardWidth],
  );

  useEffect(() => {
    if (videos.length > 0) {
      const seasons = Array.from(new Set(videos.map((video) => video.season))).sort(
        (a, b) => a - b,
      );
      setSelectedSeason(seasons.find((season) => season !== 0) || seasons[0] || 1);
    }
  }, [videos]);

  if (!videos || videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No episodes available
        </Text>
      </View>
    );
  }

  const currentSeasonText =
    selectedSeason === 0 ? 'Specials' : `Season ${selectedSeason}`;

  return (
    <View style={styles.container}>
      <View style={styles.seasonListContainer}>
        {Platform.OS === 'web' ? (
          <>
            <TouchableOpacity
              style={styles.seasonDropdownButton}
              onPress={handleWebSeasonDropdownPress}
            >
              <Text style={[styles.seasonDropdownText, { color: colors.text }]}>
                {currentSeasonText}
              </Text>
              <Text style={[styles.seasonDropdownArrow, { color: colors.text }]}>▼</Text>
            </TouchableOpacity>
            <CustomContextMenu
              visible={webMenuVisible}
              onClose={() => setWebMenuVisible(false)}
              items={webMenuItems}
              selectedItem={webMenuItems.find((item) => item.value === selectedSeason)}
              onItemSelect={handleWebContextMenuItemSelect}
              anchorPosition={anchorPosition}
            />
          </>
        ) : (
          <MenuView
            ref={menuRef}
            onPressAction={handleMenuPress}
            actions={menuActions}
            shouldOpenOnLongPress={false}
            colorScheme="dark"
          >
            <TouchableOpacity style={styles.seasonDropdownButton}>
              <Text style={[styles.seasonDropdownText, { color: colors.text }]}>
                {currentSeasonText}
              </Text>
              <Ionicons name="chevron-expand" size={24} color={colors.text} />
            </TouchableOpacity>
          </MenuView>
        )}
      </View>
      {groupedEpisodes[selectedSeason]?.length > 0 ? (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.episodeScrollView}
          contentContainerStyle={styles.episodeScrollContent}
        >
          {groupedEpisodes[selectedSeason].map(renderEpisodeItem)}
        </ScrollView>
      ) : (
        <View style={styles.noEpisodesContainer}>
          <Text style={[styles.noEpisodesText, { color: colors.textMuted }]}>
            No episodes available for {currentSeasonText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'transparent', marginBottom: spacing.md },
  seasonListContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.mdLg,
    backgroundColor: 'transparent',
  },
  seasonDropdownButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.capsule,
    backgroundColor: 'transparent',
  },
  seasonDropdownText: { ...typography.headline, flexShrink: 0 },
  seasonDropdownArrow: { ...typography.subhead, fontWeight: '600' },
  episodeScrollView: { width: '100%' },
  episodeScrollContent: {
    paddingHorizontal: spacing.mdLg,
    paddingVertical: spacing.sm,
    gap: CARD_GAP,
  },
  episodePressable: { borderRadius: radius.md, overflow: 'hidden' },
  episodeCard: { backgroundColor: 'transparent', padding: 0 },
  thumbnailArtwork: { width: '100%', aspectRatio: THUMBNAIL_ASPECT_RATIO },
  episodeInfo: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
    backgroundColor: 'transparent',
  },
  thumbnailPlaceHolder: { justifyContent: 'center', alignItems: 'center' },
  thumbnail: StyleSheet.absoluteFill,
  episodeTitle: { ...typography.subhead, fontWeight: '600' },
  episodeAired: { ...typography.caption },
  skeletonBackground: { opacity: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: { ...typography.body, textAlign: 'center' },
  noEpisodesContainer: { paddingVertical: spacing.xxl, alignItems: 'center' },
  noEpisodesText: { ...typography.subhead, textAlign: 'center' },
});

export default React.memo(SeasonEpisodeList);
