CREATE TABLE public.site_pages (
  url text PRIMARY KEY,
  lastmod date,
  title text,
  tmdb_id integer,
  processed_at timestamptz
);
GRANT ALL ON public.site_pages TO service_role;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE INDEX site_pages_pending ON public.site_pages (processed_at) ;

CREATE TABLE public.site_catalog (
  tmdb_id integer PRIMARY KEY,
  title text NOT NULL,
  site_url text NOT NULL,
  matched_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_catalog TO anon, authenticated;
GRANT ALL ON public.site_catalog TO service_role;
ALTER TABLE public.site_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog is public" ON public.site_catalog FOR SELECT TO anon, authenticated USING (true);