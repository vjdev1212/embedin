import { createMMKV } from 'react-native-mmkv';

const sessionFallback = new Map<string, string>();
let nativeStorage: ReturnType<typeof createMMKV> | null = null;

try {
  nativeStorage = createMMKV({ id: 'embedin' });
} catch (error) {
  console.error('MMKV is unavailable in this native build; using session-only storage.', error);
}

function logStorageError(backend: string, action: string, key: string, error: unknown) {
  console.error(`${backend} ${action} failed for "${key}".`, error);
}

export const storageService = {
  async getItem(key: string): Promise<string | null> {
    if (!nativeStorage) return sessionFallback.get(key) ?? null;
    try {
      const value = nativeStorage.getString(key);
      if (value === undefined) sessionFallback.delete(key);
      else sessionFallback.set(key, value);
      return value ?? null;
    } catch (error) {
      logStorageError('MMKV', 'read', key, error);
      return sessionFallback.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<boolean> {
    sessionFallback.set(key, value);
    if (!nativeStorage) return false;
    try {
      nativeStorage.set(key, value);
      return true;
    } catch (error) {
      logStorageError('MMKV', 'write', key, error);
      return false;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    sessionFallback.delete(key);
    if (!nativeStorage) return false;
    try {
      nativeStorage.remove(key);
      return true;
    } catch (error) {
      logStorageError('MMKV', 'remove', key, error);
      return false;
    }
  },

  async getObject<T>(key: string): Promise<T | null> {
    const rawValue = await this.getItem(key);
    if (!rawValue) return null;
    try {
      return JSON.parse(rawValue) as T;
    } catch (error) {
      logStorageError('JSON', 'parse', key, error);
      return null;
    }
  },

  async setObject(key: string, value: unknown): Promise<boolean> {
    try {
      return await this.setItem(key, JSON.stringify(value));
    } catch (error) {
      logStorageError('JSON', 'serialize', key, error);
      return false;
    }
  },
};