-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to process reminders via Edge Function
-- This function will be called by pg_cron
CREATE OR REPLACE FUNCTION public.trigger_reminder_processing()
RETURNS void AS $$
BEGIN
  -- Invoke the Edge Function
  -- Replace 'YOUR_PROJECT_REF' with your actual project reference
  -- And 'YOUR_SERVICE_ROLE_KEY' with your service role key
  -- Note: In a real Supabase environment, these are usually handled via Vault or environment variables
  -- For local development/setup instructions, we'll provide the snippet
  
  PERFORM
    net.http_post(
      url := 'https://' || current_setting('request.headers')::json->>'x-forwarded-host' || '/functions/v1/process-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.headers')::json->>'apikey'
      ),
      body := '{}'::jsonb
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the processing to run every minute
-- Note: 'cron' schema is usually where pg_cron lives
SELECT cron.schedule(
  'process-reminders-every-minute',
  '* * * * *', -- Every minute
  'SELECT public.trigger_reminder_processing();'
);
