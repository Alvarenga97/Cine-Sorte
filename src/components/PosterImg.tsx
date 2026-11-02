import { useState } from "react";
import { Film } from "lucide-react";
import { posterUrl } from "@/lib/storage";

export function PosterImg({ path, title, className }: { path: string | null; title: string; className?: string }) {
  const [bad, setBad] = useState(false);
  const src = posterUrl(path);
  if (!src || bad) {
    return <div className={`flex items-center justify-center bg-muted ${className}`}><Film className="h-10 w-10 text-muted-foreground" /></div>;
  }
  return <img src={src} alt={`Pôster de ${title}`} onError={() => setBad(true)} className={`object-cover ${className}`} loading="lazy" />;
}
