// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// SETUP INSTRUCTIONS (via Supabase Dashboard):
//
// 1. DEPLOY THE EDGE FUNCTION
//    - Deploy via Dashboard: Functions → Deploy new function
//    - Or run: supabase functions deploy consultation-generator
//
// 2. SET ENVIRONMENT SECRETS
//    Go to: Project Settings → Edge Functions → Secrets
//    Required secrets:
//    - X_API_KEY: Your API key for authentication
//    - OPENAI_ENDPOINT: Your OpenAI API endpoint URL
//    - OPENAI_ACESS_TOKEN: Your OpenAI API key
//
// 3. USAGE
//    Method: POST
//    URL: https://YOUR-PROJECT-REF.supabase.co/functions/v1/consultation-generator
//    Content-Type: application/json
//    Headers:
//    - x-api-key: Your API key (required)
//
//    Body (JSON):
//    {
//      "patientId": "string (required)",
//      "consultationPurpose": "Initial" | "Control" | "Ajustare tratament" | "Evaluare simptom" (required),
//      "visitReason": "string (required)",
//      "findings": "string (optional - used for context, not modified)",
//      "diagnosis": "string (optional - AI will generate if missing, enhance if provided)",
//      "treatment": "string (optional - AI will generate if missing, enhance if provided)",
//      "investigations": "string (optional - AI will generate if missing, enhance if provided)",
//      "notes": "string (optional - used for context, not modified)"
//    }
//
//    Returns:
//    {
//      "success": true,
//      "consultation": {
//        "patientId": "string",
//        "consultationPurpose": "string",
//        "visitReason": "string",
//        "diagnosis": "string (AI generated/enhanced)",
//        "treatment": "string (AI generated/enhanced)",
//        "investigations": "string (AI generated/enhanced)",
//        "findings": "string (if provided)",
//        "notes": "string (if provided)"
//      }
//    }

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

type ConsultationPurpose = 'Initial' | 'Control' | 'Ajustare tratament' | 'Evaluare simptom';

interface ConsultationInput {
    patientId: string;
    consultationPurpose: ConsultationPurpose;
    visitReason: string;
    findings?: string;
    diagnosis?: string;
    treatment?: string;
    investigations?: string;
    notes?: string;
}

interface PatientHistory {
    labResults?: Array<{ testName: string; results: any; resultDate: string }>;
    prescriptions?: Array<{ medications: any }>;
    controlConsultations?: Array<{
        visitReason: string;
        findings: string;
        diagnosis: string;
        treatment: string;
        notes: string;
    }>;
}

