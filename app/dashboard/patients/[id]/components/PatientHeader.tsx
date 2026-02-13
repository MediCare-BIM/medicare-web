import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PatientData } from './types';

interface PatientHeaderProps {
  patientData: PatientData;
}

export function PatientHeader({ patientData }: PatientHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href="/dashboard/patients"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Înapoi la listă
      </Link>

      {/* Patient Info */}
      <div className="flex items-start gap-3 mb-2">
        <h1 className="text-2xl font-bold">{patientData.name}</h1>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {patientData.status}
        </span>
      </div>
      <p className="text-muted-foreground flex items-center gap-2">
        <span className="truncate max-w-md">{patientData.conditions}</span>
        <span>| {patientData.age} ani</span>
      </p>
    </div>
  );
}
