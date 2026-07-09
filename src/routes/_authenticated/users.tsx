import { createFileRoute, useServerFn } from "@tanstack/react-start";
import { createFileRoute as _crf } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { listUsersWithRoles, setUserRole, removeUserRole, getMyRoles } from "@/lib/users.functions";

export const Route = _crf("/_authenticated/users")({
  head: () => ({
    meta: [
      { title: "Gestión de usuarios · SGA C.R.A." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: UsersPage,
});

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
  lector: "Lector",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Puede realizar todas las operaciones en la plataforma.",
  editor: "Puede cambiar el estado de las actividades (planeada/ejecutada).",
  lector: "Solo puede observar el panel, sin editar.",
};

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
};

function UsersPage() {
  const fetchUsers = useServerFn(listUsersWithRoles);
  const fetchMyRoles = useServerFn(getMyRoles);
  const assignRole = useServerFn(setUserRole);
  const clearRole = useServerFn(removeUserRole);

  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [me, list] = await Promise.all([fetchMyRoles(), fetchUsers()]);
      const admin = me.roles.includes("admin");
      setIsAdmin(admin);
      if (admin) setUsers(list.users);
    } catch (e) {
      setIsAdmin(false);
      setError(e instanceof Error ? e.message : "Error cargando usuarios");
    }
  }, [fetchMyRoles, fetchUsers]);

  useEffect(() => {
    void load();
  }, [load]);

  const change = async (userId: string, role: string) => {
    setBusyId(userId);
    setError(null);
    try {
      if (role === "") {
        await clearRole({ data: { userId } });
      } else {
        await assignRole({ data: { userId, role: role as "admin" | "editor" | "lector" } });
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el rol");
    } finally {
      setBusyId(null);
    }
  };

  if (isAdmin === null) {
    return <PageShell><p className="text-sm text-muted-foreground">Cargando…</p></PageShell>;
  }
  if (!isAdmin) {
    return (
      <PageShell>
        <p className="text-sm text-destructive">
          Solo los administradores pueden gestionar roles de usuarios.
        </p>
        {error && <p className="mt-2 text-xs text-muted-foreground">{error}</p>}
        <a href="/dashboard.html" className="mt-4 inline-block text-sm text-primary underline">
          Volver al panel
        </a>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gestión de usuarios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Asigna un rol a cada usuario registrado.
          </p>
        </div>
        <a
          href="/dashboard.html"
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent"
        >
          ← Panel
        </a>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {(["admin", "editor", "lector"] as const).map((r) => (
          <div key={r} className="rounded-lg border border-border bg-card p-3">
            <p className="text-sm font-medium text-foreground">{ROLE_LABELS[r]}</p>
            <p className="mt-1 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Usuario</th>
              <th className="px-4 py-2 font-medium">Rol actual</th>
              <th className="px-4 py-2 font-medium">Asignar rol</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => {
              const current = u.roles[0] ?? "";
              return (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{u.email || "(sin correo)"}</div>
                    <div className="text-xs text-muted-foreground">{u.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    {current ? (
                      <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {ROLE_LABELS[current] ?? current}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin rol</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={current}
                      disabled={busyId === u.id}
                      onChange={(e) => change(u.id, e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                    >
                      <option value="">— Sin rol —</option>
                      <option value="admin">Administrador</option>
                      <option value="editor">Editor</option>
                      <option value="lector">Lector</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {users && users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No hay usuarios registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl">{children}</div>
    </div>
  );
}