const createPrompt = (input: ConsultationInput, patientHistory: PatientHistory) => {
    const existingFields: Record<string, string> = {};
    const fieldsToGenerate: string[] = [];

    // Check which fields need generation vs enhancement
    if (input.diagnosis && input.diagnosis.trim() !== '') {
        existingFields.diagnosis = input.diagnosis;
    } else {
        fieldsToGenerate.push('diagnosis');
    }

    if (input.treatment && input.treatment.trim() !== '') {
        existingFields.treatment = input.treatment;
    } else {
        fieldsToGenerate.push('treatment');
    }

    if (input.investigations && input.investigations.trim() !== '') {
        existingFields.investigations = input.investigations;
    } else {
        fieldsToGenerate.push('investigations');
    }

    // Context fields (not generated, only used for context)
    const contextFields: Record<string, string> = {};
    if (input.findings && input.findings.trim() !== '') {
        contextFields.findings = input.findings;
    }
    if (input.notes && input.notes.trim() !== '') {
        contextFields.notes = input.notes;
    }

    const contextFieldsInfo = Object.keys(contextFields).length > 0
        ? `\n### INFORMAȚII ADIȚIONALE DIN CONSULTAȚIE (folosește pentru context):\n${JSON.stringify(contextFields, null, 2)}`
        : '';

    const existingFieldsInfo = Object.keys(existingFields).length > 0
        ? `\n### CÂMPURI EXISTENTE (completează și îmbunătățește, NU șterge sau înlocui complet):\n${JSON.stringify(existingFields, null, 2)}`
        : '';

    return `
Ești un asistent medical specializat în generarea rapoartelor de consultație pentru pacienți din România.
Sarcina ta este să generezi sau să completezi câmpurile de mai jos bazându-te pe istoricul medical al pacientului și informațiile furnizate.

IMPORTANT: Tot textul generat TREBUIE să fie în limba română.

---

### INFORMAȚII DESPRE CONSULTAȚIE
- Scopul consultației: ${input.consultationPurpose}
- Motivul prezentării: ${input.visitReason}
${contextFieldsInfo}
${existingFieldsInfo}

---

### ISTORICUL MEDICAL AL PACIENTULUI
${JSON.stringify(patientHistory, null, 2)}

---

### SARCINĂ
Generează sau completează următoarele câmpuri:

1. **diagnosis** (Diagnostic preliminar): ${existingFields.diagnosis
    ? 'Completează și îmbunătățește diagnosticul existent. Păstrează informația originală.'
    : 'Generează un diagnostic preliminar bazat pe simptome și istoric.'}

2. **treatment** (Tratament recomandat): ${existingFields.treatment
    ? 'Completează și îmbunătățește tratamentul existent. Păstrează informația originală.'
    : 'Generează recomandări de tratament adecvate pentru diagnostic. Include medicamente, doze și durata tratamentului dacă este cazul.'}

3. **investigations** (Investigații/analize recomandate): ${existingFields.investigations
    ? 'Completează și îmbunătățește investigațiile existente. Păstrează informația originală.'
    : 'Generează investigații și analize recomandate pentru confirmarea diagnosticului.'}

---

### FORMAT DE IEȘIRE
Răspunde DOAR cu un obiect JSON valid:
{
  "diagnosis": "string - Diagnostic preliminar complet în limba română",
  "treatment": "string - Tratament recomandat în limba română",
  "investigations": "string - Investigații/analize recomandate în limba română"
}

---

### INSTRUCȚIUNI
- Folosește DOAR informații relevante din istoricul medical și motivul prezentării.
- NU inventa date medicale false sau diagnostice fără bază în simptomele prezentate.
- Fii CONCIS - maximum 2-3 propoziții per câmp.
- Adaptează recomandările la scopul consultației (${input.consultationPurpose}).
- Ține cont de alergii și medicamentele curente când recomanzi tratament.
- Răspunde DOAR cu JSON valid, fără text adițional.
`;
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Consultation generator request received")

        // Check API key authentication
        const apiKey = req.headers.get('x-api-key')
        const expectedApiKey = Deno.env.get('X_API_KEY')

        if (!apiKey || apiKey !== expectedApiKey) {
            console.error('Unauthorized: Invalid or missing API key')
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Parse request body
        const contentType = req.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
            return new Response(
                JSON.stringify({ error: 'Invalid content type. Expected application/json' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const input: ConsultationInput = await req.json()

        // Validate required fields
        if (!input.patientId) {
            return new Response(
                JSON.stringify({ error: 'Missing required field: patientId' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        if (!input.consultationPurpose) {
            return new Response(
                JSON.stringify({ error: 'Missing required field: consultationPurpose' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        if (!input.visitReason) {
            return new Response(
                JSON.stringify({ error: 'Missing required field: visitReason' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const validPurposes: ConsultationPurpose[] = ['Initial', 'Control', 'Ajustare tratament', 'Evaluare simptom'];
        if (!validPurposes.includes(input.consultationPurpose)) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid consultationPurpose. Must be one of: Initial, Control, Ajustare tratament, Evaluare simptom'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        console.log(`Processing consultation for patient: ${input.patientId}, purpose: ${input.consultationPurpose}`)

        // Fetch patient history
        const [labResults, prescriptions, controlConsultations] = await Promise.all([
            supabase.from('lab_results').select('*').eq('patient_id', input.patientId),
            supabase.from('prescriptions').select('*').eq('patient_id', input.patientId),
            supabase.from('control_consultations').select('*').eq('patient_id', input.patientId)
        ]);

        if (labResults.error || prescriptions.error || controlConsultations.error) {
            console.error("Database error:", labResults.error || prescriptions.error || controlConsultations.error);
            return new Response(
                JSON.stringify({ error: 'Error fetching patient data' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const patientHistory: PatientHistory = {}

        if (labResults.data && labResults.data.length > 0) {
            patientHistory.labResults = labResults.data.map((lr: any) => ({
                testName: lr.test_name,
                results: lr.results,
                resultDate: lr.result_date
            }))
        }

        if (prescriptions.data && prescriptions.data.length > 0) {
            patientHistory.prescriptions = prescriptions.data.map((p: any) => ({
                medications: p.medications
            }))
        }

        if (controlConsultations.data && controlConsultations.data.length > 0) {
            patientHistory.controlConsultations = controlConsultations.data.map((c: any) => ({
                visitReason: c.visit_reason,
                findings: c.findings,
                diagnosis: c.diagnosis,
                treatment: c.treatment,
                notes: c.notes
            }))
        }

        console.log("Patient history fetched:", JSON.stringify(patientHistory).slice(0, 500))

        // Generate diagnosis using AI
        console.log("Sending to OpenAI for diagnosis generation...")
        const endpoint = Deno.env.get("OPENAI_ENDPOINT");
        const openAiApiKey = Deno.env.get("OPENAI_ACESS_TOKEN");

        if (!endpoint || !openAiApiKey) {
            throw new Error("Missing OpenAI configuration");
        }

        const prompt = createPrompt(input, patientHistory);

        const aiResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": openAiApiKey,
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                max_tokens: 5000,
                temperature: 0.3,
            }),
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error("OpenAI Error:", errorText);
            throw new Error(`OpenAI API error: ${aiResponse.status}`);
        }

        const llmData = await aiResponse.json();
        let generatedFields = {
            diagnosis: '',
            treatment: '',
            investigations: ''
        };

        try {
            console.log("OpenAI response received");
            console.log("Finish reason:", llmData.choices[0]?.finish_reason);

            const content = llmData.choices[0]?.message?.content;

            if (!content) {
                console.error("No content in OpenAI response");
                console.log("Full response:", JSON.stringify(llmData));
                throw new Error("Empty response from AI");
            }

            console.log("Raw content length:", content.length);
            console.log("Raw content preview:", content.substring(0, 500));

            // Check if response was truncated
            if (llmData.choices[0]?.finish_reason === 'length') {
                console.warn("Warning: Response was truncated due to max_tokens limit");
            }

            const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();

            // Try to fix incomplete JSON by closing brackets if needed
            let jsonToParse = cleanContent;
            if (!cleanContent.endsWith('}')) {
                console.warn("JSON appears incomplete, attempting to fix...");
                // Count open braces and close them
                const openBraces = (cleanContent.match(/{/g) || []).length;
                const closeBraces = (cleanContent.match(/}/g) || []).length;
                const missingBraces = openBraces - closeBraces;
                if (missingBraces > 0) {
                    jsonToParse = cleanContent + '}'.repeat(missingBraces);
                }
            }

            const parsed = JSON.parse(jsonToParse);

            generatedFields = {
                diagnosis: parsed.diagnosis || input.diagnosis || '',
                treatment: parsed.treatment || input.treatment || '',
                investigations: parsed.investigations || input.investigations || ''
            };

            console.log("AI generated fields successfully");
        } catch (e) {
            console.error("Failed to parse OpenAI response:", e);
            console.log("Raw content:", llmData.choices?.[0]?.message?.content || "NO CONTENT");
            throw new Error("Failed to parse AI response");
        }

        // Build complete consultation response
        const consultationResponse: Record<string, string> = {
            patientId: input.patientId,
            consultationPurpose: input.consultationPurpose,
            visitReason: input.visitReason,
            diagnosis: generatedFields.diagnosis,
            treatment: generatedFields.treatment,
            investigations: generatedFields.investigations,
        };

        // Include optional context fields only if they were provided
        if (input.findings && input.findings.trim() !== '') {
            consultationResponse.findings = input.findings;
        }
        if (input.notes && input.notes.trim() !== '') {
            consultationResponse.notes = input.notes;
        }

        return new Response(
            JSON.stringify(consultationResponse),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Error generating consultation:', error)

        return new Response(
            JSON.stringify({
                error: 'Failed to generate consultation',
                message: error.message,
                details: error.toString()
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
