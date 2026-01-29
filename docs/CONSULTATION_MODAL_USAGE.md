# Consultation Report Modal - Usage Guide

## Quick Start

The consultation report modal is now fully integrated into the Reports page. Follow these steps to use it:

## For Users

1. Navigate to the **Rapoarte** (Reports) page
2. Click the **"Generează raport"** button (blue button in top right)
3. Select **"Consultație"** from the dropdown menu
4. The multi-step modal will open

### Step 1: Detalii Pacient (Patient Details)

- **Required Fields:**
  - Search and select a patient from the dropdown
  - Choose consultation date using the calendar picker
  - Select consultation purpose (Initial, Control, etc.)
  - Enter visit reason in the text area

- Click **"Continuă"** to proceed to next step

### Step 2: Detalii Consultație (Consultation Details)

- **Optional Fields:**
  - Enter clinical findings
  - Enter preliminary diagnosis

- Click **"Înapoi"** to go back or **"Continuă"** to proceed

### Step 3: Plan și Recomandări (Plan and Recommendations)

- **Optional Fields:**
  - Enter recommended treatment
  - Enter recommended investigations/tests
  - Add supplementary observations

- **AI Feature:** Click **"Completează cu AI"** button for AI-assisted completion (placeholder for now)
- Click **"Generează"** to save the consultation report

## For Developers

### How to Open the Modal Programmatically

```tsx
import { useState } from 'react';
import { ConsultationFormProvider } from './ConsultationFormContext';
import { ConsultationReportModal } from './ConsultationReportModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ConsultationFormProvider>
      <button onClick={() => setIsOpen(true)}>Open Consultation Modal</button>

      <ConsultationReportModal open={isOpen} onOpenChange={setIsOpen} />
    </ConsultationFormProvider>
  );
}
```

### Accessing Form Data

If you need to access or manipulate form data:

```tsx
import { useConsultationForm } from './ConsultationFormContext';

function MyComponent() {
  const { formData, updateFormData, resetForm } = useConsultationForm();

  // Read data
  console.log(formData.patientId);

  // Update data
  updateFormData({ visitReason: 'New reason' });

  // Reset all data
  resetForm();
}
```

### Adding Custom Validation

To add validation for a specific step, modify the `validateStep()` function in [ConsultationReportModal.tsx](../app/reports/components/ConsultationReportModal.tsx):

```tsx
const validateStep = () => {
  if (currentStep === 1) {
    // Existing validation...
  }

  if (currentStep === 2) {
    // Add Step 2 validation
    if (!formData.diagnosis.trim()) {
      toast.error('Diagnostic is required');
      return false;
    }
  }

  return true;
};
```

### Customizing the AI Completion Feature

To implement actual AI functionality, modify [PlanRecommendationsStep.tsx](../app/reports/components/PlanRecommendationsStep.tsx):

```tsx
const handleAICompletion = async () => {
  setIsAILoading(true);

  try {
    // Call your AI API
    const response = await fetch('/api/ai/complete-consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitReason: formData.visitReason,
        findings: formData.findings,
        diagnosis: formData.diagnosis,
      }),
    });

    const aiSuggestions = await response.json();

    // Update form with AI suggestions
    updateFormData({
      treatment: aiSuggestions.treatment,
      investigations: aiSuggestions.investigations,
      notes: aiSuggestions.notes,
    });

    toast.success('AI suggestions applied');
  } catch (error) {
    toast.error('Failed to get AI suggestions');
  } finally {
    setIsAILoading(false);
  }
};
```

### Database Schema

The modal saves data to the `control_consultations` table:

```sql
CREATE TABLE control_consultations (
  id uuid PRIMARY KEY,
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  visit_reason text NOT NULL,
  findings text,
  diagnosis text,
  treatment text,
  notes text,
  generated_at timestamp DEFAULT now(),
  appointment_id uuid
);
```

**Note:** The "investigations" field is not currently saved to the database. To add it:

1. Run a migration to add the column:

```sql
ALTER TABLE control_consultations
ADD COLUMN investigations text;
```

2. Update the insert statement in [ConsultationReportModal.tsx](../app/reports/components/ConsultationReportModal.tsx):

```tsx
const { error: insertError } = await supabase
  .from('control_consultations')
  .insert({
    // ... existing fields
    investigations: formData.investigations || null,
  });
```

## Troubleshooting

### Modal doesn't open

- Ensure `ConsultationFormProvider` wraps the modal component
- Check that state is properly managed with `useState`

### Patient list is empty

- Verify Supabase connection is working
- Check that `patients` table has data
- Check console for API errors

### Submission fails

- Verify user is authenticated
- Check that doctor record exists for current user
- Review console for detailed error messages

### Validation always fails

- Check that required fields have values
- Verify field names match between form and validation

## Component Architecture

```
Reports.tsx
└── ConsultationFormProvider (Context)
    ├── ConsultationReportModal (Container)
    │   ├── Progress Indicator
    │   ├── PatientDetailsStep (Step 1)
    │   ├── ConsultationDetailsStep (Step 2)
    │   ├── PlanRecommendationsStep (Step 3)
    │   └── Navigation Buttons
    └── [Other page content]
```

## Styling Customization

The modal uses Tailwind CSS classes. To customize:

**Progress Indicator Colors:**

```tsx
// In ConsultationReportModal.tsx
className={`... ${
  currentStep === step.number
    ? 'border-purple-500 bg-purple-500'  // Change from blue-500
    : // ...
}`}
```

**Button Colors:**

```tsx
// Use different button variants
<Button variant="default">   // Blue (primary)
<Button variant="outline">   // White with border
<Button variant="destructive">  // Red
<Button variant="secondary">  // Gray
```

**Modal Size:**

```tsx
<DialogContent className="max-w-3xl">  // Change from max-w-2xl
```

## Performance Optimization

The implementation already includes:

- ✅ Context API for efficient state management
- ✅ Memoized filtered results
- ✅ Optimistic UI updates
- ✅ Proper cleanup on unmount

For further optimization:

- Consider adding debouncing to patient search
- Implement virtual scrolling for large patient lists
- Add React.memo to step components if needed

## Accessibility

The modal includes:

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Screen reader announcements

To enhance:

- Add aria-live regions for dynamic content
- Implement skip links for long forms
- Add keyboard shortcuts (e.g., Ctrl+S to save)
