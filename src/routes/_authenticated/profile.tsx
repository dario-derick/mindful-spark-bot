import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — MindTrackAI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getProfile);
  const saveProfile = useServerFn(updateProfile);

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
  });

  const [name, setName] = useState("");
  useEffect(() => {
    if (data?.profile?.display_name) setName(data.profile.display_name);
  }, [data?.profile?.display_name]);

  const save = useMutation({
    mutationFn: (n: string) => saveProfile({ data: { display_name: n } }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your account details.</p>
      </div>

      <Card className="border-border/60 bg-card-gradient shadow-soft">
        <CardHeader>
          <CardTitle className="font-display">Account</CardTitle>
          <CardDescription>{data?.email ?? ""}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
          </div>
          <Button
            onClick={() => save.mutate(name.trim())}
            disabled={save.isPending || !name.trim()}
            className="bg-aurora text-primary-foreground hover:opacity-90"
          >
            {save.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card-gradient shadow-soft">
        <CardHeader>
          <CardTitle className="font-display">Privacy & safety</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Your moods, journals, and conversations are private to your account and protected by row-level security.
          </p>
          <p>
            MindTrackAI is a wellness companion, not a substitute for professional mental health care. If you're in crisis, please reach out to a qualified professional or your local crisis line.
          </p>
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={signOut} className="gap-2">
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}
