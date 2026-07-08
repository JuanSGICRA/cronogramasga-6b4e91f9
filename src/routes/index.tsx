import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

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
  component: DashboardRedirect,
});

function DashboardRedirect() {
  useEffect(() => {
    window.location.replace("/dashboard.html");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Cargando Sistema de Gestión Ambiental…
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Si no eres redirigido,{" "}
          <a href="/dashboard.html" className="underline text-primary">
            abre el dashboard aquí
          </a>
          .
        </p>
      </div>
    </div>
  );
}
