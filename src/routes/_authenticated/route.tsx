import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isActive = true;

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!isActive) return;

        if (error || !data.user) {
          window.location.replace("/auth");
          return;
        }

        setIsAuthorized(true);
      })
      .catch(() => {
        if (isActive) window.location.replace("/auth");
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (!isAuthorized) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
