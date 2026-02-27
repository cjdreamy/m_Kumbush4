# M-Kumbusha - Healthcare Reminder & Caregiver Support Platform

Live Demo: [https://m-kumbusha.onrender.com/](https://m-kumbusha.onrender.com/)

A comprehensive multi-channel healthcare reminder and caregiver support platform designed for elderly care in rural Africa. Supports both feature phone users (via SMS and voice calls) and smartphone users (via web dashboard).

---

## 🚀 Quick Start

### 1. First Time Setup

**Register an Account:**
1. Open the application
2. Click "Register"
3. Create a username and password
4. The first user automatically becomes an admin

**Configure SMS/Voice (Required):**
1. Sign up at [africastalking.com](https://africastalking.com/) (free sandbox available)
2. Get your API Key and Username from the dashboard
3. Enter credentials when prompted in the application
4. For sandbox: Register test phone numbers in Africa's Talking dashboard

📖 **Full setup guide:** [SMS_SETUP_GUIDE.md](./SMS_SETUP_GUIDE.md)

---

## 📱 Features

### For Caregivers:
- **Dashboard**: Overview of all elderly people, schedules, and reminder statistics
- **AI Care Assistant**: Chat with Gemini AI for healthcare guidance and medication advice
- **Trend Analytics**: Visualize 7-day adherence patterns with interactive charts
- **Elderly Management**: Add and manage elderly people with medical conditions and contacts
- **Reminder Scheduling**: Create automated reminders for medications, exercise, and appointments
- **Magic Voice Scripts**: Automatically generate personalized, comforting voice scripts via AI
- **Automatic Escalation**: Alerts secondary contacts when reminders are missed
- **Multi-Channel**: Send via SMS, voice calls, or both
- **Multi-Language**: Support for English and Kiswahili

### For Admins:
- **User Management**: View all users and manage roles
- **System Monitoring**: Track reminder success rates and system usage

---

## 📋 User Guide

### Adding an Elderly Person:
1. Go to **Elderly Care** page
2. Click **Add Elderly Person**
3. Fill in details and click **Save**

### Creating a Reminder Schedule:
1. Go to **Schedules** page
2. Click **Create Schedule**
3. Use **"Magic Generate"** to create a personalized voice script via AI
4. Click **Create Schedule**

### AI Assistant:
1. Go to **AI Assistant** page
2. Chat with M-Kumbusha AI about health concerns or care tips
3. The AI provides empathetic, professional advice with safety tips

---

## 🔧 Troubleshooting

### SMS Not Sending?
Check if your Africa's Talking API credentials are configured correctly in the settings or `.env` file. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed help.

---

## 📚 Documentation

- **[REMINDER_GUIDE.md](./REMINDER_GUIDE.md)** - Complete guide to reminder system features
- **[SMS_SETUP_GUIDE.md](./SMS_SETUP_GUIDE.md)** - Step-by-step SMS/voice setup instructions
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions to common issues

---

## 🔐 Security & Privacy

- **Role-based access**: Caregivers can only see their own elderly people
- **Secure authentication**: Encrypted storage and secure session management
- **Data protection**: All health data is handled with strict privacy protocols

---

## 📄 License

Copyright 2026 M-Kumbusha

---

## 🌟 About M-Kumbusha

M-Kumbusha ("Kumbusha" means "remind" in Kiswahili) is designed to bring peace of mind to caregivers and families caring for elderly people in rural Africa. By leveraging AI and multi-channel communication (SMS/voice), we ensure that healthcare reminders reach everyone, regardless of their technology access.

**Mission**: To improve elderly healthcare outcomes through accessible, AI-powered reminder systems.
