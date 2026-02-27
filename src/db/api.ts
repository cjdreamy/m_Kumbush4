import { supabase } from './supabase';
import type {
  Profile,
  Elderly,
  Medication,
  Schedule,
  Reminder,
  ReminderLog,
  ElderlyWithDetails,
  ScheduleWithElderly,
  ReminderLogWithDetails,
  DashboardStats,
  ElderlyFormData,
  ScheduleFormData,
  ProfileFormData,
} from '@/types/database';

// ============= Profile APIs =============

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfile(id: string, updates: Partial<ProfileFormData>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateUserRole(userId: string, role: 'caregiver' | 'admin'): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

// ============= Elderly APIs =============

export async function getElderlyList(caregiverId?: string): Promise<Elderly[]> {
  let query = supabase
    .from('elderly')
    .select('*')
    .order('created_at', { ascending: false });

  if (caregiverId) {
    query = query.eq('caregiver_id', caregiverId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getElderlyById(id: string): Promise<ElderlyWithDetails | null> {
  const { data, error } = await supabase
    .from('elderly')
    .select(`
      *,
      medications(*),
      schedules(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createElderly(elderly: ElderlyFormData & { caregiver_id: string }): Promise<Elderly> {
  const { data, error } = await supabase
    .from('elderly')
    .insert(elderly)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateElderly(id: string, updates: Partial<ElderlyFormData>): Promise<Elderly> {
  const { data, error } = await supabase
    .from('elderly')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteElderly(id: string): Promise<void> {
  const { error } = await supabase
    .from('elderly')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============= Medication APIs =============

export async function getMedicationsByElderly(elderlyId: string): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('elderly_id', elderlyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createMedication(medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .insert(medication)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMedication(id: string): Promise<void> {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============= Schedule APIs =============

export async function getSchedulesByElderly(elderlyId: string): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('elderly_id', elderlyId)
    .order('time_of_day', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getAllSchedules(): Promise<ScheduleWithElderly[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select(`
      *,
      elderly(*)
    `)
    .order('time_of_day', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getActiveSchedules(): Promise<ScheduleWithElderly[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select(`
      *,
      elderly(*)
    `)
    .eq('is_active', true)
    .order('time_of_day', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createSchedule(schedule: ScheduleFormData): Promise<Schedule> {
  const { data, error } = await supabase
    .from('schedules')
    .insert(schedule)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSchedule(id: string, updates: Partial<ScheduleFormData>): Promise<Schedule> {
  const { data, error } = await supabase
    .from('schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleScheduleActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('schedules')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
}

// ============= Reminder APIs =============

export async function getRemindersByStatus(status: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('status', status)
    .order('scheduled_time', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ============= Reminder Log APIs =============

export async function getReminderLogs(limit = 50): Promise<ReminderLogWithDetails[]> {
  const { data, error } = await supabase
    .from('reminder_logs')
    .select(`
      *,
      elderly(*),
      caregiver:profiles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getReminderLogsByElderly(elderlyId: string, limit = 50): Promise<ReminderLog[]> {
  const { data, error } = await supabase
    .from('reminder_logs')
    .select('*')
    .eq('elderly_id', elderlyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ============= Dashboard Stats =============

export async function getDashboardStats(caregiverId?: string): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // Get total elderly count
  let elderlyQuery = supabase
    .from('elderly')
    .select('id', { count: 'exact', head: true });

  if (caregiverId) {
    elderlyQuery = elderlyQuery.eq('caregiver_id', caregiverId);
  }

  const { count: totalElderly } = await elderlyQuery;

  // Get active schedules count
  const { count: activeSchedules } = await supabase
    .from('schedules')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  // Get pending reminders
  const { count: pendingReminders } = await supabase
    .from('reminders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Get today's reminder logs
  let logsQuery = supabase
    .from('reminder_logs')
    .select('status')
    .gte('created_at', todayISO);

  if (caregiverId) {
    logsQuery = logsQuery.eq('caregiver_id', caregiverId);
  }

  const { data: todayLogs } = await logsQuery;

  const missedToday = todayLogs?.filter(log => log.status === 'missed' || log.status === 'failed').length || 0;
  const sentToday = todayLogs?.filter(log => log.status === 'sent' || log.status === 'delivered').length || 0;
  const confirmedToday = todayLogs?.filter(log => log.status === 'confirmed').length || 0;

  return {
    total_elderly: totalElderly || 0,
    active_schedules: activeSchedules || 0,
    pending_reminders: pendingReminders || 0,
    missed_reminders_today: missedToday,
    reminders_sent_today: sentToday,
    confirmed_reminders_today: confirmedToday,
  };
}

export async function getAdherenceStats(caregiverId?: string): Promise<{ date: string; confirmed: number; missed: number; sent: number }[]> {
  const stats: { [key: string]: { confirmed: number; missed: number; sent: number } } = {};
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  // Initialize stats for each day
  last7Days.forEach(date => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    stats[dateStr] = { confirmed: 0, missed: 0, sent: 0 };
  });

  const startDate = last7Days[0].toISOString();

  let query = supabase
    .from('reminder_logs')
    .select('status, created_at')
    .gte('created_at', startDate);

  if (caregiverId) {
    query = query.eq('caregiver_id', caregiverId);
  }

  const { data, error } = await query;
  if (error) throw error;

  data.forEach(log => {
    const dateStr = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (stats[dateStr]) {
      if (log.status === 'confirmed') stats[dateStr].confirmed++;
      else if (log.status === 'missed' || log.status === 'failed') stats[dateStr].missed++;
      else if (log.status === 'sent' || log.status === 'delivered') stats[dateStr].sent++;
    }
  });

  return Object.entries(stats).map(([date, counts]) => ({
    date,
    ...counts
  }));
}
