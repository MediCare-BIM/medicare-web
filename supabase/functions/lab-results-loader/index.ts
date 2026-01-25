// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { extractText } from 'npm:unpdf'

// SETUP INSTRUCTIONS (via Supabase Dashboard):
//
// 1. DEPLOY THE EDGE FUNCTION
//    - Deploy via Dashboard: Functions → Deploy new function
//    - Or run: supabase functions deploy lab-results-loader
//
// 2. SET ENVIRONMENT SECRETS
//    Go to: Project Settings → Edge Functions → Secrets
//    Add the following secret:
//    - X_API_KEY: Your API key for authentication
//      Example: a-secure-random-key-here
//
// 3. FUNCTION CONFIGURATION
//    This endpoint requires API key authentication
//    - Accepts PDF file uploads via multipart/form-data
//    - Extracts text content from PDF files
//    - Optionally saves to database if patient_id is provided
//
// 4. ENSURE lab_results TABLE EXISTS
//    Go to: Database → Tables
//    Verify the lab_results table has these columns:
//    - id: int8, primary key, auto-increment
//    - patient_id: text or uuid (NOT NULL)
//    - test_name: text (stores file name)
//    - results: jsonb (stores array of structured extracted results)
//    - result_date: date
//    - created_at: timestamptz, default: now()
//
// 5. USAGE - Upload PDF from Client
//    Method: POST
//    URL: https://YOUR-PROJECT-REF.supabase.co/functions/v1/lab-results-loader
//    Content-Type: multipart/form-data
//    Headers:
//    - x-api-key: Your API key (required)
//    
//    Form Data:
//    - file: PDF file (required)
//    - patient_id: Patient identifier (optional, for database storage)
//    - override: 'true' or '1' (optional, deletes all existing lab results for patient before inserting)
//
//    Example JavaScript:
//    ```javascript
//    const formData = new FormData()
//    formData.append('file', pdfFile)
//    formData.append('patient_id', '123')
//    
//    const response = await fetch(
//      'https://YOUR-PROJECT-REF.supabase.co/functions/v1/lab-results-loader',
//      {
//        method: 'POST',
//        headers: { 'x-api-key': 'your-api-key-here' },
//        body: formData
//      }
//    )
//    const result = await response.json()
//    console.log(result.extractedText)
//    ```



const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

