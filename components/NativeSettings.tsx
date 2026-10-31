import { Children, type ReactElement, type ReactNode, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';

interface SettingsPageProps {
  children: ReactNode;
  refreshControl?: ReactElement;
  onRefresh?: () => Promise<void>;
  hideScrollIndicator?: boolean;
}

export function SettingsPage({ children, refreshControl, onRefresh, hideScrollIndicator = false }: SettingsPageProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={!hideScrollIndicator}
      refreshControl={refreshControl ?? (onRefresh ? (
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0a84ff" />
      ) : undefined)}
      style={styles.page}
      contentContainerStyle={styles.pageContent}
    >
      {children}
    </ScrollView>
  );
}

interface SettingsSectionProps {
  title?: string;
  footer?: string;
  children: ReactNode;
}

export function SettingsSection({ title, footer, children }: SettingsSectionProps) {
  const sectionChildren = Children.toArray(children);

  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {sectionChildren.length ? <View style={styles.group}>{sectionChildren}</View> : null}
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

interface SettingsRowProps {
  title: string;
  detail?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
  accessibilityLabel?: string;
  selected?: boolean;
  disabled?: boolean;
  titleColor?: string;
  detailSameFont?: boolean;
  detailColor?: string;
  detailFontSize?: number;
}

export function SettingsRow({
  title,
  detail,
  leading,
  trailing,
  onPress,
  destructive = false,
  isLast = false,
  accessibilityLabel,
  selected,
  disabled = false,
  titleColor,
  detailSameFont = false,
  detailColor,
  detailFontSize,
}: SettingsRowProps) {
  const content = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={[styles.rowTitle, { color: destructive ? '#ff453a' : titleColor ?? '#f2f2f7' }]}>{title}</Text>
        {detail ? (
          <Text
            style={[
              detailSameFont ? styles.rowTitle : styles.rowDetail,
              { color: detailColor, fontSize: detailFontSize },
            ]}
          >
            {detail}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  );
  const rowStyle = [styles.row, !isLast && styles.rowWithSeparator, disabled && styles.disabledRow];

  if (!onPress) return <View style={rowStyle}>{content}</View>;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole={selected === undefined ? 'button' : 'radio'}
      accessibilityState={selected === undefined ? undefined : { checked: selected }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [rowStyle, pressed && styles.pressedRow]}
    >
      {content}
    </Pressable>
  );
}

export function SettingsTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000000' },
  pageContent: { width: '100%', maxWidth: 780, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 32, gap: 24 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', paddingHorizontal: 16, color: '#8e8e93' },
  group: { backgroundColor: '#1c1c1e', borderRadius: 12, overflow: 'hidden' },
  footer: { fontSize: 13, paddingHorizontal: 16, color: '#8e8e93' },
  row: { width: '100%', minHeight: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  rowWithSeparator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#38383a', marginLeft: 16, paddingLeft: 0 },
  disabledRow: { opacity: 0.5 },
  pressedRow: { backgroundColor: '#2c2c2e' },
  leading: { alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 17, color: '#f2f2f7', flexShrink: 1 },
  rowDetail: { fontSize: 13, lineHeight: 18, color: '#8e8e93' },
  trailing: { alignItems: 'center', justifyContent: 'center' },
  titleBlock: { gap: 4, paddingHorizontal: 16, paddingBottom: 4 },
  title: { fontSize: 34, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 15, color: '#8e8e93' },
});