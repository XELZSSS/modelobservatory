import { useEffect } from "react";
import { STORAGE_KEYS } from "./shared/constants";
import { readStorageJson, removeStorage, writeStorage } from "./shared/utils/storage";

function migrateCacheVersion() {
  const stored = readStorageJson<string>(STORAGE_KEYS.cacheVersion, "");
  if (stored === "1") return;

  removeStorage(STORAGE_KEYS.trendSnapshots);
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
