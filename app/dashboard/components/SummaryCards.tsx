
import { SummaryData } from "@/lib/types";
import { SummaryCard } from "./SummaryCard";

type SummaryCardsProps = {
  summaryData: SummaryData[];
};

export function SummaryCards({ summaryData }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {summaryData.map((data) => (
        <SummaryCard key={data.title} data={data} />
      ))}
    </div>
  );
}
