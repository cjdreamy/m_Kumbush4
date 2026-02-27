# Troubleshooting: SMS Not Sending

## Problem
When clicking "Send Now" on a reminder schedule, the SMS is not being sent to the elderly person's phone.

## Root Cause
The **Africa's Talking API credentials** are not configured in your Supabase project. The SMS and voice call edge functions require these credentials to communicate with Africa's Talking API.

## Solution

### Step 1: Sign Up for Africa's Talking

#### For Testing (Free Sandbox):
1. Visit [https://africastalking.com/](https://africastalking.com/)
2. Click "Sign Up" and create a free account
3. You'll automatically get access to the **Sandbox** environment
4. No credit card required for sandbox testing

#### For Production (Paid):
1. Visit [https://africastalking.com/](https://africastalking.com/)
2. Sign up and verify your account
3. Purchase SMS credits (pricing varies by country)
4. Create a production application

---

### Step 2: Get Your API Credentials

1. **Log in** to your Africa's Talking account
2. Go to your **Dashboard**
3. Navigate to **Settings** → **API Key**
4. Copy your credentials:
   - **API Key**: A long string starting with `atsk_...`
   - **Username**: 
     - For sandbox: `sandbox`
     - For production: Your actual username (shown in dashboard)

---

### Step 3: Configure Credentials in Supabase

You should have received a prompt to configure these secrets. If not, follow these steps:

1. **Go to your Supabase Dashboard**
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:

   **Secret 1:**
   - Name: `AFRICASTALKING_API_KEY`
   - Value: Your API key from Africa's Talking (e.g., `atsk_1234567890abcdef...`)

   **Secret 2:**
   - Name: `AFRICASTALKING_USERNAME`
   - Value: 
     - For sandbox: `sandbox`
     - For production: Your actual username

4. **Save** the secrets

---

### Step 4: Register Test Phone Numbers (Sandbox Only)

If you're using the sandbox environment, you must register phone numbers before sending SMS to them:

1. Log in to Africa's Talking
2. Go to **Sandbox** → **Voice & SMS**
3. Click **Add Phone Number**
4. Enter the phone number in international format: `+254712345678`
5. Verify the phone number (you'll receive an OTP)
6. Repeat for all test phone numbers

---

### Step 5: Test SMS Sending

1. **In M-Kumbusha:**
   - Go to **Elderly** page
   - Add an elderly person with a phone number in international format: `+254712345678`
   - Make sure this number is registered in your Africa's Talking sandbox (if using sandbox)

2. **Create a Schedule:**
   - Go to **Schedules** page
   - Click **Create Schedule**
   - Fill in the details
   - Select **SMS** or **Both** as the channel
   - Save the schedule

3. **Send Test Reminder:**
   - Find your schedule in the list
   - Click **Send Now** button
   - Confirm the action
   - Wait a few seconds

4. **Check Results:**
   - Go to **Reminder Logs** page
   - Look for the latest entry
   - Status should be **"sent"** (green badge)
   - If status is **"failed"** (red badge), check the error message

---

## Common Issues & Solutions

### Issue 1: "Failed to send reminder"

**Possible Causes:**
- Missing API credentials
- Invalid API key
- Incorrect username

**Solution:**
1. Double-check that you've entered both secrets in Supabase
2. Verify the API key is correct (copy-paste from Africa's Talking dashboard)
3. For sandbox, ensure username is exactly `sandbox` (lowercase)
4. For production, use your actual username

---

### Issue 2: "Invalid phone number"

**Possible Causes:**
- Phone number not in international format
- Missing country code
- Extra spaces or dashes

**Solution:**
Use the correct format:
- ✅ Correct: `+254712345678`
- ❌ Wrong: `0712345678` (missing country code)
- ❌ Wrong: `+254 712 345 678` (has spaces)
- ❌ Wrong: `254712345678` (missing + sign)

---

### Issue 3: "Insufficient balance" (Production only)

**Possible Causes:**
- No SMS credits in your Africa's Talking account

**Solution:**
1. Log in to Africa's Talking
2. Go to **Billing** → **Buy Credits**
3. Purchase SMS credits
4. Try sending again

---

### Issue 4: SMS sent but not received

**Possible Causes:**
- Phone number not registered in sandbox
- Phone is off or out of coverage
- SMS blocked by carrier

**Solution:**
1. **For Sandbox:**
   - Verify the phone number is registered in Africa's Talking sandbox
   - Check that you verified the number with OTP

2. **Check Africa's Talking Logs:**
   - Log in to Africa's Talking
   - Go to **SMS** → **SMS Logs**
   - Find your message and check the delivery status
   - Look for error messages

3. **Check Phone:**
   - Ensure the phone is on and has signal
   - Check if SMS inbox is full
   - Try a different phone number

---

### Issue 5: "User not authenticated"

**Possible Causes:**
- Not logged in to M-Kumbusha
- Session expired

**Solution:**
1. Log out and log back in
2. Try sending the reminder again

---

## Verification Checklist

Before contacting support, verify:

- [ ] Africa's Talking account created
- [ ] API Key and Username obtained
- [ ] Both secrets configured in Supabase Edge Functions
- [ ] For sandbox: Test phone numbers registered in Africa's Talking
- [ ] Phone numbers in international format: `+254712345678`
- [ ] Elderly person added with correct phone number
- [ ] Schedule created with SMS or Both channel
- [ ] Clicked "Send Now" and confirmed
- [ ] Checked Reminder Logs for status
- [ ] If failed, checked error message

---

## Testing Sandbox vs Production

### Sandbox (Free Testing):
- **Pros:**
  - Free to use
  - No credit card required
  - Good for development and testing

- **Cons:**
  - Must register phone numbers first
  - Messages prefixed with "AT-Sandbox:"
  - Limited to registered numbers only

- **Best for:**
  - Development
  - Testing the system
  - Demo purposes

### Production (Paid):
- **Pros:**
  - Send to any phone number
  - No "AT-Sandbox:" prefix
  - Professional appearance
  - Delivery reports

- **Cons:**
  - Requires SMS credits
  - Costs money per SMS

- **Best for:**
  - Live deployment
  - Real elderly care
  - Production use

---

## Cost Estimates

**SMS Pricing (approximate per message):**
- Kenya: $0.01
- Uganda: $0.015
- Tanzania: $0.02
- Rwanda: $0.015

**Example Scenario:**
- 10 elderly people
- 3 reminders per day each
- 30 days per month
- Total: 900 SMS/month
- **Cost: $9-18/month**

**Voice Call Pricing:**
- ~$0.05 - $0.10 per minute

---

## Getting More Help

### Check Edge Function Logs:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click on **Logs**
4. Look for `send-sms` or `send-reminder` function logs
5. Check for error messages

### Check Africa's Talking Logs:
1. Log in to Africa's Talking
2. Go to **SMS** → **SMS Logs**
3. Find your messages
4. Check delivery status and errors

### Contact Support:
- **Africa's Talking Support:** support@africastalking.com
- **Africa's Talking Docs:** https://developers.africastalking.com/

---

## Quick Reference

### Required Secrets:
```
AFRICASTALKING_API_KEY=atsk_your_api_key_here
AFRICASTALKING_USERNAME=sandbox (or your production username)
```

### Phone Number Format:
```
+[country_code][phone_number]
Example: +254712345678
```

### Sandbox Setup:
1. Sign up → Get API Key → Configure in Supabase → Register test numbers → Test

### Production Setup:
1. Sign up → Verify account → Buy credits → Get API Key → Configure in Supabase → Test

---

## Summary

**The SMS is not sending because Africa's Talking API credentials are not configured.**

**To fix:**
1. ✅ Sign up at africastalking.com
2. ✅ Get API Key and Username
3. ✅ Add secrets to Supabase Edge Functions
4. ✅ For sandbox: Register test phone numbers
5. ✅ Test with "Send Now" button

**Once configured, SMS will work automatically!**
