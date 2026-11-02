import { z } from "zod";

export const MOODS = ["animado", "melancolico", "reflexivo"] as const;
export const DURATIONS = ["curto", "medio", "longo"] as const;
export type Mood = (typeof MOODS)[number];
export type Duration = (typeof DURATIONS)[number];

export const MOOD_LABEL: Record<Mood, string> = {
  animado: "Animado",
  melancolico: "Melancólico",
  reflexivo: "Reflexivo",
};
export const DURATION_LABEL: Record<Duration, string> = {
  curto: "Curto (até 89 min)",
  medio: "Médio (90–120 min)",
  longo: "Longo (121+ min)",
};

export const MOOD_GENRE_MAP: Record<Mood, number[]> = {
  animado: [16, 35, 12, 10751],
  melancolico: [18, 10749],
  reflexivo: [18, 9648, 99, 878],
};

export const ProfileSchema = z.object({
  version: z.literal(1),
  genres: z.array(z.number().int()).min(1, "Escolha pelo menos um gênero"),
  mood: z.enum(MOODS),
  duration: z.enum(DURATIONS),
  updatedAt: z.string(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export function durationToRuntimeRange(d: Duration): { gte: number; lte: number } {
  if (d === "curto") return { gte: 0, lte: 89 };
  if (d === "medio") return { gte: 90, lte: 120 };
  return { gte: 121, lte: 9999 };
}

export function mapMoodToGenres(m: Mood): number[] {
  return MOOD_GENRE_MAP[m];
}

export type Rng = () => number;

export interface ScorableMovie {
  id: number;
  genre_ids: number[];
}

export function scoreMoviesByMood<T extends ScorableMovie>(movies: T[], mood: Mood, favorites: number[]) {
  const moodG = new Set(mapMoodToGenres(mood));
  const fav = new Set(favorites);
  return movies.map((m) => ({
    movie: m,
    score:
      m.genre_ids.filter((g) => moodG.has(g)).length +
      2 * m.genre_ids.filter((g) => fav.has(g)).length,
  }));
}

/** Picks among the top-scoring half (at least 1), excluding ids. */
export function pickRandomMovie<T extends ScorableMovie>(
  movies: T[],
  mood: Mood,
  favorites: number[],
  excludeIds: number[] = [],
  rng: Rng = Math.random,
): T | null {
  const excl = new Set(excludeIds);
  const pool = scoreMoviesByMood(movies.filter((m) => !excl.has(m.id)), mood, favorites).sort(
    (a, b) => b.score - a.score,
  );
  if (!pool.length) return null;
  const top = pool.slice(0, Math.max(1, Math.ceil(pool.length / 2)));
  return top[Math.floor(rng() * top.length)]?.movie ?? null;
}

export function randomPage(totalPages: number, rng: Rng = Math.random) {
  const max = Math.max(1, Math.min(totalPages, 500));
  return 1 + Math.floor(rng() * max);
}
