import { Badge } from "@/components/ui/badge";

const categoryColors: Record<string, string> = {
  "Main Course": "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  "Appetizer": "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  "Snacks": "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  "Fast Food": "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  "Traditional Nepali": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  "Dessert": "bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400",
  "Beverage": "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
};

export default function MenuCategoryBadge({ category }: { category: string }) {
  const colorClass =
    categoryColors[category] ||
    "bg-muted text-muted-foreground border-border";

  return (
    <Badge variant="outline" className={`font-medium ${colorClass}`}>
      {category}
    </Badge>
  );
}
