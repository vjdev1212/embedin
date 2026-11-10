import { Appearance } from 'react-native';
import { storageService } from '@/utils/StorageService';

const USER_INTERFACE_STYLE_KEY = 'userInterfaceStyle';

export type UserInterfaceStyle = 'automatic' | 'light' | 'dark';

function isUserInterfaceStyle(value: string | null): value is UserInterfaceStyle {
  return value === 'automatic' || value === 'light' || value === 'dark';
}

export async function getUserInterfaceStyle(): Promise<UserInterfaceStyle> {
  const storedStyle = await storageService.getItem(USER_INTERFACE_STYLE_KEY);
  return isUserInterfaceStyle(storedStyle) ? storedStyle : 'automatic';
}

export function applyUserInterfaceStyle(style: UserInterfaceStyle): void {
  Appearance.setColorScheme(style === 'automatic' ? 'auto' : style);
}

export async function initializeUserInterfaceStyle(): Promise<void> {
  applyUserInterfaceStyle(await getUserInterfaceStyle());
}

export async function setUserInterfaceStyle(style: UserInterfaceStyle): Promise<boolean> {
  applyUserInterfaceStyle(style);
  return storageService.setItem(USER_INTERFACE_STYLE_KEY, style);
}
