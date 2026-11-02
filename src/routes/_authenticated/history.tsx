import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useApp } from "@/hooks/use-app";
import { Button } from "@/components/ui/button";
import { PosterImg } from "@/components/PosterImg";
import { MOOD_LABEL, type Mood } from "@/lib/sorteio";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Histórico — Flixy" },
      { name: "description", content: "Todos os filmes que já foram sorteados para você." },
      { property: "og:title", content: "Histórico — Flixy" },
      { property: "og:description", content: "Seus filmes sorteados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { history } = useApp();
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 font-display text-6xl tracking-wide">Histórico</h1>
      {history.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="mb-4 text-muted-foreground">Você ainda não sorteou nenhum filme.</p>
          <Button asChild><Link to="/">Sortear agora</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
          {history.map((h) => (
            <div key={h.movieId + h.date}>
              <PosterImg path={h.posterPath} title={h.title} className="aspect-[2/3] w-full rounded-md" />
              <p className="mt-2 truncate font-medium">{h.title}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-primary text-primary" /> {h.voteAverage.toFixed(1)} · {new Date(h.date).toLocaleDateString("pt-BR")}
                {h.moodAtTime ? ` · ${MOOD_LABEL[h.moodAtTime as Mood] ?? ""}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
