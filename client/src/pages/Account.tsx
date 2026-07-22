import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Badges } from "@/components/Badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Bell, Palette, Trophy } from "lucide-react";
import { toast } from "sonner";
import api, { unwrap, errMessage } from "@/lib/api";
import { badgeIcon } from "@/lib/icons";

const Account = () => {
  const queryClient = useQueryClient();

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: async () => unwrap(await api.get("/user/me")) });
  const { data: badges } = useQuery({ queryKey: ["badges"], queryFn: async () => unwrap(await api.get("/achievements")) });

  const [profile, setProfile] = useState({
    username: "", email: "", bio: "",
    email_notifications: true, streak_alerts: true, leaderboard_updates: false,
  });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });

  // Seed the form once the profile loads.
  useEffect(() => {
    if (me) {
      setProfile({
        username: me.username || "",
        email: me.email || "",
        bio: me.bio || "",
        email_notifications: me.email_notifications,
        streak_alerts: me.streak_alerts,
        leaderboard_updates: me.leaderboard_updates,
      });
    }
  }, [me]);

  const saveProfile = useMutation({
    mutationFn: async () => unwrap(await api.put("/user/profile", profile)),
    onSuccess: () => {
      toast.success("Profile saved");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => toast.error(errMessage(e, "Could not save profile")),
  });

  const changePassword = useMutation({
    mutationFn: async () => unwrap(await api.put("/user/password", { currentPassword: pw.currentPassword, newPassword: pw.newPassword })),
    onSuccess: () => {
      toast.success("Password updated");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    },
    onError: (e) => toast.error(errMessage(e, "Could not update password")),
  });

  const changeAvatar = useMutation({
    mutationFn: async (url: string) => unwrap(await api.put("/user/avatar", { avatarUrl: url })),
    onSuccess: () => {
      toast.success("Avatar updated");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => toast.error(errMessage(e, "Could not update avatar")),
  });

  const handlePasswordSubmit = () => {
    if (pw.newPassword !== pw.confirm) return toast.error("Passwords do not match");
    if (pw.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    changePassword.mutate();
  };

  const handleAvatar = () => {
    const url = window.prompt("Paste an image URL for your avatar:");
    if (url) changeAvatar.mutate(url);
  };

  // Map backend badges (icon key) into the shape the Badges component expects.
  const badgeList = (badges || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: badgeIcon(b.icon),
    earned: b.earned,
    earnedDate: b.earnedDate,
    rarity: b.rarity,
  }));

  const initial = (me?.full_name || me?.username || "A").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Account <span className="text-primary">Settings</span>
          </h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </header>

        {/* Profile Section */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card space-y-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Profile</h2>
          </div>

          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 bg-secondary">
              <AvatarImage src={me?.avatar_url || ""} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-3xl font-bold">{initial}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button onClick={handleAvatar} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Change Avatar
              </Button>
              <p className="text-xs text-muted-foreground">Paste an image URL</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" className="min-h-[100px]" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." />
            </div>
          </div>

          <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saveProfile.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>

        {/* Account Security */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Account Security</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="••••••••" />
              </div>
            </div>
          </div>

          <Button onClick={handlePasswordSubmit} disabled={changePassword.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {changePassword.isPending ? "Updating…" : "Update Password"}
          </Button>
        </div>

        {/* Notifications */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive daily study reminders</p>
              </div>
              <input type="checkbox" checked={profile.email_notifications} onChange={(e) => setProfile({ ...profile, email_notifications: e.target.checked })} className="w-5 h-5" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Streak Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when your streak is at risk</p>
              </div>
              <input type="checkbox" checked={profile.streak_alerts} onChange={(e) => setProfile({ ...profile, streak_alerts: e.target.checked })} className="w-5 h-5" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Leaderboard Updates</p>
                <p className="text-sm text-muted-foreground">Weekly ranking notifications</p>
              </div>
              <input type="checkbox" checked={profile.leaderboard_updates} onChange={(e) => setProfile({ ...profile, leaderboard_updates: e.target.checked })} className="w-5 h-5" />
            </div>
          </div>
          <Button onClick={() => saveProfile.mutate()} variant="outline" className="border-border">Save preferences</Button>
        </div>

        {/* Stats Overview */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Your Stats</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{(me?.xp ?? 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">Level {me?.level ?? 1}</p>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{me?.streak ?? 0}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{me?.total_cards_mastered ?? 0}</p>
              <p className="text-sm text-muted-foreground">Cards Mastered</p>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Achievements</h2>
          </div>
          <Badges badges={badgeList} />
        </div>
      </div>
    </div>
  );
};

export default Account;
