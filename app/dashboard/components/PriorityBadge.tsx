
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/database.types";

type Priority = Database["public"]["Enums"]["appointment_priority"];

type PriorityBadgeProps = {
  priority: Priority;
};

const priorityMap: Record<
  Priority,
  { text: "Înaltă" | "Medie" | "Scăzută"; className: string }
> = {
  High: {
    text: "Înaltă",
    className:
      "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/20 dark:text-red-400",
  },
  Medium: {
    text: "Medie",
    className:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  Low: {
    text: "Scăzută",
    className:
      "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/20 dark:text-green-400",
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { text, className } = priorityMap[priority] || {
    text: "Necunoscută",
    className: "bg-gray-100 text-gray-800",
  };

  return <Badge className={cn(className)}>{text}</Badge>;
}
