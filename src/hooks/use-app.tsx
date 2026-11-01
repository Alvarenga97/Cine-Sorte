import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Mood, Duration } from "@/lib/sorteio";
import {
  getLocalProfile,
  saveLocalProfile,
  getAnonHistory,
  addAnonHistory,
  clearAnonHistory,
  type HistoryItem,
} from "@/lib/storage";

interface AppCtx {
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  saveProfile: (p: Omit<Profile, "version" | "updatedAt">) => Promise<void>;
  history: HistoryItem[];
  addHistory: (h: HistoryItem) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AppCtx | null>(null);

type Row = { movie_id: number; title: string; poster_path: string | null; vote_average: number | null; genres: string[]; mood: string | null; duration: string | null; drawn_at: string };
const fromRow = (r: Row): HistoryItem => ({
  movieId: r.movie_id,
  title: r.title,
  posterPath: r.poster_path,
  voteAverage: Number(r.vote_average ?? 0),
  genres: r.genres,
  date: r.drawn_at,
  moodAtTime: r.mood ?? "",
  durationAtTime: r.duration ?? "",
});
const toRow = (h: HistoryItem, userId: string) => ({
  user_id: userId,
  movie_id: h.movieId,
  title: h.title,
  poster_path: h.posterPath,
  vote_average: h.voteAverage,
  genres: h.genres,
  mood: h.moodAtTime,
  duration: h.durationAtTime,
  drawn_at: h.date,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const syncForUser = useCallback(async (u: User | null) => {
    const local = getLocalProfile();
    if (!u) {
      setProfile(local);
      setHistory(getAnonHistory());
      return;
    }
    // Profile merge: newest wins
    const { data: row } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
    let merged = local;
    if (row && (!local || new Date(row.updated_at) > new Date(local.updatedAt))) {
      merged = { version: 1, genres: row.genres, mood: row.mood as Mood, duration: row.duration as Duration, updatedAt: row.updated_at };
      saveLocalProfile(merged);
    } else if (local) {
      await supabase.from("profiles").upsert({ id: u.id, genres: local.genres, mood: local.mood, duration: local.duration, updated_at: local.updatedAt });
    }
    setProfile(merged);
    // History merge
    const anon = getAnonHistory();
    if (anon.length) {
      await supabase.from("draw_history").upsert(anon.map((h) => toRow(h, u.id)), { onConflict: "user_id,movie_id,drawn_at", ignoreDuplicates: true });
      clearAnonHistory();
    }
    const { data: rows } = await supabase.from("draw_history").select("*").order("drawn_at", { ascending: false }).limit(200);
    setHistory((rows ?? []).map(fromRow));
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUser(data.user);
      await syncForUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
      const u = session?.user ?? null;
      setUser(u);
      setTimeout(() => void syncForUser(u), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [syncForUser]);

  const saveProfile: AppCtx["saveProfile"] = async (p) => {
    const full: Profile = { ...p, version: 1, updatedAt: new Date().toISOString() };
    saveLocalProfile(full);
    setProfile(full);
    if (user) {
      await supabase.from("profiles").upsert({ id: user.id, genres: full.genres, mood: full.mood, duration: full.duration, updated_at: full.updatedAt });
    }
  };

  const addHistory: AppCtx["addHistory"] = async (h) => {
    setHistory((prev) => [h, ...prev]);
    if (user) await supabase.from("draw_history").insert(toRow(h, user.id));
    else addAnonHistory(h);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ ready, user, profile, saveProfile, history, addHistory, signOut }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp fora do AppProvider");
  return c;
}
