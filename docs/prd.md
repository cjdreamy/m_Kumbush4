# M-Kumbusha Requirements Document

## 1. Application Overview

### 1.1 Application Name
M-Kumbusha

### 1.2 Application Description
M-Kumbusha is a multi-channel healthcare reminder and caregiver support platform designed to help elderly people in low-connectivity and rural areas stay consistent with medication, exercise, and care routines. The system supports both basic feature phone users (via USSD, SMS, and voice calls) and smartphone/internet users (via web app dashboard).

## 2. Core Features

### 2.1 For Users WITHOUT Smartphones (Feature Phones)

#### 2.1.1 USSD Onboarding
- Allow caregiver registration via USSD
- Collect and store the following information:
  - Caregiver name
  - Relationship to elderly (employed caregiver, relative, next of kin)
  - Phone number
  - Backup contact number
  - Elderly name
  - Elderly phone number (if available)
- Store all data securely in backend database

#### 2.1.2 SMS Reminders
- Send scheduled SMS reminders to elderly person and caregiver
- Support specific time configuration for each reminder
- Example messages:
  - It's time to take your BP medication
  - Time for your 10-minute walk
- Log reminder status (sent / failed)
- Send confirmation request to secondary number after reminder is sent
- Track confirmation responses

#### 2.1.3 Voice Call Reminders
- Automated voice calls using text-to-speech
- Support specific time configuration for each reminder
- Support language options: Kiswahili or English
- If call not answered:
  - Retry after X minutes
  - Notify caregiver
- Send confirmation request to secondary number after call is made
- Track confirmation responses

#### 2.1.4 Escalation Logic
- If reminder is not confirmed:
  - Notify caregiver via SMS
  - If still unresolved: Notify next of kin
- Automatic escalation based on confirmation tracking

### 2.2 For Users WITH Smartphones / Internet

#### 2.2.1 Web App (Caregiver Dashboard)
- Responsive web app with the following modules:

**Caregiver Profile**
- Name
- Relationship
- Contact details
- Employment status
- Emergency contact
- Notification forwarding number

**Elderly Profile**
- Full name
- Age
- Primary contact
- Secondary contact
- Existing medical conditions
- Medication list

**Routine Schedule**
- Medication time
- Exercise reminders
- Doctor appointment reminders

**Reminder Scheduler**
- Custom reminder frequency (Daily / Weekly / Custom)
- Notification channel selection (SMS / Voice / Both)
- Language selection (English or Kiswahili)
- Set specific time for SMS reminders
- Set specific time for voice call reminders
- Configure confirmation requests to secondary number
- Send Now button for immediate manual sending of reminders

**Confirmation Tracking**
- View confirmation status for all sent reminders
- Track which reminders were confirmed
- Track which reminders were missed
- View escalation history
- Automatic escalation to secondary contacts when reminders are missed

### 2.3 Accessibility Feature

#### 2.3.1 Screen Reader → Kiswahili SMS Converter
- For smartphone users:
  - Convert text instructions into simplified Kiswahili
  - Optional voice playback in Kiswahili
- Address language barriers
- Support elderly with low literacy

## 3. System Requirements

### 3.1 Backend
- Node.js / Python backend
- REST API
- Database (PostgreSQL or Firebase)
- Background job scheduler for reminders
- Real-time confirmation tracking system

### 3.2 Integrations
- SMS Gateway (e.g., Twilio or Africa's Talking)
- Voice call API with Text-to-Speech
- USSD integration

### 3.3 Security
- Role-based access (caregiver/admin)
- Data encryption
- Audit logs for reminders sent

## 4. Smart Features (Optional Enhancements)
- Confirmation system: Reply 1 if medication taken
- Missed reminder analytics
- Health risk scoring
- Emergency broadcast alert button
- Offline-first PWA support

## 5. UX Requirements
- Clean, minimal interface
- Large fonts
- High contrast mode
- Mobile-first design
- Tailwind CSS UI

## 6. Target Region
Design primarily for rural African communities with:
- Limited connectivity
- Language diversity
- Feature phone usage

## 7. Output Expectations
- Full database schema
- API endpoints list
- UI wireframe layout
- SMS/Voice flow logic
- Deployment guide (cloud + telecom integration)