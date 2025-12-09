
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SummaryCardProps = {
  data: any;
};

export function SummaryCard({ data }: SummaryCardProps) {
  const { title, value, percentageChange, icon: Icon } = data;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{percentageChange} de luna trecută</p>
      </CardContent>
    </Card>
  );
}
