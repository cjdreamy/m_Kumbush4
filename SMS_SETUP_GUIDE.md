# SMS/Voice Setup Guide for M-Kumbusha

## Why SMS is Not Sending

If you're experiencing issues with SMS not sending, it's likely because the **Africa's Talking API credentials** are not configured yet. Follow this guide to set them up.

---

## Quick Setup Steps

### Step 1: Get Africa's Talking Credentials

#### Option A: Sandbox (Testing/Development)
1. Go to [Africa's Talking](https://africastalking.com/)
2. Sign up for a free account
3. You'll automatically get access to the **Sandbox** environment
4. Get your credentials:
   - **Username**: `sandbox`
   - **API Key**: Found in your dashboard under Settings → API Key

**Sandbox Limitations:**
- Free to use
- Can only send to phone numbers you've registered in the sandbox
- Messages are prefixed with "AT-Sandbox:"
- Perfect for testing

#### Option B: Production (Live Environment)
1. Go to [Africa's Talking](https://africastalking.com/)
2. Sign up and verify your account
3. Purchase SMS credits
4. Create a production app
5. Get your credentials:
   - **Username**: Your actual username (shown in dashboard)
   - **API Key**: Found in Settings → API Key

---

### Step 2: Configure Credentials in Supabase

The system has already prompted you to enter these credentials. You should see a configuration panel requesting:

1. **AFRICASTALKING_API_KEY**
   - Your API key from the Africa's Talking dashboard
   - Example: `atsk_1234567890abcdef...`

2. **AFRICASTALKING_USERNAME**
   - For sandbox: `sandbox`
   - For production: Your actual username

**How to enter:**
1. The system will show a secrets configuration panel
2. Enter your API Key in the `AFRICASTALKING_API_KEY` field
3. Enter your username in the `AFRICASTALKING_USERNAME` field
4. Save the configuration

---

### Step 3: Test SMS Sending

Once credentials are configured:

1. **Add an Elderly Person:**
   - Go to "Elderly" page
   - Click "Add Elderly Person"
   - Enter their phone number in international format: `+254712345678` (Kenya example)
   - **Important for Sandbox**: Register this phone number in your Africa's Talking sandbox first!

2. **Create a Schedule:**
   - Go to "Schedules" page
   - Click "Create Schedule"
   - Fill in the details
   - Select "SMS" or "Both" as the channel

3. **Send Test Reminder:**
   - Find your schedule in the list
   - Click "Send Now" button
   - Confirm the action
   - Check the "Reminder Logs" page to see if it was sent successfully

---

## Troubleshooting

### Issue: "Failed to send reminder"

**Possible causes:**

1. **Missing Credentials**
   - Solution: Make sure you've entered both API Key and Username in the secrets configuration

2. **Invalid Phone Number Format**
   - Solution: Use international format with country code: `+254712345678`
   - Don't use spaces or dashes

3. **Sandbox Restrictions**
   - Solution: If using sandbox, register the recipient's phone number in your Africa's Talking sandbox dashboard first
   - Go to: Dashboard → Sandbox → Add Phone Number

4. **Insufficient Credits (Production)**
   - Solution: Check your Africa's Talking account balance and top up if needed

5. **Invalid API Key**
   - Solution: Regenerate your API key in Africa's Talking dashboard and update it in Supabase

---

### Issue: SMS sent but not received

1. **Check Reminder Logs:**
   - Go to "Reminder Logs" page
   - Look for the status: "sent", "failed", or "pending"
   - Check the error message if status is "failed"

2. **Verify Phone Number:**
   - Ensure the phone number is correct
   - Check that the phone can receive SMS
   - For sandbox, verify the number is registered

3. **Check Africa's Talking Dashboard:**
   - Log in to your Africa's Talking account
   - Go to SMS → SMS Logs
   - Check if the message was delivered

---

## Phone Number Format Guide

### Correct Formats:
- Kenya: `+254712345678`
- Uganda: `+256712345678`
- Tanzania: `+255712345678`
- Rwanda: `+250712345678`

### Incorrect Formats:
- ❌ `0712345678` (missing country code)
- ❌ `+254 712 345 678` (has spaces)
- ❌ `+254-712-345-678` (has dashes)
- ❌ `254712345678` (missing + sign)

---

## Testing Checklist

Before going live, test the following:

- [ ] Credentials are configured in Supabase
- [ ] Can send SMS to a test number
- [ ] Can send voice call to a test number
- [ ] Reminder logs show "sent" status
- [ ] SMS is actually received on the phone
- [ ] Confirmation tracking works
- [ ] Escalation to secondary contact works when reminder is missed

---

## Getting Help

If you're still experiencing issues:

1. **Check Edge Function Logs:**
   - Go to your Supabase dashboard
   - Navigate to Edge Functions → Logs
   - Look for errors in `send-sms` or `send-reminder` functions

2. **Check Africa's Talking Logs:**
   - Log in to Africa's Talking
   - Go to SMS → SMS Logs
   - Check for failed deliveries and error messages

3. **Common Error Messages:**
   - "Invalid phone number": Check phone number format
   - "Insufficient balance": Top up your account
   - "Invalid API key": Regenerate and update your API key
   - "User not found": Check your username is correct

---

## Production Deployment

When moving from sandbox to production:

1. **Update Credentials:**
   - Change `AFRICASTALKING_USERNAME` from `sandbox` to your production username
   - Update `AFRICASTALKING_API_KEY` with your production API key

2. **Purchase SMS Credits:**
   - Log in to Africa's Talking
   - Go to Billing → Buy Credits
   - Choose your package

3. **Remove Sandbox Restrictions:**
   - You can now send to any phone number
   - Messages won't have "AT-Sandbox:" prefix

4. **Monitor Usage:**
   - Check your SMS usage regularly
   - Set up low balance alerts in Africa's Talking dashboard

---

## Cost Estimates (Africa's Talking)

**SMS Pricing (approximate):**
- Kenya: ~$0.01 per SMS
- Uganda: ~$0.015 per SMS
- Tanzania: ~$0.02 per SMS
- Rwanda: ~$0.015 per SMS

**Voice Call Pricing (approximate):**
- ~$0.05 - $0.10 per minute

**Example monthly cost for 10 elderly people:**
- 3 reminders per day per person = 30 SMS/day
- 30 SMS × 30 days = 900 SMS/month
- Cost: ~$9 - $18/month

---

## Support Resources

- **Africa's Talking Documentation:** https://developers.africastalking.com/
- **Africa's Talking Support:** support@africastalking.com
- **Supabase Edge Functions Docs:** https://supabase.com/docs/guides/functions

---

## Summary

**To fix "SMS not sending" issue:**

1. ✅ Sign up for Africa's Talking (free sandbox or paid production)
2. ✅ Get your API Key and Username
3. ✅ Enter credentials in the Supabase secrets configuration panel
4. ✅ For sandbox: Register test phone numbers in Africa's Talking dashboard
5. ✅ Use correct phone number format: `+254712345678`
6. ✅ Test with "Send Now" button
7. ✅ Check Reminder Logs for status

**That's it!** Once credentials are configured, SMS and voice calls will work automatically.
