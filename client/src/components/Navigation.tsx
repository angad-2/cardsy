import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, BarChart3, Trophy, Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { clearToken } from "@/lib/api";
import { toast } from "sonner";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    toast.success("Logged out");
    navigate("/auth");
  };

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/decks", icon: BookOpen, label: "Decks" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/social", icon: Trophy, label: "Social" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                    active
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            
            <Link to="/account" className="hover:opacity-80 transition-opacity">
              <Avatar className="w-10 h-10 bg-secondary">
                <AvatarImage src="" />
                <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                  A
                </AvatarFallback>
              </Avatar>
            </Link>

            <button
              onClick={handleLogout}
              title="Log out"
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
