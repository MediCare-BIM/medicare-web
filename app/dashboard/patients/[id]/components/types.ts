export type TimelineItemType = 'consultatie' | 'analiza' | 'prescriptie';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  title: string;
  subtitle: string;
  date: string;
  doctor?: string;
  location?: string;
  visitReason?: string;
  findings?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  pdfFile?: {
    name: string;
    size: string;
  };
  resultData?: any;
}

export interface PatientData {
  id: string;
  name: string;
  status: string;
  conditions: string;
  age: number;
}

export interface AiSummary {
  eventsAnalyzed: number;
  summaries: Array<{
    subject: string;
    summary: string;
  }>;
}

export interface FilterCounts {
  consultatie: number;
  analiza: number;
  prescriptie: number;
}
