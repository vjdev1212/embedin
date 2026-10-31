import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text as RNText, View as RNView } from 'react-native';
import type { PersonColors } from '@/components/person-details-types';

const COLLAPSED_LINE_LIMIT = 10;

export default function PersonBiography({ biography, width, colors }: { biography: string; width: number; colors: PersonColors }) {
  const [expanded, setExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setExpanded(false);
    setHasMore(false);
  }, [biography]);

  return (
    <RNView style={[styles.card, { width, backgroundColor: colors.backgroundCard }]}>
      <RNText style={[styles.title, { color: colors.text }]}>Biography</RNText>
      <RNText
        numberOfLines={expanded ? undefined : COLLAPSED_LINE_LIMIT}
        onTextLayout={(event) => setHasMore(event.nativeEvent.lines.length > COLLAPSED_LINE_LIMIT)}
        style={[styles.biography, { color: colors.textMuted }]}
      >
        {biography}
      </RNText>
      {hasMore ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less biography' : 'Show more biography'}
          onPress={() => setExpanded((value) => !value)}
          hitSlop={8}
          style={styles.toggle}
        >
          <RNText style={[styles.toggleLabel, { color: colors.primary }]}>{expanded ? 'LESS' : 'MORE'}</RNText>
        </Pressable>
      ) : null}
    </RNView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 8, borderRadius: 14 },
  title: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  biography: { fontSize: 13, lineHeight: 18 },
  toggle: { alignSelf: 'flex-start', paddingVertical: 4 },
  toggleLabel: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
});