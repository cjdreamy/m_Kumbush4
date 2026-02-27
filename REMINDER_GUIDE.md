# M-Kumbusha - Reminder & Confirmation System Guide

## Overview
M-Kumbusha now includes comprehensive reminder scheduling, manual sending, and confirmation tracking with automatic escalation to secondary contacts.

---

## ⚠️ IMPORTANT: Setup Required

**Before you can send SMS or voice reminders, you MUST configure Africa's Talking API credentials.**

### Quick Setup (5 minutes):
1. **Sign up** at [africastalking.com](https://africastalking.com/) (free sandbox available)
2. **Get credentials** from dashboard: API Key + Username
3. **Configure in Supabase**: Add `AFRICASTALKING_API_KEY` and `AFRICASTALKING_USERNAME` secrets
4. **For sandbox**: Register test phone numbers in Africa's Talking dashboard
5. **Test**: Use "Send Now" button on any schedule

📖 **Detailed instructions:** See [SMS_SETUP_GUIDE.md](./SMS_SETUP_GUIDE.md)  
🔧 **Troubleshooting:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Key Features

### 1. Create Reminder Schedules
**Location:** Schedules page → "Create Schedule" button

**Steps:**
1. Navigate to the Schedules page
2. Click "Create Schedule"
3. Fill in the schedule details:
   - **Select Elderly Person**: Choose who will receive the reminder
   - **Reminder Title**: e.g., "Take blood pressure medication"
   - **Description**: Additional instructions (optional)
   - **Type**: Medication, Exercise, Appointment, or Custom
   - **Time**: Set the specific time for the reminder (e.g., 09:00 AM)
   - **Frequency**: 
     - Daily: Sends every day at the specified time
     - Weekly: Select specific days of the week
     - Custom: For irregular schedules
   - **Channel**: 
     - SMS Only: Text message reminder
     - Voice Call Only: Automated voice call
     - Both: Sends both SMS and voice call
   - **Language**: English or Kiswahili
   - **Active Status**: Enable to start sending immediately

4. Click "Create Schedule"

### 2. Send Reminders Immediately
**Location:** Schedules page → "Send Now" button on each schedule

**How it works:**
1. Find the schedule you want to trigger
2. Click "Send Now" button
3. Confirm the action in the dialog
4. The system will immediately send the reminder via the configured channel (SMS/Voice/Both)
5. A reminder log entry is created for tracking

**Use cases:**
- Test a new schedule before it runs automatically
- Send an urgent reminder outside the regular schedule
- Manually trigger a reminder if the elderly person forgot

### 3. Confirmation Tracking
**Location:** Reminder Logs page

**How it works:**
1. After a reminder is sent, it appears in the Reminder Logs with status "sent" or "delivered"
2. Caregivers can manually confirm if the elderly person completed the task:
   - Click **"Confirm"** button: Marks the reminder as successfully completed
   - Click **"Mark as Missed"** button: Marks the reminder as missed

**Automatic Escalation:**
When a reminder is marked as "Missed":
1. An alert SMS is automatically sent to the **secondary contact** (if configured)
2. An alert SMS is also sent to the **caregiver's notification forwarding number** (if configured)
3. The alert message includes:
   - Elderly person's name
   - The missed reminder title
   - Request to check on them

### 4. Secondary Contact Setup
**Location:** Elderly Management → Add/Edit Elderly Person

**Configuration:**
- **Primary Contact**: The elderly person's phone number (receives reminders)
- **Secondary Contact**: Backup contact number (receives escalation alerts)

**Example:**
- Primary: +254712345678 (Elderly person's phone)
- Secondary: +254798765432 (Family member or next of kin)

### 5. Caregiver Notification Setup
**Location:** Profile page

**Configuration:**
- **Notification Forwarding Number**: Your phone number to receive escalation alerts
- When an elderly person misses a reminder, you'll receive an SMS alert

## Workflow Example

### Scenario: Daily Medication Reminder

1. **Setup (One-time)**
   - Add elderly person: "John Doe"
   - Primary contact: +254712345678
   - Secondary contact: +254798765432 (daughter)
   - Create schedule:
     - Title: "Take blood pressure medication"
     - Time: 09:00 AM
     - Frequency: Daily
     - Channel: Both (SMS + Voice)
     - Language: English

2. **Daily Operation**
   - At 9:00 AM, John receives:
     - SMS: "Reminder: Take blood pressure medication"
     - Voice call with the same message
   - Reminder appears in logs with status "sent"

3. **Confirmation**
   - Caregiver checks the Reminder Logs
   - If John took the medication:
     - Click "Confirm" → Status changes to "confirmed"
   - If John missed it:
     - Click "Mark as Missed" → Status changes to "missed"
     - Automatic escalation:
       - SMS sent to daughter (+254798765432)
       - SMS sent to caregiver's notification number
       - Message: "Alert: John Doe missed their reminder: Take blood pressure medication. Please check on them."

4. **Manual Trigger (if needed)**
   - If John forgot at 9 AM, caregiver can:
     - Go to Schedules page
     - Click "Send Now" on the medication reminder
     - John receives the reminder immediately

## API Integration Notes

### Africa's Talking Setup
The system uses Africa's Talking for SMS and voice calls. You need to configure:

1. **AFRICASTALKING_API_KEY**: Your API key from Africa's Talking dashboard
2. **AFRICASTALKING_USERNAME**: Your username (usually 'sandbox' for testing)

These are configured as secrets in the Supabase Edge Functions.

### Edge Functions
Three main functions handle reminders:

1. **send-sms**: Sends SMS messages
2. **send-voice**: Makes voice calls
3. **send-reminder**: Orchestrates sending reminders (calls send-sms and/or send-voice)
4. **confirm-reminder**: Handles confirmation and escalation logic

## Best Practices

1. **Always set a secondary contact** for critical reminders (medications, appointments)
2. **Test schedules** using "Send Now" before relying on automatic scheduling
3. **Check Reminder Logs daily** to confirm elderly people are following their routines
4. **Use "Both" channel** for important reminders to ensure delivery
5. **Set up notification forwarding** in your profile to receive escalation alerts
6. **Use descriptive titles** for reminders so escalation messages are clear

## Troubleshooting

### Reminder not sent
- Check if the schedule is active (toggle switch should be ON)
- Verify the elderly person has a valid primary contact number
- Check Reminder Logs for error messages

### Escalation not working
- Verify secondary contact is configured for the elderly person
- Check if notification forwarding number is set in caregiver profile
- Review Reminder Logs for escalation status

### Voice calls not working
- Ensure Africa's Talking account has voice call credits
- Verify the phone number format is correct (+254...)
- Check Edge Function logs for errors

## Support

For technical issues:
1. Check the Reminder Logs for error messages
2. Verify all contact numbers are in correct format
3. Ensure Africa's Talking credentials are properly configured
4. Contact system administrator if issues persist
