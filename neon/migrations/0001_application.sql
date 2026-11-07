-- Cloud authentication remains the identity provider. User ownership is verified
-- in authenticated server functions, never from client-supplied user IDs.
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  genres integer[] NOT NULL DEFAULT '{}',
  mood text NOT NULL DEFAULT 'animado',
  duration text NOT NULL DEFAULT 'medio',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.draw_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  movie_id integer NOT NULL,
  title text NOT NULL,
  poster_path text,
  vote_average numeric,
  genres text[] NOT NULL DEFAULT '{}',
  mood text,
  duration text,
  drawn_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id, drawn_at)
);
CREATE INDEX draw_history_user_date ON public.draw_history (user_id, drawn_at DESC);
CREATE TABLE public.site_catalog (
  tmdb_id integer PRIMARY KEY,
  title text NOT NULL,
  site_url text NOT NULL,
  matched_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.site_pages (
  url text PRIMARY KEY,
  lastmod date,
  title text,
  tmdb_id integer,
  processed_at timestamptz
);
CREATE INDEX site_pages_pending ON public.site_pages (processed_at);