/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  ActivityIndicator as DefaultActivityIndicator,
  TextInput as DefaultTextInput,
  Text as DefaultText,
  View as DefaultView,
  Platform
} from 'react-native';
import type { ComponentProps } from 'react';
import { StatusBar as DefaultStatusBar } from 'expo-status-bar';
import Colors from '@/constants/Colors';


export type TextProps = ComponentProps<typeof DefaultText>;
export type TextInputProps = ComponentProps<typeof DefaultTextInput>;
export type ViewProps = ComponentProps<typeof DefaultView>;
export type StatusBarProps = React.ComponentProps<typeof DefaultStatusBar>;
export type ActivityIndicatorProps = ComponentProps<typeof DefaultActivityIndicator>;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = 'dark';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  const color = '#ffffff';
  const webFontStyle = Platform.OS === 'web' ? { fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' } : {};
  return <DefaultText style={[webFontStyle, { color }, style]} {...otherProps} />;
}

export function TextInput(props: TextInputProps) {
  const { style, ...otherProps } = props;
  const color = '#ffffff';

  return <DefaultTextInput style={[{ color }, style]} {...otherProps} />;
}

export function ActivityIndicator(props: ActivityIndicatorProps) {
  const { style, color, ...otherProps } = props;
  return (
    <DefaultActivityIndicator style={style} color={color}  {...otherProps} />
  );
}

export function View(props: ViewProps) {
  const { style, ...otherProps } = props;
  return <DefaultView style={[style]} {...otherProps} />;
}

export function StatusBar(props: StatusBarProps) {
  const { ...otherProps } = props;

  return <DefaultStatusBar {...otherProps} style="light" />;
}

export function Card(props: ViewProps) {
  const { style, ...otherProps } = props;

  return (
    <DefaultView
      style={[
        {
          overflow: 'hidden',
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
