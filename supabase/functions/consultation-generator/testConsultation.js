// Test script for consultation-generator Edge Function
// This script sends a consultation request to the Edge Function

// Configuration
const EDGE_FUNCTION_URL = 'https://qggaetvrfdqazgmyqgxi.supabase.co/functions/v1/consultation-generator';
const API_KEY = '...';
const PATIENT_ID = 'd41223f9-7572-451c-9ac0-f0cf1d84ab3d';

// Test consultation data
const consultationData = {
    patientId: PATIENT_ID,
    consultationPurpose: 'Evaluare simptom', // 'Initial' | 'Control' | 'Ajustare tratament' | 'Evaluare simptom'
    visitReason: 'Pacientul prezintă dureri de cap persistente de aproximativ 2 săptămâni, localizate în zona frontală, cu intensitate moderată. Durerea se accentuează dimineața și este însoțită ocazional de greață.',
    // Optional fields - uncomment to test with existing data
    // findings: 'Tensiune arterială 140/90 mmHg, fără semne neurologice focale',
    // diagnosis: 'Cefalee tensională',
    // treatment: 'Paracetamol 500mg la nevoie',
    // investigations: 'Hemoleucogramă completă',
    // notes: 'Pacientul menționează stres la locul de muncă',
};

async function testConsultation() {
    try {
        console.log('Starting consultation generator test...\n');

        console.log('Configuration:');
        console.log('  API Key:', API_KEY.substring(0, 5) + '...');
        console.log('  Patient ID:', PATIENT_ID);
        console.log('  Purpose:', consultationData.consultationPurpose);
        console.log('  Visit Reason:', consultationData.visitReason.substring(0, 50) + '...');
        console.log('\nSending request...\n');

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(consultationData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Request successful!\n');
            console.log('Response:');
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.error('Request failed!');
            console.error('Status:', response.status);
            console.error('Error:', result.error || result.message);
            if (result.details) {
                console.error('Details:', result.details);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
    }
}

testConsultation();
