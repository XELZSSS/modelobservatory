const OPEN_LICENSES = new Set([
  "apache-2.0",
  "mit",
  "bsd",
  "bsd-2-clause",
  "bsd-3-clause",
  "isc",
  "cc",
  "cc0-1.0",
  "cc-by-4.0",
  "cc-by-sa-4.0",
  "bigscience-openrail-m",
  "openrail",
  "creativeml-openrail-m",
  "openrail++",
]);

const LICENSE_PREFIX = "license:";

export function getOpenLicense(tags: string[]): string | null {
  for (const tag of tags) {
    if (!tag.startsWith(LICENSE_PREFIX)) continue;
    const id = tag.slice(LICENSE_PREFIX.length);
    if (OPEN_LICENSES.has(id)) return id;
  }
  return null;
}