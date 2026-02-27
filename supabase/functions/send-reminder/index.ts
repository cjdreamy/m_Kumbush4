import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface SendReminderRequest {
  scheduleId: string;
  elderlyId: string;
  caregiverId: string;
  message: string;
  channel: 'sms' | 'voice' | 'both';
  language: 'english' | 'kiswahili';
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
    const { scheduleId, elderlyId, caregiverId, message, channel, language }: SendReminderRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get elderly and caregiver details
    const { data: elderly } = await supabase
      .from('elderly')
      .select('*, caregiver:profiles!elderly_caregiver_id_fkey(*)')
      .eq('id', elderlyId)
      .single();

    if (!elderly || !elderly.primary_contact) {
      return new Response(
        JSON.stringify({ error: 'Elderly person or contact not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Create reminder record
    const { data: reminder } = await supabase
      .from('reminders')
      .insert({
        schedule_id: scheduleId,
        elderly_id: elderlyId,
        scheduled_time: new Date().toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    const results = [];

    // Send SMS if needed
    if (channel === 'sms' || channel === 'both') {
      const smsResult = await supabase.functions.invoke('send-sms', {
        body: {
          to: elderly.primary_contact,
          message: message,
          elderlyId: elderlyId,
          caregiverId: caregiverId,
          reminderId: reminder?.id,
        },
      });
      results.push({ type: 'sms', result: smsResult });
    }

    // Send Voice if needed
    if (channel === 'voice' || channel === 'both') {
      const voiceResult = await supabase.functions.invoke('send-voice', {
        body: {
          to: elderly.primary_contact,
          message: message,
          language: language,
          elderlyId: elderlyId,
          caregiverId: caregiverId,
          reminderId: reminder?.id,
        },
      });
      results.push({ type: 'voice', result: voiceResult });
    }

    // Send confirmation to caregiver if their phone number is available
    if (elderly.caregiver?.phone_number) {
      try {
        const caregiverMessage = `M-Kumbusha Confirmation: Reminder sent to ${elderly.full_name}: "${message.length > 60 ? message.substring(0, 60) + '...' : message}"`;
        await supabase.functions.invoke('send-sms', {
          body: {
            to: elderly.caregiver.phone_number,
            message: caregiverMessage,
            elderlyId: elderlyId,
            caregiverId: caregiverId,
          },
        });
      } catch (logError) {
        console.error('Failed to send caregiver confirmation:', logError);
      }
    }

    // Check if we need to escalate to secondary contact
    // This would typically be done after a timeout, but for demo we'll log it
    if (elderly.secondary_contact) {
      console.log('Secondary contact available for escalation:', elderly.secondary_contact);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminderId: reminder?.id,
        results: results,
        message: 'Reminder sent successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );

  } catch (error) {
    console.error('Send reminder error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
