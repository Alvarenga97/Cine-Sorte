import { describe, it, expect } from "vitest";
import { matchTitle, normalizeTitle, parsePageTitle, parseSitemapLocs } from "./catalog";

describe("catalog", () => {
  it("normalizes accents and punctuation", () => {
    expect(normalizeTitle("Ação: O Começo!")).toBe("acao o comeco");
  });
  it("parses page title without site suffix", () => {
    expect(parsePageTitle("<title>MAYDAY | Guia de Conteúdos</title>")).toBe("MAYDAY");
  });
  it("parses sitemap locs", () => {
    const r = parseSitemapLocs("<url><loc>https://a/movie/x</loc><lastmod>2026-11-05</lastmod></url>");
    expect(r).toEqual([{ loc: "https://a/movie/x", lastmod: "2026-11-05" }]);
  });
  it("matches only exact titles, preferring popular", () => {
    const hits = [
      { id: 1, title: "Mayday", original_title: "Mayday", popularity: 2 },
      { id: 2, title: "Mayday", original_title: "Mayday", popularity: 9 },
      { id: 3, title: "Mayday 2", original_title: "Mayday 2", popularity: 50 },
    ];
    expect(matchTitle("MAYDAY", hits)?.id).toBe(2);
    expect(matchTitle("Outro", hits)).toBeNull();
  });
});
