import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

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
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get current time details (Defaulting to EAT/Kenya time +3 as per user context)
        // In production, you'd handle user-specific timezones
        const now = new Date();
        // Offset for +3 hours if running in UTC (Supabase servers are UTC)
        const localNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));

        const currentHour = localNow.getUTCHours();
        const currentMinute = localNow.getUTCMinutes();
        const currentDayOfWeek = localNow.getUTCDay(); // 0=Sunday, 1=Monday...
        const currentDateStr = localNow.toISOString().split('T')[0];

        console.log(`Checking for reminders at ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')} (Day: ${currentDayOfWeek}, Date: ${currentDateStr})`);

        // Query all active schedules (filtering by time in JavasScript for better precision)
        const { data: schedules, error: fetchError } = await supabase
            .from('schedules')
            .select('*, elderly(profiles(caregiver_id))')
            .eq('is_active', true);

        if (fetchError) throw fetchError;

        if (!schedules || schedules.length === 0) {
            return new Response(JSON.stringify({ message: 'No active schedules found' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const processResults = [];

        for (const schedule of schedules) {
            // 1. Time Match (HH:mm)
            const [schedH, schedM] = schedule.time_of_day.split(':');
            const isTimeMatch = parseInt(schedH) === currentHour && parseInt(schedM) === currentMinute;

            if (!isTimeMatch) continue;

            // 2. Frequency Match
            let isFrequencyMatch = false;

            if (schedule.frequency === 'daily') {
                isFrequencyMatch = true;
            } else if (schedule.frequency === 'weekly') {
                if (schedule.days_of_week && schedule.days_of_week.includes(currentDayOfWeek)) {
                    isFrequencyMatch = true;
                }
            } else if (schedule.frequency === 'custom') {
                if (schedule.custom_dates && schedule.custom_dates.includes(currentDateStr)) {
                    isFrequencyMatch = true;
                }
            }

            if (isFrequencyMatch) {
                console.log(`Triggering reminder for schedule: ${schedule.title}`);

                // Invoke send-reminder function
                const { data, error } = await supabase.functions.invoke('send-reminder', {
                    body: {
                        scheduleId: schedule.id,
                        elderlyId: schedule.elderly_id,
                        caregiverId: schedule.elderly.caregiver_id, // Fetching from profiles relation
                        message: schedule.language === 'kiswahili'
                            ? `Kumbusho: ${schedule.title}. ${schedule.description || ''}`
                            : `Reminder: ${schedule.title}. ${schedule.description || ''}`,
                        channel: schedule.channel,
                        language: schedule.language,
                    },
                });

                processResults.push({
                    scheduleId: schedule.id,
                    title: schedule.title,
                    success: !error,
                    error: error ? error.message : null
                });
            }
        }

        return new Response(JSON.stringify({
            processed: processResults.length,
            results: processResults
        }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Process reminders error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
