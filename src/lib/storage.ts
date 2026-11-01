import { ProfileSchema, type Profile } from "./sorteio";

const PROFILE_KEY = "userProfile:v1";

export interface HistoryItem {
  movieId: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  genres: string[];
  date: string;
  moodAtTime: string;
  durationAtTime: string;
}

export function getLocalProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = ProfileSchema.safeParse(JSON.parse(raw));
    return p.success ? p.data : null;
  } catch {
    return null;
  }
}
export function saveLocalProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

const ANON = "history:anonymous";
export function getAnonHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(ANON) || "[]");
  } catch {
    return [];
  }
}
export function addAnonHistory(item: HistoryItem) {
  const h = [item, ...getAnonHistory()].slice(0, 200);
  localStorage.setItem(ANON, JSON.stringify(h));
}
export function clearAnonHistory() {
  localStorage.removeItem(ANON);
}

export const posterUrl = (p: string | null, size = "w500") =>
  p ? `https://image.tmdb.org/t/p/${size}${p}` : null;
