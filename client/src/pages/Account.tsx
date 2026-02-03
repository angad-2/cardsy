import { Navigation } from "@/components/Navigation";
import { Badges, SAMPLE_BADGES } from "@/components/Badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Bell, Palette, Trophy } from "lucide-react";

const Account = () => {
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
              <AvatarImage src="" />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-3xl font-bold">
                A
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Change Avatar
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Student123" defaultValue="Student" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="student@email.com" defaultValue="student@example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
                defaultValue="Passionate learner trying to master flashcards!"
              />
            </div>
          </div>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save Changes
          </Button>
        </div>

        {/* Account Settings */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Account Security</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Update Password
          </Button>
        </div>

        {/* Preferences */}
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
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Streak Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when your streak is at risk</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Leaderboard Updates</p>
                <p className="text-sm text-muted-foreground">Weekly ranking notifications</p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Your Stats</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">3,450</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">Level 7</p>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">12</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">247</p>
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
          <Badges badges={SAMPLE_BADGES} />
        </div>
      </div>
    </div>
  );
};

export default Account;
