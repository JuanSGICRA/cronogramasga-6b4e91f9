import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Control & Cumplimiento SGA 2026" },
      {
        name: "description",
        content:
          "Dashboard de seguimiento y cumplimiento del Sistema de Gestión Ambiental 2026: actividades PHVA, responsables y programas PUAA, PGIRS y PUEAE.",
      },
      { property: "og:title", content: "Control & Cumplimiento SGA 2026" },
      {
        property: "og:description",
        content:
          "Seguimiento de actividades ambientales, cronograma PHVA y cumplimiento por responsable y programa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardGate,
});

function DashboardGate() {
  const [status, setStatus] = useState<"checking" | "redirecting">("checking");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setStatus("redirecting");
      if (data.session) {
        window.location.replace("/dashboard.html");
      } else {
        window.location.replace("/auth");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {status === "checking" ? "Verificando sesión…" : "Redirigiendo…"}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Si no eres redirigido,{" "}
          <a href="/auth" className="underline text-primary">
            inicia sesión aquí
          </a>
          .
        </p>
      </div>
    </div>
  );
}
