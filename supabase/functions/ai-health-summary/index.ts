// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// SETUP INSTRUCTIONS (via Supabase Dashboard):
//
// 1. DEPLOY THE EDGE FUNCTION
//    - Deploy via Dashboard: Functions → Deploy new function
//
// 2. SET ENVIRONMENT SECRETS
//    Go to: Project Settings → Edge Functions → Secrets
//    Add the following secrets:
//    - OPENAI_ENDPOINT: Your OpenAI API endpoint URL
//      Example: https://api.openai.com/v1/chat/completions
//      Or Azure OpenAI: https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions?api-version=2024-02-15-preview
//    - OPENAI_ACESS_TOKEN: Your OpenAI API key
//      Example: sk-proj-xxxxxxxxxxxxx
//      Or Azure: Your Azure OpenAI API key
//
// 3. CREATE DATABASE WEBHOOKS (for automatic triggers)
//    Go to: Database → Webhooks → Create a new webhook
//    
//    Create 4 webhooks (one for each table):
//    
//    Webhook 1: Allergies
//    - Name: allergies_ai_summary_trigger
//    - Table: allergies
//    - Events: INSERT, UPDATE, DELETE
//    - Type: HTTP Request
//    - Method: POST
//    - URL: https://YOUR-PROJECT-REF.supabase.co/functions/v1/ai-health-summary
//    - HTTP Headers: (leave default or add custom headers if needed)
//    
//    Webhook 2: Prescriptions
//    - Name: prescriptions_ai_summary_trigger
//    - Table: prescriptions
//    - Events: INSERT, UPDATE, DELETE
//    - Type: HTTP Request
//    - Method: POST
//    - URL: https://YOUR-PROJECT-REF.supabase.co/functions/v1/ai-health-summary
//    
//    Webhook 3: Lab Results
//    - Name: lab_results_ai_summary_trigger
//    - Table: lab_results
//    - Events: INSERT, UPDATE, DELETE
//    - Type: HTTP Request
//    - Method: POST
//    - URL: https://YOUR-PROJECT-REF.supabase.co/functions/v1/ai-health-summary
//    
//    Webhook 4: Control Consultations
//    - Name: control_consultations_ai_summary_trigger
//    - Table: control_consultations
//    - Events: INSERT, UPDATE, DELETE
//    - Type: HTTP Request
//    - Method: POST
//    - URL: https://YOUR-PROJECT-REF.supabase.co/functions/v1/ai-health-summary
//
// 4. CREATE THE ai_summaries TABLE (if not exists)
//    Go to: Database → Tables → Create a new table
//    - Table name: ai_summaries
//    - Columns:
//      * id: int8, primary key, auto-increment
//      * patient_id: text or uuid (match your patients table)
//      * content: jsonb
//      * generated_at: timestamptz, default: now()
//      * created_at: timestamptz, default: now()
//    - Add unique constraint on patient_id (for upsert functionality)


const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

const createPrompt = (patientFile: object) => {
    return `
You are a clinical assistant that analyzes a Romanian citizen's "Dosar Electronic de Sănătate" (Electronic Health Record). 
Your task is to generate a concise, professional, and medically relevant summaries for a patients health based on the data provided in <ONLINE_HEALTH_DATA>.

Output must be in JSON format using the structure below.

---

### REQUIRED OUTPUT FORMAT
{
  summaries: [
    {
      subject: string;
      summary: string;
    },
    {
      subject: string;
      summary: string;
    },
    ....
  ]
}

---

### INSTRUCTIONS
- Use only information explicitly present in the provided health file.
- Do not invent diagnoses or data — infer responsibly and flag uncertainties.
- Prioritize clinical relevance and brevity.
- Keep the language in Romanian (clear, professional tone).
- Focus on aspects that a doctor would want to review before seeing the patient:
  - Active/chronic conditions
  - Recent test abnormalities
  - Allergies and medications
  - Family history and lifestyle factors
  - Overdue tests or follow-ups
  - Any signs of disease progression
- You should create only 3 or less most important summaries about a patients health
- Subject must be a 2-3 word expression that describes the summary
- Summary must be a sentence of a maximum 10 word length.
- You must use the following subjects, if not possible create one similar to them:
  - Key Clinical Conditions
  - Safety-Critical Information
  - Significant Findings & Trends
  - Attention Points

---

<ONLINE_HEALTH_DATA>
${JSON.stringify(patientFile)}
</ONLINE_HEALTH_DATA>
`;
}

