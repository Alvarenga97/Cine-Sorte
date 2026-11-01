CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  genres int[] NOT NULL DEFAULT '{}',
  mood text NOT NULL DEFAULT 'animado',
  duration text NOT NULL DEFAULT 'medio',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.draw_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  movie_id int NOT NULL,
  title text NOT NULL,
  poster_path text,
  vote_average numeric,
  genres text[] NOT NULL DEFAULT '{}',
  mood text,
  duration text,
  drawn_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id, drawn_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.draw_history TO authenticated;
GRANT ALL ON public.draw_history TO service_role;
ALTER TABLE public.draw_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own history" ON public.draw_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);