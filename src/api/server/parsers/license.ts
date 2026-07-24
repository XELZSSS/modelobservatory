/**
 * License-tag classification for HuggingFace models.
 *
 * Moved out of `rsc.ts` — it has nothing to do with RSC payloads and is only
 * consumed by the HuggingFace upstream. Kept its own module so the license
 * allowlist lives in one discoverable place.
 */

const OPEN_LICENSES = new Set([
  "apache-2.0", "mit", "bsd", "bsd-2-clause", "bsd-3-clause", "isc",
  "cc", "cc0-1.0", "cc-by-4.0", "cc-by-sa-4.0",
  "bigscience-openrail-m", "openrail", "creativeml-openrail-m", "openrail++",
]);

/**
 * Given a model's HF `tags`, return the first recognized open license id, or
 * null if none of the tags declare an open license. Tags look like
 * `"license:apache-2.0"`.
 */
export function getOpenLicense(tags: string[]): string | null {
  for (const tag of tags) {
    if (!tag.startsWith("license:")) continue;
    if (OPEN_LICENSES.has(tag.slice(8))) return tag.slice(8);
  }
  return null;
}
