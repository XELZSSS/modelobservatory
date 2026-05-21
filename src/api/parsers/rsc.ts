/**
 * Next.js RSC (React Server Component) payload extraction.
 *
 * Two shapes are handled:
 *  1. `parseRscPayload` — flight chunks streamed as one JSON object per line
 *     (Artificial Analysis intelligence index, TTS leaderboard).
 *  2. `parseRscScriptArray` — `self.__next_f.push([1,"..."])` script tags whose
 *     string body embeds JSON arrays keyed by a marker (Arena leaderboards).
 *
 * These scrape against Next.js internals, so they break quietly on upstream UI
 * changes. Errors therefore carry the marker name and a response snippet so a
 * failure is diagnosable from the rendered ErrorDetail alone.
 */

const SNIPPET_LEN = 200;
const snippet = (s: string): string => s.slice(0, SNIPPET_LEN).replace(/\s+/g, " ").trim();

export function rscParseError(marker: string, body: string, cause?: unknown): string {
  const causeMsg = cause instanceof Error ? cause.message : cause ? String(cause) : "";
  return `RSC marker "${marker}" not found or payload empty. body length=${body.length}, hasMarker=${body.includes(`"${marker}"`)}${causeMsg ? `, cause=${causeMsg}` : ""}`;
}

/**
 * Parse a per-line RSC flight stream. Each line containing `marker` followed by
 * a JSON value is JSON.parsed; the first whose `extract` returns a non-empty
 * array wins. Throws a diagnostic error if no line yields data.
 */
export function parseRscPayload<T>(body: string, marker: string, extract: (data: unknown) => T[] | null): T[] {
  for (const line of body.split("\n")) {
    // Require the marker to be a real JSON key boundary ("marker" followed by
    // `:` or `[`/`"`), not just a substring of some unrelated comment/field.
    if (!isMarkerBoundary(line, marker)) continue;
    const colonIndex = line.indexOf(":");
    if (colonIndex < 0) continue;
    const raw = line.slice(colonIndex + 1);
    let tree: unknown;
    try {
      tree = JSON.parse(raw);
    } catch {
      continue;
    }
    const result = extract(tree);
    if (result && result.length > 0) return result;
  }
  throw new Error(
    `RSC marker "${marker}" not found or payload empty. ` +
      `body length=${body.length}, head="${snippet(body)}"`,
  );
}

function dfs<T>(root: unknown, collect: boolean, predicate: (node: unknown) => T | null): T | T[] | null {
  const results: T[] = [];
  const stack: unknown[] = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    const result = predicate(current);
    if (result !== null) {
      if (!collect) return result;
      results.push(result);
    }
    for (const v of Array.isArray(current) ? current : Object.values(current)) {
      if (typeof v === "object" && v !== null) stack.push(v);
    }
  }
  return collect ? results : null;
}

export function dfsCollect<T>(root: unknown, predicate: (node: unknown) => T | null): T[] {
  return dfs(root, true, predicate) as T[];
}

export function findNextData<T>(root: unknown, key: string): T[] | null {
  return dfs(root, false, (node) => {
    const r = (node as Record<string, unknown>)[key];
    return Array.isArray(r) ? (r as T[]) : null;
  }) as T[] | null;
}

const SCRIPT_PUSH_RE = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;

/**
 * Extract a JSON array from `self.__next_f.push([1,"..."])` chunks by key.
 *
 * The pushed string is a JS string literal whose body embeds JSON, so quotes
 * and backslashes are escaped (e.g. `{\"entries\":[...]}`). Correctness here
 * rests on doing things in the right order:
 *  1. Unescape the whole push body first (so `\"` becomes a real `"` string
 *     delimiter, `\n` a newline, etc.). Working on the still-escaped text is
 *     what made the old impl croak on brackets inside string values — once
 *     unescaped, normal JSON string tracking applies.
 *  2. Bracket-match the `"key":[...]` array on the unescaped text, being
 *     string-aware so a `]` inside a JSON string value can't terminate early.
 *  3. JSON.parse the extracted slice.
 */
export function parseRscScriptArray<T>(html: string, key: string): T[] {
  let match: RegExpExecArray | null;
  SCRIPT_PUSH_RE.lastIndex = 0;
  while ((match = SCRIPT_PUSH_RE.exec(html)) !== null) {
    const raw = match[1];
    if (!raw || !raw.includes(key)) continue;

    const body = unescape(raw);
    const marker = `"${key}":[`;
    const idx = body.indexOf(marker);
    if (idx < 0) continue;
    const start = idx + marker.length - 1; // points at the opening `[`
    const end = findArrayEnd(body, start);
    if (end <= start) continue;
    try {
      const arr = JSON.parse(body.slice(start, end + 1)) as T[];
      if (Array.isArray(arr) && arr.length > 0) return arr;
    } catch {
      /* try next chunk */
    }
  }
  return [];
}

/**
 * Given the index of the opening `[`, return the index of its matching closing
 * `]`, ignoring brackets that appear inside JSON strings. Returns -1 if
 * unbalanced. Operates on already-unescaped JSON text (real `"` delimiters).
 */
function findArrayEnd(s: string, start: number): number {
  let depth = 0;
  let inString = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      // A backslash escapes the next char inside a JSON string.
      if (ch === "\\") { i++; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Reverse the JS-string escaping applied inside `__next_f` push bodies. */
function unescape(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) {
      const next = s[i + 1];
      switch (next) {
        case '"': out += '"'; break;
        case "\\": out += "\\"; break;
        case "/": out += "/"; break;
        case "n": out += "\n"; break;
        case "t": out += "\t"; break;
        case "r": out += "\r"; break;
        case "b": out += "\b"; break;
        case "f": out += "\f"; break;
        case "u": {
          const hex = s.slice(i + 2, i + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            const code = parseInt(hex, 16);
            // Check for high surrogate and pair it with the next \uXXXX escape
            if (code >= 0xd800 && code <= 0xdbff && s[i + 6] === "\\" && s[i + 7] === "u") {
              const lowHex = s.slice(i + 8, i + 12);
              if (/^[0-9a-fA-F]{4}$/.test(lowHex)) {
                const low = parseInt(lowHex, 16);
                if (low >= 0xdc00 && low <= 0xdfff) {
                  out += String.fromCodePoint(((code - 0xd800) << 10) + (low - 0xdc00) + 0x10000);
                  i += 10; // skip both \uXXXX pairs (4 hex + \u + 4 hex)
                  break;
                }
              }
            }
            out += String.fromCharCode(code);
            i += 4;
          } else {
            out += next;
          }
          break;
        }
        default: out += next;
      }
      i++;
    } else {
      out += s[i];
    }
  }
  return out;
}

/** True if `marker` appears as `"marker"` immediately before a JSON boundary. */
function isMarkerBoundary(line: string, marker: string): boolean {
  const quoted = `"${marker}"`;
  let i = line.indexOf(quoted);
  while (i !== -1) {
    const after = line[i + quoted.length];
    if (after === ":" || after === "[" || after === '"') return true;
    i = line.indexOf(quoted, i + 1);
  }
  return false;
}
