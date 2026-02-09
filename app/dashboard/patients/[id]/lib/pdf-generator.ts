import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TimelineItem } from '../components/types';

export function generateLabResultsPDF(item: TimelineItem) {
  if (!item.resultData?.results || item.resultData.results.length === 0) {
    console.warn('No lab results data available for PDF generation');
    return;
  }

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Rezultate Analize Medicale', 14, 20);

  // Add subtitle and date
  doc.setFontSize(11);
  doc.text(item.title || '', 14, 30);
  doc.text(item.subtitle || '', 14, 36);

  // Add doctor and location if available
  let yPosition = 42;
  if (item.doctor) {
    doc.text(`Medic: ${item.doctor}`, 14, yPosition);
    yPosition += 6;
  }
  if (item.location) {
    doc.text(`Locație: ${item.location}`, 14, yPosition);
    yPosition += 6;
  }

  yPosition += 4;

  // Prepare table data
  const tableData = item.resultData.results.map((result: any) => [
    result?.test_name || result?.name || 'N/A',
    `${result?.result ?? 'N/A'} ${result?.unit || ''}`,
    result?.reference_range || 'N/A',
    result?.is_normal ? 'Normal' : 'În afara valorilor',
    result?.explanation.trend || '',
  ]);

  // Add table
  autoTable(doc, {
    startY: yPosition,
    head: [['Test', 'Rezultat', 'Valori de referință', 'Status', 'Explicație']],
    body: tableData,
    theme: 'striped',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 'auto' },
    },
    didDrawCell: (data) => {
      // Color-code the status column
      if (data.column.index === 3 && data.section === 'body') {
        const result = item.resultData.results[data.row.index];
        if (result && !result.is_normal) {
          doc.setTextColor(220, 38, 38); // Red color
        }
      }
    },
  });

  // Generate filename with date
  const filename = `Rezultate_Analize.pdf`;

  // Save the PDF
  doc.save(filename);
}
