// Test script for lab-results-loader Edge Function
// This script uploads example.pdf to the Edge Function

const fs = require('fs');
const path = require('path');

// Configuration
const EDGE_FUNCTION_URL = 'https://qggaetvrfdqazgmyqgxi.supabase.co/functions/v1/lab-results-loader';
const API_KEY = '...';
const PATIENT_ID = 'd41223f9-7572-451c-9ac0-f0cf1d84ab3d';
const OVERRIDE = true;
const EARLY_RETURN = true; // Set to true to return basic results immediately while processing explanations in background

async function uploadPDF() {
    try {
        console.log('Starting PDF upload test...\n');

        const pdfPath = path.join(__dirname, 'example.pdf');
        if (!fs.existsSync(pdfPath)) {
            console.error('Error: example.pdf not found in the current directory');
            process.exit(1);
        }

        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

        const formData = new FormData();
        formData.append('file', pdfBlob, 'example.pdf');
        formData.append('patient_id', PATIENT_ID);
        if (OVERRIDE) {
            formData.append('override', 'true');
        }
        if (EARLY_RETURN) {
            formData.append('earlyReturn', 'true');
        }

        console.log('File:', 'example.pdf');
        console.log('Size:', (pdfBuffer.length / 1024).toFixed(2), 'KB');
        console.log('API Key:', API_KEY.substring(0, 5) + '...');
        console.log('Patient ID:', PATIENT_ID);
        console.log('Override:', OVERRIDE ? 'Yes (will delete existing results)' : 'No');
        console.log('Early Return:', EARLY_RETURN ? 'Yes (basic results only, explanations in background)' : 'No');
        console.log('\nUploading...\n');

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Upload successful!\n');
            console.log('Response:\n');
            console.log(result)
        } else {
            console.error('Upload failed!');
            console.error('Status:', response.status);
            console.error('Error:', result.error || result.message);
        }

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
    }
}

uploadPDF();
