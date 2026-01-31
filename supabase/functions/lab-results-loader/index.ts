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
//    - earlyReturn: 'true' or '1' (optional, returns basic results immediately while processing explanations in background)
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

interface HistoricalLabResult {
    test_name: string;
    result: string | number;
    unit: string | null;
    result_date: string;
}

interface BasicLabResult {
    test_name: string;
    result: string | number;
    unit: string | null;
    reference_range: string | null;
    is_normal: boolean;
}

interface LabResultWithExplanation extends BasicLabResult {
    explanation: {
        meaning: string;
        trend: string;
        next: string;
    };
}

// First prompt: Extract basic test data without explanations
const createExtractionPrompt = (text: string) => {
    return `
You are a medical assistant specialized in extracting structured data from lab result documents.
Your task is to analyze the following extracted text from a PDF and extract individual lab test results.

Output must be a valid JSON object with a single key "results" containing an array of objects.

---

### REQUIRED OUTPUT FORMAT
{
  "results": [
    {
      "test_name": "string (e.g., Hemoglobină)",
      "result": "string or number (e.g., 14.5)",
      "unit": "string (e.g., g/dL) or null if none",
      "reference_range": "string (e.g., 12.5-16.5 g/dL) or null if none",
      "is_normal": boolean (true if within reference range, false otherwise)
    }
  ]
}

---

### INSTRUCTIONS
- Extract every test result found in the text.
- Normalize the test names where possible (in Romanian if applicable).
- If the result implies a value out of range (marked with *, bold, or described as high/low), set "is_normal" to false.
- Do not invent data.
- Respond ONLY with valid JSON, no additional text.

---

<LAB_RESULTS_TEXT>
${text}
</LAB_RESULTS_TEXT>
`;
}

// Second prompt: Generate explanations for a batch of results
const createExplanationPrompt = (results: BasicLabResult[], historicalResults: HistoricalLabResult[]) => {
    const hasHistory = historicalResults.length > 0;

    const historySection = hasHistory
        ? `
---

### ISTORIC REZULTATE ANTERIOARE ALE PACIENTULUI
Folosește aceste date pentru a compara tendințele în câmpul "trend":
${JSON.stringify(historicalResults, null, 2)}
`
        : '';

    const trendInstruction = hasHistory
        ? `- Pentru câmpul "trend", compară valoarea curentă cu valorile anterioare din istoric. Menționează dacă valoarea a crescut, scăzut sau a rămas stabilă.`
        : `- Pentru câmpul "trend", folosește: "Nu există date anterioare pentru comparație."`;

    return `
You are a medical assistant. Generate explanations for the following lab test results.

IMPORTANT: All generated text MUST be in Romanian language.

---

### REZULTATE DE ANALIZAT
${JSON.stringify(results, null, 2)}
${historySection}
---

### REQUIRED OUTPUT FORMAT
{
  "results": [
    {
      "test_name": "exact same test_name from input",
      "explanation": {
        "meaning": "string - Ce înseamnă acest rezultat? (1-2 propoziții)",
        "trend": "string - Cum se compară cu valorile din trecut? (1 propoziție)",
        "next": "string - Ce urmează? O recomandare concretă. (1 propoziție)"
      }
    }
  ]
}

---

### INSTRUCTIONS
- Generate explanations for EACH test in the input.
- Keep explanations CONCISE (1-2 sentences per field).
- ALL text MUST be in Romanian.
${trendInstruction}
- Match the test_name exactly as provided in the input.
- Respond ONLY with valid JSON.
`;
}

// Helper function to process a batch of results
async function processExplanationBatch(
    results: BasicLabResult[],
    historicalResults: HistoricalLabResult[],
    endpoint: string,
    apiKey: string
): Promise<Map<string, LabResultWithExplanation['explanation']>> {
    const prompt = createExplanationPrompt(results, historicalResults);

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
        },
        body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            max_tokens: 3000,
            temperature: 0.1,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI Error in batch:", errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const llmData = await response.json();
    const content = llmData.choices[0]?.message?.content;

    if (!content) {
        throw new Error("Empty response from AI");
    }

    const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanContent);

    // Create a map of test_name -> explanation
    const explanationMap = new Map<string, LabResultWithExplanation['explanation']>();
    for (const item of parsed.results || []) {
        explanationMap.set(item.test_name, item.explanation);
    }

    return explanationMap;
}

