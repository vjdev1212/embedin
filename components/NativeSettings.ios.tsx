import type { ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import { Text as RNText, View } from 'react-native';
import { FieldGroup, Host, RNHostView, Text as NativeText } from '@expo/ui';
import { Button, HStack, List as NativeList, Spacer, VStack } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  contentShape,
  frame,
  listStyle,
  refreshable,
  scrollIndicators,
  shapes,
} from '@expo/ui/swift-ui/modifiers';

export function SettingsPage({ children, onRefresh, hideScrollIndicator = false }: { children: ReactNode; onRefresh?: () => Promise<void>; hideScrollIndicator?: boolean }) {
  const modifiers = [scrollIndicators('never', 'vertical'), ...(onRefresh ? [refreshable(onRefresh)] : [])];
  return (
    <Host style={{ flex: 1 }} colorScheme="dark">
      {hideScrollIndicator ? <NativeList modifiers={[listStyle('insetGrouped'), ...modifiers]}>{children}</NativeList> : <FieldGroup modifiers={modifiers}>{children}</FieldGroup>}
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
  const row = (
    <HStack spacing={12} alignment="center" modifiers={[frame({ maxWidth: Infinity }), contentShape(shapes.rectangle())]}>
      {leading ? <RNHostView matchContents><View>{leading}</View></RNHostView> : null}
      <VStack alignment="leading" spacing={2}>
        <NativeText textStyle={{ color: destructive ? '#ff453a' : disabled ? '#8e8e93' : titleColor ?? '#f2f2f7' }}>{title}</NativeText>
        {detail ? <NativeText textStyle={{ fontSize: 13, color: '#8e8e93' }}>{detail}</NativeText> : null}
      </VStack>
      <Spacer />
      {trailing ? <RNHostView matchContents><View>{trailing}</View></RNHostView> : null}
    </HStack>
  );
  return onPress && !disabled ? <Button onPress={onPress} modifiers={[buttonStyle('plain')]}>{row}</Button> : row;
}

export function SettingsTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <FieldGroup.Section title={title}>{subtitle ? <NativeText>{subtitle}</NativeText> : null}</FieldGroup.Section>;
}