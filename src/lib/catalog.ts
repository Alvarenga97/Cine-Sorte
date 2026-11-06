/** Helpers for the guiadeconteudo.blog catalog (pure, testable). */
export const SITE = "https://guiadeconteudo.blog";

export function normalizeTitle(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseSitemapLocs(xml: string): { loc: string; lastmod: string | null }[] {
  const out: { loc: string; lastmod: string | null }[] = [];
  const re = /<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push({ loc: m[1]!.trim(), lastmod: m[2]?.trim() ?? null });
  return out;
}

export function parsePageTitle(html: string): string | null {
  const m = /<title>([^<]*)<\/title>/i.exec(html);
  if (!m) return null;
  const t = m[1]!.replace(/\s*\|\s*Guia de Conte[uú]dos\s*$/i, "").trim();
  return t || null;
}

export interface SearchHit {
  id: number;
  title: string;
  original_title: string;
  popularity: number;
}

/** Only accept an exact (normalized) title match; prefer the most popular. */
export function matchTitle(title: string, hits: SearchHit[]): SearchHit | null {
  const n = normalizeTitle(title);
  if (!n) return null;
  const ok = hits.filter((h) => normalizeTitle(h.title) === n || normalizeTitle(h.original_title) === n);
  if (!ok.length) return null;
  return ok.sort((a, b) => b.popularity - a.popularity)[0]!;
}