// Helper function for Phase 2 and database operations (at module level for reuse)
async function processPhase2AndSave(
    basicResults: BasicLabResult[],
    historicalResults: HistoricalLabResult[],
    endpoint: string,
    openAiApiKey: string,
    patientId: string | null,
    override: boolean,
    fileName: string
) {
    console.log("[Phase 2] Generating explanations in batches...")
    const BATCH_SIZE = 10;
    const batches: BasicLabResult[][] = [];

    for (let i = 0; i < basicResults.length; i += BATCH_SIZE) {
        batches.push(basicResults.slice(i, i + BATCH_SIZE));
    }

    console.log(`[Phase 2] Processing ${batches.length} batch(es) in parallel...`);

    // Process all batches in parallel
    const batchPromises = batches.map((batch, index) => {
        console.log(`[Phase 2] Starting batch ${index + 1}/${batches.length} with ${batch.length} results`);
        return processExplanationBatch(batch, historicalResults, endpoint, openAiApiKey)
            .then(result => {
                console.log(`[Phase 2] Batch ${index + 1} completed successfully`);
                return result;
            })
            .catch(error => {
                console.error(`[Phase 2] Batch ${index + 1} failed:`, error.message);
                return new Map<string, LabResultWithExplanation['explanation']>();
            });
    });

    const batchResults = await Promise.all(batchPromises);

    // Merge all explanation maps
    const allExplanations = new Map<string, LabResultWithExplanation['explanation']>();
    for (const batchMap of batchResults) {
        for (const [key, value] of batchMap) {
            allExplanations.set(key, value);
        }
    }

    console.log(`[Phase 2] Generated explanations for ${allExplanations.size} results`);

    // Combine basic results with explanations
    const defaultExplanation = {
        meaning: "Consultați medicul pentru interpretarea acestui rezultat.",
        trend: "Nu există date anterioare pentru comparație.",
        next: "Discutați rezultatul cu medicul dumneavoastră."
    };

    const extractedResults: LabResultWithExplanation[] = basicResults.map(result => ({
        ...result,
        explanation: allExplanations.get(result.test_name) || defaultExplanation
    }));

    console.log(`[Phase 2] Complete: ${extractedResults.length} results with explanations`)

    // Store in database
    let dbResult = null
    let deletedCount = 0

    if (patientId && extractedResults.length > 0) {
        if (override) {
            console.log(`[DB] Override enabled: Deleting existing lab results for patient ${patientId}`)
            const { data: deletedData, error: deleteError } = await supabase
                .from('lab_results')
                .delete({ count: 'exact' })
                .eq('patient_id', patientId)
                .select()

            if (deleteError) {
                console.error("[DB] Delete error:", deleteError)
            } else {
                deletedCount = deletedData?.length || 0
                console.log(`[DB] Deleted ${deletedCount} existing lab result(s)`)
            }
        }

        const { data, error } = await supabase
            .from('lab_results')
            .insert({
                patient_id: patientId,
                test_name: fileName,
                results: { results: extractedResults },
                result_date: new Date().toISOString(),
            })
            .select()

        if (error) {
            console.error("[DB] Insert error:", error)
        } else {
            dbResult = data
            console.log(`[DB] Saved ${extractedResults.length} results to database`)
        }
    }

    return { extractedResults, dbResult, deletedCount };
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
        const earlyReturnValue = formData.get('earlyReturn')
        const earlyReturn = earlyReturnValue === 'true' || earlyReturnValue === '1'
        console.log(`earlyReturn raw value: "${earlyReturnValue}", parsed: ${earlyReturn}`)

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

        // If earlyReturn is enabled, return immediately and process everything in background
        if (earlyReturn) {
            console.log("Early return enabled - returning immediately and processing in background")

            // Schedule all processing to run in background
            EdgeRuntime.waitUntil((async () => {
                try {
                    // Fetch historical lab results for trend comparison
                    let historicalResults: HistoricalLabResult[] = [];

                    if (patientId) {
                        console.log(`[Background] Fetching historical lab results for patient: ${patientId}`)
                        const { data: previousLabResults, error: historyError } = await supabase
                            .from('lab_results')
                            .select('results, result_date')
                            .eq('patient_id', patientId)
                            .order('result_date', { ascending: false })

                        if (historyError) {
                            console.error("[Background] Error fetching historical results:", historyError)
                        } else if (previousLabResults && previousLabResults.length > 0) {
                            historicalResults = previousLabResults.flatMap((record: any) => {
                                const results = record.results?.results || [];
                                return results.map((r: any) => ({
                                    test_name: r.test_name,
                                    result: r.result,
                                    unit: r.unit,
                                    result_date: record.result_date
                                }));
                            });
                            console.log(`[Background] Found ${historicalResults.length} historical test results`)
                        }
                    }

                    // Phase 1: Extract basic test data
                    console.log("[Background] Phase 1: Extracting basic test data...")
                    const endpoint = Deno.env.get("OPENAI_ENDPOINT");
                    const openAiApiKey = Deno.env.get("OPENAI_ACESS_TOKEN");

                    if (!endpoint || !openAiApiKey) {
                        throw new Error("Missing OpenAI configuration");
                    }

                    const extractionPrompt = createExtractionPrompt(text);
                    const extractionResponse = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "api-key": openAiApiKey,
                        },
                        body: JSON.stringify({
                            messages: [{ role: "user", content: extractionPrompt }],
                            max_tokens: 4000,
                            temperature: 0.1,
                        }),
                    });

                    if (!extractionResponse.ok) {
                        throw new Error(`OpenAI API error: ${extractionResponse.status}`);
                    }

                    const extractionData = await extractionResponse.json();
                    const content = extractionData.choices[0]?.message?.content;
                    if (!content) throw new Error("Empty response from AI");

                    const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
                    const parsed = JSON.parse(cleanContent);
                    const basicResults: BasicLabResult[] = parsed.results || [];
                    console.log(`[Background] Phase 1 complete: Extracted ${basicResults.length} test results`);

                    // Phase 2 and save
                    const { extractedResults } = await processPhase2AndSave(
                        basicResults,
                        historicalResults,
                        endpoint,
                        openAiApiKey,
                        patientId,
                        override,
                        pdfFile.name
                    );

                    console.log(`[Background] All processing complete: ${extractedResults.length} results saved`);
                } catch (error) {
                    console.error("[Background] Processing error:", error);
                }
            })());

            // Return immediately with PDF extraction info
            return new Response(
                JSON.stringify({
                    success: true,
                    earlyReturn: true,
                    message: "PDF text extracted. Results are being processed and saved in background.",
                    fileName: pdfFile.name,
                    extractedTextLength: text.length,
                    totalPages: totalPages,
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Normal flow (earlyReturn = false) - Fetch historical lab results for trend comparison
        let historicalResults: HistoricalLabResult[] = [];

        if (patientId) {
            console.log(`Fetching historical lab results for patient: ${patientId}`)
            const { data: previousLabResults, error: historyError } = await supabase
                .from('lab_results')
                .select('results, result_date')
                .eq('patient_id', patientId)
                .order('result_date', { ascending: false })

            if (historyError) {
                console.error("Error fetching historical results:", historyError)
            } else if (previousLabResults && previousLabResults.length > 0) {
                // Flatten all historical results into a single array with dates
                historicalResults = previousLabResults.flatMap((record: any) => {
                    const results = record.results?.results || [];
                    return results.map((r: any) => ({
                        test_name: r.test_name,
                        result: r.result,
                        unit: r.unit,
                        result_date: record.result_date
                    }));
                });
                console.log(`Found ${historicalResults.length} historical test results for comparison`)
            } else {
                console.log("No historical lab results found for this patient")
            }
        }

        // Phase 1: Extract basic test data
        console.log("Phase 1: Extracting basic test data from PDF...")
        const endpoint = Deno.env.get("OPENAI_ENDPOINT");
        const openAiApiKey = Deno.env.get("OPENAI_ACESS_TOKEN"); // Typo intentional to match existing secret

        if (!endpoint || !openAiApiKey) {
            throw new Error("Missing OpenAI configuration");
        }

        const extractionPrompt = createExtractionPrompt(text);

        const extractionResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": openAiApiKey,
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: extractionPrompt }],
                max_tokens: 4000,
                temperature: 0.1,
            }),
        });

        if (!extractionResponse.ok) {
            const errorText = await extractionResponse.text();
            console.error("OpenAI Error (extraction):", errorText);
            throw new Error(`OpenAI API error: ${extractionResponse.status}`);
        }

        const extractionData = await extractionResponse.json();
        let basicResults: BasicLabResult[] = [];

        try {
            const content = extractionData.choices[0]?.message?.content;
            if (!content) {
                throw new Error("Empty response from AI");
            }

            const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
            const parsed = JSON.parse(cleanContent);
            basicResults = parsed.results || [];
            console.log(`Phase 1 complete: Extracted ${basicResults.length} test results`);
        } catch (e) {
            console.error("Failed to parse extraction response:", e);
            console.log("Raw content:", extractionData.choices?.[0]?.message?.content?.substring(0, 1000) || "NO CONTENT");
            throw new Error("Failed to extract test results from PDF");
        }

        // Normal flow - wait for everything to complete
        const { extractedResults, dbResult, deletedCount } = await processPhase2AndSave(
            basicResults,
            historicalResults,
            endpoint,
            openAiApiKey,
            patientId,
            override,
            pdfFile.name
        );

        // Return the response
        return new Response(
            JSON.stringify({
                success: true,
                earlyReturn: false,
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
