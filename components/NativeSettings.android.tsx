import type { ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import { Text as RNText, View } from 'react-native';
import { FieldGroup, Host, ListItem, RNHostView, Text as NativeText } from '@expo/ui';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';

export function SettingsPage({ children, onRefresh }: { children: ReactNode; onRefresh?: () => Promise<void>; refreshControl?: React.ReactElement; hideScrollIndicator?: boolean }) {
  return (
    <Host style={{ flex: 1 }} colorScheme="dark">
      <FieldGroup>
        {onRefresh ? <FieldGroup.Section title="Refresh"><ListItem onPress={onRefresh}><NativeText>Refresh</NativeText></ListItem></FieldGroup.Section> : null}
        {children}
      </FieldGroup>
    </Host>
  );
}

export function SettingsSection({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const sectionChildren = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return null;
    if (child.type === SettingsRow) return child;
    return <RNHostView key={`native-setting-content-${index}`} matchContents={{ vertical: true }}>{child}</RNHostView>;
  });
  return (
    <FieldGroup.Section title={title}>
      {sectionChildren}
      {footer ? <FieldGroup.SectionFooter><NativeText>{footer}</NativeText></FieldGroup.SectionFooter> : null}
    </FieldGroup.Section>
  );
}

export function SettingsRow({ title, detail, leading, trailing, onPress, destructive = false, disabled = false, titleColor }: {
  title: string; detail?: string; leading?: ReactNode; trailing?: ReactNode; onPress?: () => void; destructive?: boolean; isLast?: boolean; accessibilityLabel?: string; selected?: boolean; disabled?: boolean; titleColor?: string;
}) {
  const detailContent = detail ? <NativeText textStyle={{ fontSize: 13, color: '#8e8e93' }}>{detail}</NativeText> : undefined;
  return (
    <ListItem
      modifiers={[fillMaxWidth()]}
      onPress={disabled ? undefined : onPress}
      leading={leading ? <RNHostView matchContents><View>{leading}</View></RNHostView> : undefined}
      trailing={trailing ? <RNHostView matchContents><View>{trailing}</View></RNHostView> : undefined}
      supportingText={detailContent}
    >
      {destructive || disabled || titleColor ? <RNHostView matchContents><View><RNText style={{ color: destructive ? '#ff453a' : disabled ? '#8e8e93' : titleColor, fontSize: 16 }}>{title}</RNText></View></RNHostView> : <NativeText>{title}</NativeText>}
    </ListItem>
  );
}

export function SettingsTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <FieldGroup.Section title={title}>{subtitle ? <NativeText>{subtitle}</NativeText> : null}</FieldGroup.Section>;
}