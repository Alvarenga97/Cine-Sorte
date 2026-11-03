import { Link, useNavigate } from "@tanstack/react-router";
import logo from "@/assets/flixy-logo.png";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/hooks/use-app";
import { Button } from "@/components/ui/button";

const linkCls = "text-sm text-muted-foreground transition-colors hover:text-foreground";
const active = { className: "text-sm text-primary" };

export function SiteHeader() {
  const { user, signOut } = useApp();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center" aria-label="Flixy">
          <img src={logo} alt="Flixy" width={1536} height={768} className="-my-2 h-16 w-auto" />
        </Link>
        <nav className="flex items-center gap-5">
          <Link to="/" className={linkCls} activeProps={active} activeOptions={{ exact: true }}>Sortear</Link>
          <Link to="/profile" className={linkCls} activeProps={active}>Meu perfil</Link>
          <Link to="/history" className={linkCls} activeProps={active}>Histórico</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await qc.cancelQueries();
                  await signOut();
                  navigate({ to: "/", replace: true });
                }}
              >
                Sair
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
