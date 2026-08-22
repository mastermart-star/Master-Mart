import {
  Apple,
  Cookie,
  CupSoda,
  Dessert,
  Fish,
  Flame,
  Grid3x3,
  Home,
  Leaf,
  PawPrint,
  Sparkles,
  Wheat,
} from "lucide-react";

const ICONS = {
  Grid: Grid3x3,
  Apple,
  Cookie,
  Dessert,
  CupSoda,
  Wheat,
  Sparkles,
  Home,
  Fish,
  Flame,
  Leaf,
  PawPrint,
} as const;

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? Grid3x3;
  return <Icon className={className} />;
}