Deno.serve(async (req: Request) => {
    console.log("Request")
    const request = await req.json()
    console.log(request.record)

    const { patient_id } = request.record;
    console.log(`Patient id: ${patient_id}`)

    if (!patient_id) return;

    // Run all four queries in parallel for better performance
    const [allergies, prescriptions, labResults, controlConsultations] = await Promise.all([
        supabase.from('allergies').select('*').eq('patient_id', patient_id),
        supabase.from('prescriptions').select('*').eq('patient_id', patient_id),
        supabase.from('lab_results').select('*').eq('patient_id', patient_id),
        supabase.from('control_consultations').select('*').eq('patient_id', patient_id)
    ]);

    // Check for errors in any of the queries
    if (allergies.error || prescriptions.error || labResults.error || controlConsultations.error) {
        console.error("Database error:", allergies.error || prescriptions.error || labResults.error || controlConsultations.error);
        return new Response("Error fetching patient data", { status: 500 });
    }

    console.log("Allergies", allergies);
    console.log("Prescriptions", prescriptions);
    console.log("Lab results", labResults);
    console.log("Control consultations", controlConsultations);

    const patientJson: {
        allergies?: Array<{ name: any, severity: any }>,
        prescriptions?: Array<{ medications: any }>,
        labResults?: Array<{ testName: any, results: any, resultDate: any }>,
        controlConsultations?: Array<{ visitReason: any, findings: any, diagnosis: any, treatment: any, notes: any }>
    } = {}

    if (allergies && allergies.data && allergies.data.length > 0) {
        patientJson.allergies = []
        allergies.data.forEach((allergy: any) => {
            patientJson.allergies!.push({
                name: allergy.name,
                severity: allergy.severity
            })
        })
    }

    if (prescriptions && prescriptions.data && prescriptions.data.length > 0) {
        patientJson.prescriptions = []
        prescriptions.data.forEach((prescription: any) => {
            patientJson.prescriptions!.push({
                medications: prescription.medications
            })
        })
    }

    if (labResults && labResults.data && labResults.data.length > 0) {
        patientJson.labResults = []
        labResults.data.forEach((labResult: any) => {
            patientJson.labResults!.push({
                testName: labResult.test_name,
                results: labResult.results,
                resultDate: labResult.result_date
            })
        })
    }

    if (controlConsultations && controlConsultations.data && controlConsultations.data.length > 0) {
        patientJson.controlConsultations = []
        controlConsultations.data.forEach((consultation: any) => {
            patientJson.controlConsultations!.push({
                visitReason: consultation.visit_reason,
                findings: consultation.findings,
                diagnosis: consultation.diagnosis,
                treatment: consultation.treatment,
                notes: consultation.notes
            })
        })
    }


    console.log('Patient JSON', patientJson)

    const endpoint = Deno.env.get("OPENAI_ENDPOINT");
    const apiKey = Deno.env.get("OPENAI_ACESS_TOKEN");


    const prompt = createPrompt(patientJson);

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
        },
        body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
        }),
    });

    console.log("Response status:", response.status);
    const llmData = await response.json();

    console.log("OpenAI Completion response", JSON.parse(llmData.choices[0].message.content))

    if (!llmData.choices[0].message.content) {
        throw new Error("Invalid openai response")
    }

    const summaryData = {
        patient_id: patient_id,
        content: JSON.parse(llmData.choices[0].message.content),
        generated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('ai_summaries')
        .upsert(summaryData, {
            onConflict: 'patient_id' // This tells Postgres which column to check for duplicates
        })
        .select();

    if (error) {
        console.error("Upsert error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
        { headers: { 'Content-Type': 'application/json' } }
    );
});