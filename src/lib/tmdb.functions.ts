import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.themoviedb.org/3";

async function tmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const key = process.env["TMDB_API_KEY"];
  if (!key) throw new Error("Chave da TMDB não configurada");
  const url = new URL(BASE + path);
  url.searchParams.set("language", "pt-BR");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const headers: Record<string, string> = { accept: "application/json" };
  if (key.length > 40) headers["Authorization"] = `Bearer ${key}`;
  else url.searchParams.set("api_key", key);
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error("TMDB error", res.status, await res.text());
    if (res.status === 401) throw new Error("Chave da TMDB inválida");
    if (res.status === 429) throw new Error("Muitas requisições, tente em instantes");
    throw new Error("Erro ao buscar filmes");
  }
  return res.json() as Promise<T>;
}

export interface Genre {
  id: number;
  name: string;
}
export interface DiscoverMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export const getGenres = createServerFn({ method: "GET" }).handler(async () => {
  const r = await tmdb<{ genres: Genre[] }>("/genre/movie/list");
  return r.genres;
});

export const discoverMovies = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        genres: z.array(z.number().int()).min(1),
        gte: z.number(),
        lte: z.number(),
        match: z.enum(["all", "any"]).default("any"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const params = {
      with_genres: data.genres.join(data.match === "all" ? "," : "|"),
      "with_runtime.gte": data.gte,
      "with_runtime.lte": data.lte,
      "vote_count.gte": 200,
      // Only movies from the last 10 years (e.g. in 2027: 2017 onward).
      "primary_release_date.gte": `${new Date().getFullYear() - 10}-01-01`,
      include_adult: "false",
      region: "BR",
      sort_by: "popularity.desc",
    };
    const first = await tmdb<{ total_pages: number; results: DiscoverMovie[] }>("/discover/movie", params);
    if (!first.results.length) return { results: [] as DiscoverMovie[] };
    const max = Math.min(first.total_pages, 500);
    const page = 1 + Math.floor(Math.random() * max);
    if (page === 1) return { results: first.results };
    const r = await tmdb<{ results: DiscoverMovie[] }>("/discover/movie", { ...params, page });
    return { results: r.results.length ? r.results : first.results };
  });

export const getMovieExtras = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    const [details, videos] = await Promise.all([
      tmdb<{ runtime: number | null; genres: Genre[]; tagline: string }>(`/movie/${data.id}`),
      tmdb<{ results: { key: string; site: string; type: string; official: boolean }[] }>(
        `/movie/${data.id}/videos`,
        { language: "pt-BR", include_video_language: "pt,en" },
      ),
    ]);
    const vids = videos.results.filter((v) => v.site === "YouTube" && v.type === "Trailer");
    const trailer = vids.find((v) => v.official) ?? vids[0];
    return {
      runtime: details.runtime,
      genres: details.genres.map((g) => g.name),
      tagline: details.tagline,
      trailerKey: trailer?.key ?? null,
    };
  });
