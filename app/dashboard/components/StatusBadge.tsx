
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Patient } from "@/lib/dummy-data";
import { CheckCircle, Loader, Clock } from "lucide-react";

type StatusBadgeProps = {
  status: Patient["status"];
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    Finalizat: {
      icon: CheckCircle,
      color:
        "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/20 dark:text-green-400",
    },
    Programat: {
      icon: Clock,
      color:
        "bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/20 dark:text-blue-400",
    },
    "În curs": {
      icon: Loader,
      color:
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
  };

  const { icon: Icon, color } = statusConfig[status];

  return (
    <Badge variant="outline" className={cn("gap-x-1.5", color)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{status}</span>
    </Badge>
  );
}
