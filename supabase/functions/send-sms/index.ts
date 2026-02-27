import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const AFRICASTALKING_API_KEY = (Deno.env.get('AFRICASTALKING_API_KEY') || '').trim();
const AFRICASTALKING_USERNAME = (Deno.env.get('AFRICASTALKING_USERNAME') || '').trim();

interface SMSRequest {
  to: string;
  message: string;
  elderlyId: string;
  caregiverId: string;
  reminderId?: string;
  isConfirmation?: boolean;
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
    const { to, message, elderlyId, caregiverId, reminderId, isConfirmation }: SMSRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!AFRICASTALKING_API_KEY || !AFRICASTALKING_USERNAME) {
      console.error('Missing Africa\'s Talking credentials');
      return new Response(
        JSON.stringify({ error: 'Africa\'s Talking credentials not configured in Supabase secrets' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const isSandbox = AFRICASTALKING_USERNAME.toLowerCase() === 'sandbox';
    const smsEndpoint = isSandbox
      ? 'https://api.sandbox.africastalking.com/version1/messaging'
      : 'https://api.africastalking.com/version1/messaging';

    console.log(`Sending SMS to ${to} using ${isSandbox ? 'sandbox' : 'production'}`);

    // Send SMS via Africa's Talking
    const smsResponse = await fetch(smsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': AFRICASTALKING_API_KEY,
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username: AFRICASTALKING_USERNAME,
        to: to,
        message: message,
        from: isSandbox ? '' : 'M_kumbusha',
      }),
    });

    const responseText = await smsResponse.text();
    let smsData;
    let status = 'failed';
    let errorMessage = null;

    try {
      smsData = JSON.parse(responseText);
      status = smsData.SMSMessageData?.Recipients?.[0]?.status === 'Success' ? 'sent' : 'failed';
      errorMessage = status !== 'sent' ? smsData.SMSMessageData?.Recipients?.[0]?.status || responseText : null;
    } catch (e) {
      console.error('Failed to parse AT response:', responseText);
      errorMessage = `Server Error: ${responseText.substring(0, 100)}`;
      status = 'failed';
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Log the SMS attempt
    await supabase.from('reminder_logs').insert({
      reminder_id: reminderId || null,
      elderly_id: elderlyId,
      caregiver_id: caregiverId,
      channel: 'sms',
      status: status,
      message: message,
      error_message: errorMessage,
      sent_at: new Date().toISOString(),
    });

    // 2. Update reminder status if reminderId provided
    if (reminderId) {
      await supabase
        .from('reminders')
        .update({ status: status })
        .eq('id', reminderId);
    }

    // 3. Handle Caregiver Confirmation (if primary SMS and success)
    if (!isConfirmation && status === 'sent' && caregiverId) {
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

          const caregiverMessage = `M-Kumbusha Confirmation: Reminder sent to ${elderly?.full_name || 'Elderly'}: "${message.length > 50 ? message.substring(0, 50) + '...' : message}"`;

          // Trigger confirmation SMS (marks as isConfirmation: true to avoid loops)
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
        console.error('Failed to send caregiver confirmation:', confError);
      }
    }

    return new Response(
      JSON.stringify({
        success: status === 'sent',
        status: status,
        data: smsData || { error: responseText },
      }),
      {
        status: status === 'sent' ? 200 : 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );

  } catch (error) {
    console.error('SMS sending error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
