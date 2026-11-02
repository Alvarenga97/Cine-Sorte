import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProfileForm } from "@/components/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/hooks/use-app";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Editar perfil — Flixy" },
      { name: "description", content: "Ajuste seus gêneros favoritos, humor e duração preferida." },
      { property: "og:title", content: "Editar perfil — Flixy" },
      { property: "og:description", content: "Ajuste seu perfil cinematográfico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { ready, profile, saveProfile } = useApp();
  const navigate = useNavigate();
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 font-display text-6xl tracking-wide">Meu perfil</h1>
      {!ready ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <ProfileForm
          key={profile?.updatedAt ?? "new"}
          initial={profile}
          submitLabel="Salvar perfil"
          onSubmit={async (v) => {
            await saveProfile(v);
            toast.success("Perfil salvo");
            navigate({ to: "/" });
          }}
        />
      )}
    </main>
  );
}
