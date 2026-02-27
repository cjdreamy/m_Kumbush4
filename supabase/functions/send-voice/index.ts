import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const AFRICASTALKING_API_KEY = Deno.env.get('AFRICASTALKING_API_KEY') || '';
const AFRICASTALKING_USERNAME = Deno.env.get('AFRICASTALKING_USERNAME') || '';

interface VoiceRequest {
  to: string;
  message: string;
  language: 'english' | 'kiswahili';
  elderlyId: string;
  caregiverId: string;
  reminderId?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { to, message, language, elderlyId, caregiverId, reminderId }: VoiceRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const isSandbox = AFRICASTALKING_USERNAME === 'sandbox';
    const fromNumber = Deno.env.get('AFRICASTALKING_FROM_NUMBER') || '';
    const voiceEndpoint = isSandbox
      ? 'https://voice.sandbox.africastalking.com/call'
      : 'https://api.africastalking.com/version1/call';

    console.log(`Attempting voice call from ${fromNumber} to ${to} using ${voiceEndpoint}`);

    const voiceResponse = await fetch(voiceEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': AFRICASTALKING_API_KEY,
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username: AFRICASTALKING_USERNAME,
        to: to,
        from: fromNumber,
      }),
    });

    const voiceData = await voiceResponse.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine status based on response
    const status = voiceData.entries?.[0]?.status === 'Queued' ? 'sent' : 'failed';
    const errorMessage = voiceData.entries?.[0]?.status !== 'Queued'
      ? voiceData.errorMessage || 'Call failed'
      : null;

    // Log the voice call attempt
    await supabase.from('reminder_logs').insert({
      reminder_id: reminderId || null,
      elderly_id: elderlyId,
      caregiver_id: caregiverId,
      channel: 'voice',
      status: status,
      message: message,
      error_message: errorMessage,
      sent_at: new Date().toISOString(),
    });

    // 4. Handle Caregiver Confirmation (Voice calls are primary level)
    if (status === 'sent' && caregiverId) {
      try {
        const { data: caregiver } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', caregiverId)
          .single();

        if (caregiver?.phone_number) {
          const { data: elderly } = await supabase
            .from('elderly')
            .select('full_name')
            .eq('id', elderlyId)
            .single();

          const caregiverMessage = `M-Kumbusha Confirmation: Voice call initiated to ${elderly?.full_name || 'Elderly'} for: "${message.length > 50 ? message.substring(0, 50) + '...' : message}"`;

          // Call send-sms to notify the caregiver
          await supabase.functions.invoke('send-sms', {
            body: {
              to: caregiver.phone_number,
              message: caregiverMessage,
              elderlyId,
              caregiverId,
              isConfirmation: true
            }
          });
        }
      } catch (confError) {
        console.error('Failed to send caregiver confirmation for voice call:', confError);
      }
    }

    return new Response(
      JSON.stringify({
        success: status === 'sent',
        status: status,
        data: voiceData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );

  } catch (error) {
    console.error('Voice call error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
