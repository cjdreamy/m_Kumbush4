# Complete Your Africa's Talking Setup

## What You Have
✅ **Username**: `sandbox`  
✅ **App Name**: Sandbox

## What You Still Need
❌ **API Key**: Required to send SMS and voice calls

---

## How to Get Your API Key

### Step 1: Log in to Africa's Talking
1. Go to [https://account.africastalking.com/](https://account.africastalking.com/)
2. Log in with your credentials

### Step 2: Find Your API Key
1. Once logged in, you'll see your **Dashboard**
2. Look for **Settings** in the left sidebar or top menu
3. Click on **API Key**
4. You'll see your API Key - it looks like: `atsk_1234567890abcdefghijklmnopqrstuvwxyz...`
5. **Copy** this entire key

### Step 3: Configure in Supabase

You need to add TWO secrets to your Supabase project:

#### Secret 1: API Key
- **Name**: `AFRICASTALKING_API_KEY`
- **Value**: Paste your API key (the long string starting with `atsk_`)

#### Secret 2: Username
- **Name**: `AFRICASTALKING_USERNAME`
- **Value**: `sandbox`

### How to Add Secrets in Supabase:
1. Go to your **Supabase Dashboard**
2. Select your M-Kumbusha project
3. Navigate to **Project Settings** (gear icon in bottom left)
4. Click on **Edge Functions** in the left menu
5. Scroll down to **Secrets** section
6. Click **Add Secret** for each one:
   - First secret: Name = `AFRICASTALKING_API_KEY`, Value = your API key
   - Second secret: Name = `AFRICASTALKING_USERNAME`, Value = `sandbox`
7. Click **Save** or **Add** for each secret

---

## After Configuration

### Step 1: Register Test Phone Numbers
Since you're using the sandbox, you must register phone numbers before sending SMS to them:

1. In Africa's Talking dashboard
2. Go to **Sandbox** → **Voice & SMS**
3. Click **Add Phone Number**
4. Enter your test phone number in international format: `+254712345678`
5. You'll receive an OTP to verify the number
6. Enter the OTP to complete registration
7. Repeat for any other phone numbers you want to test with

### Step 2: Test in M-Kumbusha

1. **Add an Elderly Person:**
   - Go to **Elderly** page in M-Kumbusha
   - Click **Add Elderly Person**
   - Enter the phone number you registered (e.g., `+254712345678`)
   - Fill in other details and save

2. **Create a Schedule:**
   - Go to **Schedules** page
   - Click **Create Schedule**
   - Select the elderly person you just added
   - Fill in reminder details
   - Choose **SMS** or **Both** as the channel
   - Save the schedule

3. **Send Test Reminder:**
   - Find your schedule in the list
   - Click **Send Now** button
   - Confirm the action
   - Wait a few seconds

4. **Verify:**
   - Go to **Reminder Logs** page
   - Look for the latest entry
   - Status should be **"sent"** (green badge)
   - Check your phone - you should receive the SMS with "AT-Sandbox:" prefix

---

## Troubleshooting

### "Failed to send reminder"
- **Check**: Both secrets are configured in Supabase
- **Check**: API Key is correct (copy-paste from dashboard)
- **Check**: Username is exactly `sandbox` (lowercase)

### "Invalid phone number"
- **Use international format**: `+254712345678`
- **No spaces or dashes**: `+254-712-345-678` ❌
- **Include country code**: `0712345678` ❌

### SMS not received
- **Check**: Phone number is registered in Africa's Talking sandbox
- **Check**: Phone has signal and SMS inbox isn't full
- **Check**: Africa's Talking SMS logs for delivery status

---

## Quick Checklist

- [ ] Logged in to Africa's Talking
- [ ] Found API Key in Settings → API Key
- [ ] Copied the entire API Key
- [ ] Added `AFRICASTALKING_API_KEY` secret in Supabase
- [ ] Added `AFRICASTALKING_USERNAME` secret with value `sandbox` in Supabase
- [ ] Registered test phone numbers in Africa's Talking sandbox
- [ ] Added elderly person with registered phone number in M-Kumbusha
- [ ] Created a test schedule
- [ ] Clicked "Send Now"
- [ ] Checked Reminder Logs - status is "sent"
- [ ] Received SMS on phone

---

## Example Configuration

```
Supabase Secrets:
┌─────────────────────────────┬──────────────────────────────────────┐
│ Secret Name                 │ Secret Value                         │
├─────────────────────────────┼──────────────────────────────────────┤
│ AFRICASTALKING_API_KEY      │ atsk_abc123def456ghi789...          │
│ AFRICASTALKING_USERNAME     │ sandbox                              │
└─────────────────────────────┴──────────────────────────────────────┘
```

---

## Need Help?

- **Can't find API Key?** Look in Settings → API Key in Africa's Talking dashboard
- **Secrets not saving?** Make sure you're in the correct Supabase project
- **Still not working?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Summary

**You have the username (`sandbox`), now you just need to:**

1. ✅ Get your API Key from Africa's Talking dashboard
2. ✅ Add both secrets to Supabase Edge Functions
3. ✅ Register test phone numbers in Africa's Talking sandbox
4. ✅ Test with "Send Now" in M-Kumbusha

**Once configured, SMS will work! 🎉**
