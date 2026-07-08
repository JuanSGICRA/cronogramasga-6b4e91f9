import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · SGA 2026" },
      { name: "description", content: "Inicia sesión para acceder al dashboard de gestión ambiental SGA 2026." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) {
        window.location.replace("/dashboard.html");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          window.location.replace("/dashboard.html");
        } else {
          setInfo("Revisa tu correo para confirmar la cuenta y luego inicia sesión.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.replace("/dashboard.html");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error instanceof Error ? result.error.message : String(result.error));
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      window.location.replace("/dashboard.html");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accede al Sistema de Gestión Ambiental C.R.A.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 6.7 29 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 5.7 29 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5 0 9.6-1.7 13.2-4.6l-6.1-5.2C29 35.7 26.6 36.5 24 36.5c-5.3 0-9.7-2.9-11.3-7l-6.5 5C9.7 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 3.9-3.7 5.2l6.1 5.2c-.4.4 6.7-4.9 6.7-14.4 0-1.2-.1-2.3-.4-3.5z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>o con correo</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground" htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {info && <p className="text-xs text-emerald-600 dark:text-emerald-400">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Procesando…" : mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button className="text-primary underline" onClick={() => { setMode("signup"); setError(null); setInfo(null); }}>
                Crear cuenta
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button className="text-primary underline" onClick={() => { setMode("signin"); setError(null); setInfo(null); }}>
                Iniciar sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
