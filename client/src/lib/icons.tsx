import { Flame, Star, Zap, Brain, Sword, Layers, Moon, Trophy, Crown } from "lucide-react";

// The backend sends a string icon key on each badge; map it to a JSX icon.
const ICONS: Record<string, typeof Trophy> = {
  flame: Flame,
  star: Star,
  zap: Zap,
  brain: Brain,
  sword: Sword,
  layers: Layers,
  moon: Moon,
  trophy: Trophy,
  crown: Crown,
};

export const badgeIcon = (key: string, className = "w-5 h-5") => {
  const Icon = ICONS[key] || Trophy;
  return <Icon className={className} />;
};
