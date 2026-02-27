import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getAllSchedules, toggleScheduleActive, getReminderLogs } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { ScheduleWithElderly, ReminderLogWithDetails } from '@/types/database';
import { Calendar, Clock, Phone, MessageSquare, Globe, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleWithElderly[]>([]);
  const [logs, setLogs] = useState<ReminderLogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  useEffect(() => {
    loadSchedules();
    loadLogs();

    // Subscribe to realtime logs
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminder_logs'
        },
        () => {
          loadLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await getReminderLogs(5);
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getAllSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleScheduleActive(id, !currentStatus);
      setSchedules(schedules.map(s =>
        s.id === id ? { ...s, is_active: !currentStatus } : s
      ));
      toast.success(`Schedule ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const handleSendNow = async (schedule: ScheduleWithElderly) => {
    if (!schedule.elderly) {
      toast.error('Elderly person not found');
      return;
    }

    setSendingReminder(schedule.id);
    try {
      // Get caregiver ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Construct message
      const message = schedule.language === 'kiswahili'
        ? `Kumbusho: ${schedule.title}. ${schedule.description || ''}`
        : `Reminder: ${schedule.title}. ${schedule.description || ''}`;

      // Send reminder
      const { error } = await supabase.functions.invoke('send-reminder', {
        body: {
          scheduleId: schedule.id,
          elderlyId: schedule.elderly_id,
          caregiverId: user.id,
          message: message,
          channel: schedule.channel,
          language: schedule.language,
        },
      });

      if (error) {
        console.error('Send reminder error:', error);

        let errorMsg = 'Failed to send reminder. Please check your configuration.';
        if (error?.context) {
          try {
            const body = await error.context.json();
            errorMsg = body.error || errorMsg;
          } catch (e) {
            try {
              const text = await error.context.text();
              errorMsg = text || errorMsg;
            } catch (e2) { }
          }
        } else if (error?.message) {
          errorMsg = error.message;
        }

        // Show specific help for AT credentials
        if (errorMsg.includes('AFRICASTALKING') || errorMsg.includes('credentials')) {
          toast.error('Africa\'s Talking API credentials not configured. Please check the setup guide.');
        } else {
          toast.error(errorMsg);
        }
      } else {
        toast.success('Reminder sent successfully!');
        loadSchedules();
        loadLogs();
      }
    } catch (error: any) {
      console.error('Failed to send reminder:', error);
      toast.error(error?.message || 'Failed to send reminder');
    } finally {
      setSendingReminder(null);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'voice':
        return <Phone className="h-4 w-4" />;
      case 'both':
        return <Globe className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medication':
        return 'bg-primary/10 text-primary';
      case 'exercise':
        return 'bg-secondary/10 text-secondary';
      case 'appointment':
        return 'bg-chart-3/10 text-chart-3';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reminder Schedules</h1>
            <p className="text-muted-foreground mt-1">
              Manage reminder schedules for elderly care
            </p>
          </div>
          <Button asChild>
            <Link to="/schedules/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Schedule
            </Link>
          </Button>
        </div>

        {/* Schedules List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-32 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
                Create your first reminder schedule to start sending automated reminders.
              </p>
              <Button asChild>
                <Link to="/schedules/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle>{schedule.title}</CardTitle>
                        <Badge className={getTypeColor(schedule.schedule_type)}>
                          {schedule.schedule_type}
                        </Badge>
                        {schedule.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {schedule.elderly?.full_name}
                      </CardDescription>
                    </div>
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={() => handleToggleActive(schedule.id, schedule.is_active)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {schedule.description && (
                    <p className="text-sm text-muted-foreground">
                      {schedule.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{schedule.time_of_day}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{schedule.frequency}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getChannelIcon(schedule.channel)}
                      <span className="capitalize">{schedule.channel}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{schedule.language}</span>
                    </div>
                  </div>

                  {schedule.days_of_week && schedule.days_of_week.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <Badge
                          key={idx}
                          variant={schedule.days_of_week?.includes(idx) ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Send Now Button */}
                  <div className="pt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={sendingReminder === schedule.id}
                        >
                          <Send className="mr-2 h-3 w-3" />
                          {sendingReminder === schedule.id ? 'Sending...' : 'Send Now'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Send Reminder Now?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will immediately send a {schedule.channel} reminder to {schedule.elderly?.full_name} for: "{schedule.title}"
                            {schedule.elderly?.secondary_contact && (
                              <span className="block mt-2 text-sm">
                                If not confirmed, an alert will be sent to the secondary contact.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleSendNow(schedule)}>
                            Send Reminder
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/logs">View All Logs</Link>
            </Button>
          </div>

          {loadingLogs ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full bg-muted" />
              <Skeleton className="h-12 w-full bg-muted" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No recent activity found.</p>
          ) : (
            <div className="grid gap-3">
              {logs.map((log) => (
                <Card key={log.id} className="bg-muted/30">
                  <CardContent className="p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${log.status === 'sent' || log.status === 'delivered' || log.status === 'confirmed'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-destructive/10 text-destructive'
                        }`}>
                        {log.channel === 'voice' ? <Phone className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {log.status === 'sent' ? 'Sent' : log.status === 'failed' ? 'Failed' : 'Reminder'} to {log.elderly?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.sent_at ? format(new Date(log.sent_at), 'HH:mm:ss') : 'Just now'} - {log.message?.substring(0, 40)}...
                        </p>
                      </div>
                    </div>
                    <Badge variant={log.status === 'failed' ? 'destructive' : 'default'} className="capitalize">
                      {log.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