const createPrompt = (text: string) => {
    return `
You are a medical assistant specialized in extracting structured data from lab result documents.
Your task is to analyze the following extracted text from a PDF and extract individual lab test results.

Output must be a valid JSON object with a single key "results" containing an array of objects.

---

### REQUIRED OUTPUT FORMAT
{
  "results": [
    {
      "test_name": "string (e.g., Hemoglobin)",
      "result": "string or number (e.g., 14.5)",
      "unit": "string (e.g., g/dL) or null if none",
      "reference_range": "string (e.g., 12.5-16.5 g/dL) or null if none",
      "is_normal": boolean (true if within reference range, false otherwise),
      "explanation": "A short explanation of the result and one recommendation for improvement"
    },
    ...
  ]
}

---

### INSTRUCTIONS
- Extract every test result found in the text.
- Normalize the test names where possible.
- If the result implies a value out of range (marked with *, bold, or described as high/low), set "is_normal" to false.
- Do not invent data.

---

<LAB_RESULTS_TEXT>
${text}
</LAB_RESULTS_TEXT>
`;
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("PDF upload request received")

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

        // Check if the request is multipart/form-data
        const contentType = req.headers.get('content-type') || ''
        if (!contentType.includes('multipart/form-data')) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid content type. Expected multipart/form-data'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Parse the form data
        const formData = await req.formData()
        const pdfFile = formData.get('file') as File
        const patientId = formData.get('patient_id') as string
        const override = formData.get('override') === 'true' || formData.get('override') === '1'

        if (!pdfFile) {
            return new Response(
                JSON.stringify({ error: 'No PDF file provided' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Validate file type
        if (!pdfFile.type.includes('pdf') && !pdfFile.name.endsWith('.pdf')) {
            return new Response(
                JSON.stringify({ error: 'Invalid file type. Only PDF files are allowed' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        console.log(`Processing PDF file: ${pdfFile.name}, size: ${pdfFile.size} bytes`)

        // Convert File to ArrayBuffer
        const arrayBuffer = await pdfFile.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        // Extract text from PDF
        console.log("Extracting text from PDF...")
        const { text: textArray, totalPages, metadata } = await extractText(uint8Array)

        // unpdf returns an array of strings (one per page), so join them
        const text = Array.isArray(textArray) ? textArray.join('\n\n') : textArray

        console.log(`Extracted ${text.length} characters from ${totalPages} pages`)

        // OpenAI Extraction
        console.log("Sending text to OpenAI for extraction...")
        const endpoint = Deno.env.get("OPENAI_ENDPOINT");
        const openAiApiKey = Deno.env.get("OPENAI_ACESS_TOKEN"); // Typo intentional to match existing secret

        if (!endpoint || !openAiApiKey) {
            throw new Error("Missing OpenAI configuration");
        }

        const prompt = createPrompt(text);

        const aiResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": openAiApiKey,
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                max_tokens: 4000,
                temperature: 0.1, // Low temperature for consistent extraction
            }),
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error("OpenAI Error:", errorText);
            throw new Error(`OpenAI API error: ${aiResponse.status}`);
        }

        const llmData = await aiResponse.json();
        let extractedResults = [];

        try {
            const content = llmData.choices[0].message.content;
            // Clean up code blocks if present
            const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
            const parsed = JSON.parse(cleanContent);
            extractedResults = parsed.results || [];
            console.log(`OpenAI extracted ${extractedResults.length} structured results`);
            console.log("Extracted results:", extractedResults.slice(0, 5));
        } catch (e) {
            console.error("Failed to parse OpenAI response:", e);
            console.log("Raw content:", llmData.choices[0].message.content);
        }

        // Store in database
        let dbResult = null
        let deletedCount = 0

        if (patientId && extractedResults.length > 0) {
            // If override is true, delete all existing lab results for this patient
            if (override) {
                console.log(`Override enabled: Deleting existing lab results for patient ${patientId}`)
                const { data: deletedData, error: deleteError } = await supabase
                    .from('lab_results')
                    .delete({ count: 'exact' })
                    .eq('patient_id', patientId)
                    .select()

                if (deleteError) {
                    console.error("Delete error:", deleteError)
                } else {
                    deletedCount = deletedData?.length || 0
                    console.log(`Deleted ${deletedCount} existing lab result(s)`)
                }
            }

            // Insert matching table structure: id, patient_id, test_name, result_date, results(jsonb)
            const { data, error } = await supabase
                .from('lab_results')
                .insert({
                    patient_id: patientId,
                    test_name: pdfFile.name, // Using filename as the "test_name" container for the batch
                    results: { results: extractedResults }, // Storing the array of items in the results jsonb column
                    result_date: new Date().toISOString(),
                    // created_at is default: now(), id is auto-increment
                })
                .select()

            if (error) {
                console.error("Database insert error:", error)
            } else {
                dbResult = data
                console.log(`Saved record to database with ${extractedResults.length} extracted items embedded in 'results' column`)
            }
        }

        // Return the response
        return new Response(
            JSON.stringify({
                success: true,
                fileName: pdfFile.name,
                extractedTextLength: text.length,
                extractedResultsCount: extractedResults.length,
                extractedResults: extractedResults,
                override: override,
                deletedCount: deletedCount,
                savedToDatabase: !!dbResult,
                dbResult: dbResult
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Error processing PDF:', error)

        return new Response(
            JSON.stringify({
                error: 'Failed to process PDF file',
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
