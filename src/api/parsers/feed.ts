/**
 * RSS / Atom feed post-processing helpers.
 *
 * Entity decoding is deliberately NOT delegated to fast-xml-parser: in v5 its
 * `decodeHTMLentity` option only handles `&amp;`, leaving numeric
 * (`&#8212;`/`&#x2014;`) and most named entities (`&mdash;`, `&rsquo;`,
 * `&hellip;`) untouched. Feeds from official AI blogs use those liberally, so
 * we decode them ourselves with a small but real named-entity table plus
 * numeric entity support.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "\u2014", ndash: "\u2013", hellip: "\u2026",
  lsquo: "\u2018", rsquo: "\u2019", ldquo: "\u201C", rdquo: "\u201D",
  laquo: "\u00AB", raquo: "\u00BB",
  ensp: "\u2002", emsp: "\u2003", thinsp: "\u2009", zwnj: "\u200C", zwj: "\u200D",
  eacute: "\u00E9", egrave: "\u00E8", agrave: "\u00E0", ccedilla: "\u00E7",
  ccedil: "\u00E7",uuml: "\u00FC", ouml: "\u00F6", auml: "\u00E4",
};

const ENTITY_RE = /&(?:#x([0-9a-fA-F]+)|#([0-9]+)|([a-zA-Z][a-zA-Z0-9]*));/g;

/** Decode HTML entities (`&amp;`, `&#8212;`, `&#x2014;`, `&mdash;`, …). */
export function decodeEntities(s: string): string {
  return s.replace(ENTITY_RE, (m, hex?: string, dec?: string, name?: string) => {
    if (hex) return safeFromCodePoint(parseInt(hex, 16));
    if (dec) return safeFromCodePoint(parseInt(dec, 10));
    return NAMED_ENTITIES[name!] ?? m;
  });
}

function safeFromCodePoint(cp: number): string {
  if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) return "";
  try {
    return String.fromCodePoint(cp);
  } catch {
    return "";
  }
}

/** Strip inline HTML tags from a feed title/description. */
export function stripHtml(s: string): string {
  return s.replace(/<[^>]*>?/gm, "");
}
