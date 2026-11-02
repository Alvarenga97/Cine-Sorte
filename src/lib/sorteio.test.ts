import { describe, it, expect } from "vitest";
import {
  durationToRuntimeRange,
  mapMoodToGenres,
  scoreMoviesByMood,
  pickRandomMovie,
  randomPage,
  ProfileSchema,
} from "./sorteio";

describe("sorteio", () => {
  it("faixas de duração", () => {
    expect(durationToRuntimeRange("curto")).toEqual({ gte: 0, lte: 89 });
    expect(durationToRuntimeRange("medio")).toEqual({ gte: 90, lte: 120 });
    expect(durationToRuntimeRange("longo")).toEqual({ gte: 121, lte: 9999 });
  });
  it("humor → gêneros", () => {
    expect(mapMoodToGenres("animado")).toEqual([16, 35, 12, 10751]);
    expect(mapMoodToGenres("melancolico")).toEqual([18, 10749]);
    expect(mapMoodToGenres("reflexivo")).toEqual([18, 9648, 99, 878]);
  });
  it("pontuação por humor", () => {
    const s = scoreMoviesByMood([{ id: 1, genre_ids: [18, 10749] }, { id: 2, genre_ids: [28] }], "melancolico", []);
    expect(s[0]?.score).toBe(2);
    expect(s[1]?.score).toBe(0);
  });
  it("sorteio determinístico e exclusão", () => {
    const movies = [
      { id: 1, genre_ids: [35] },
      { id: 2, genre_ids: [35, 16] },
      { id: 3, genre_ids: [28] },
    ];
    expect(pickRandomMovie(movies, "animado", [], [], () => 0)?.id).toBe(2);
    expect(pickRandomMovie(movies, "animado", [], [2], () => 0)?.id).toBe(1);
    expect(pickRandomMovie(movies, "animado", [], [1, 2, 3])).toBeNull();
  });
  it("página limitada a 500", () => {
    expect(randomPage(9999, () => 0.9999)).toBe(500);
    expect(randomPage(3, () => 0)).toBe(1);
  });
  it("perfil exige um gênero", () => {
    const base = { version: 1, mood: "animado", duration: "medio", updatedAt: "" };
    expect(ProfileSchema.safeParse({ ...base, genres: [] }).success).toBe(false);
    expect(ProfileSchema.safeParse({ ...base, genres: [18] }).success).toBe(true);
  });
});
