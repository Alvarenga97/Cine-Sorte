import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { SITE, matchTitle, parsePageTitle, parseSitemapLocs, type SearchHit } from "@/lib/catalog";

const BATCH = 40;

async function tmdbSearch(query: string): Promise<SearchHit[]> {
  const key = process.env["TMDB_API_KEY"];
  if (!key) throw new Error("TMDB key missing");
  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("query", query);
  url.searchParams.set("language", "pt-BR");
  const headers: Record<string, string> = { accept: "application/json" };
  if (key.length > 40) headers["Authorization"] = `Bearer ${key}`;
  else url.searchParams.set("api_key", key);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return ((await res.json()) as { results: SearchHit[] }).results;
}

export const Route = createFileRoute("/api/public/jobs/sync-catalog")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");

        // Pending pages: never processed, or changed since last processing.
        const { data: pending, error } = await db
          .from("site_pages")
          .select("url, lastmod, processed_at")
          .is("processed_at", null)
          .limit(BATCH);
        if (error) return Response.json({ error: error.message }, { status: 500 });

        if (!pending.length) {
          // Refresh the URL list from the sitemaps (at most once per run when idle).
          const idx = await (await fetch(`${SITE}/sitemap.xml`)).text();
          const maps = parseSitemapLocs(idx).filter((s) => s.loc.includes("sitemap-movie"));
          const { data: known } = await db.from("site_pages").select("url, lastmod").limit(100000);
          const knownMap = new Map((known ?? []).map((k) => [k.url, k.lastmod]));
          let added = 0;
          for (const s of maps) {
            const locs = parseSitemapLocs(await (await fetch(s.loc)).text());
            const rows = locs
              .filter((l) => !knownMap.has(l.loc) || (l.lastmod && knownMap.get(l.loc) !== l.lastmod))
              .map((l) => ({ url: l.loc, lastmod: l.lastmod, processed_at: null }));
            for (let i = 0; i < rows.length; i += 1000) {
              await db.from("site_pages").upsert(rows.slice(i, i + 1000));
            }
            added += rows.length;
          }
          return Response.json({ refreshed: true, queued: added });
        }

        let matched = 0;
        for (const p of pending) {
          let title: string | null = null;
          let tmdbId: number | null = null;
          try {
            const html = await (await fetch(p.url)).text();
            title = parsePageTitle(html);
            if (title) {
              const hit = matchTitle(title, await tmdbSearch(title));
              if (hit) {
                tmdbId = hit.id;
                await db.from("site_catalog").upsert({ tmdb_id: hit.id, title, site_url: p.url, matched_at: new Date().toISOString() });
                matched++;
              }
            }
          } catch (e) {
            console.error("sync page failed", p.url, e);
          }
          await db.from("site_pages").update({ title, tmdb_id: tmdbId, processed_at: new Date().toISOString() }).eq("url", p.url);
        }
        return Response.json({ processed: pending.length, matched });
      },
    },
  },
});
