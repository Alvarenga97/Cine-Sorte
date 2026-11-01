import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useApp } from "@/hooks/use-app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/");

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => z.object({ returnTo: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Entrar — CineSorte" },
      { name: "description", content: "Entre para guardar seu histórico de filmes sorteados." },
      { property: "og:title", content: "Entrar — CineSorte" },
      { property: "og:description", content: "Guarde seu histórico de sorteios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { returnTo } = Route.useSearch();
  const { user } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: safePath(returnTo), replace: true });
  }, [user, returnTo, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setSent(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (returnTo) sessionStorage.setItem("returnTo", safePath(returnTo));
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Não foi possível entrar com Google");
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("returnTo");
    if (user && saved) {
      sessionStorage.removeItem("returnTo");
      navigate({ to: safePath(saved), replace: true });
    }
  }, [user, navigate]);

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 font-display text-5xl tracking-wide">{mode === "in" ? "Entrar" : "Criar conta"}</h1>
      <p className="mb-8 text-sm text-muted-foreground">Para guardar seu histórico em qualquer aparelho.</p>
      {sent ? (
        <p className="rounded-lg border border-border bg-card p-4 text-sm">Enviamos um link de confirmação para <b>{email}</b>. Confirme para entrar.</p>
      ) : (
        <>
          <Button variant="secondary" className="w-full" onClick={google}>Continuar com Google</Button>
          <div className="my-6 text-center text-xs text-muted-foreground">ou com e-mail</div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="pw">Senha</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "Entrar" : "Criar conta"}</Button>
          </form>
          <button className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
          </button>
        </>
      )}
    </main>
  );
}
