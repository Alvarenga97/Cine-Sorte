import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProfileForm } from "@/components/ProfileForm";
import { useApp } from "@/hooks/use-app";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Crie seu perfil — CineSorte" },
      { name: "description", content: "Conte seus gêneros, humor e duração preferidos para sortearmos o filme certo." },
      { property: "og:title", content: "Crie seu perfil — CineSorte" },
      { property: "og:description", content: "Seu perfil cinematográfico em 30 segundos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { saveProfile } = useApp();
  const navigate = useNavigate();
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-primary">Bem-vindo</p>
      <h1 className="mb-8 font-display text-6xl tracking-wide">Monte seu perfil de cinema</h1>
      <ProfileForm
        submitLabel="Criar perfil e começar"
        onSubmit={async (v) => {
          await saveProfile(v);
          toast.success("Perfil salvo");
          navigate({ to: "/" });
        }}
      />
    </main>
  );
}
