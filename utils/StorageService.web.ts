const sessionFallback = new Map<string, string>();

function logStorageError(action: string, key: string, error: unknown) {
  console.error(`localStorage ${action} failed for "${key}".`, error);
}

function getLocalStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export const storageService = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = getLocalStorage()?.getItem(key) ?? null;
      if (value === null) sessionFallback.delete(key);
      else sessionFallback.set(key, value);
      return value;
    } catch (error) {
      logStorageError('read', key, error);
      return sessionFallback.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<boolean> {
    sessionFallback.set(key, value);
    try {
      const storage = getLocalStorage();
      if (!storage) return false;
      storage.setItem(key, value);
      return true;
    } catch (error) {
      logStorageError('write', key, error);
      return false;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    sessionFallback.delete(key);
    try {
      const storage = getLocalStorage();
      if (!storage) return false;
      storage.removeItem(key);
      return true;
    } catch (error) {
      logStorageError('remove', key, error);
      return false;
    }
  },

  async getObject<T>(key: string): Promise<T | null> {
    const rawValue = await this.getItem(key);
    if (!rawValue) return null;
    try {
      return JSON.parse(rawValue) as T;
    } catch (error) {
      logStorageError('parse', key, error);
      return null;
    }
  },

  async setObject(key: string, value: unknown): Promise<boolean> {
    try {
      return await this.setItem(key, JSON.stringify(value));
    } catch (error) {
      logStorageError('serialize', key, error);
      return false;
    }
  },
};