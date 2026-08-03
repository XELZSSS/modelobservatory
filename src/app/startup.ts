import { useEffect } from "react";
import { STORAGE_KEYS } from "../shared/config";

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function removeStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function readStorageJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

let cacheMigrated = false;

function migrateCacheVersion() {
  if (cacheMigrated) return;
  cacheMigrated = true;

  if (readStorageJson<string>(STORAGE_KEYS.cacheVersion, "") === "1") return;

  if (typeof caches !== "undefined") {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .catch((e) => console.error("Cache cleanup failed", e));
  }
  writeStorage(STORAGE_KEYS.cacheVersion, "1");
}

export function useAppStartup() {
  useEffect(() => {
    migrateCacheVersion();
  }, []);
}
