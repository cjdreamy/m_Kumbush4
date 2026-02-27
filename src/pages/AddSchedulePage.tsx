import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getElderlyList, createSchedule } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { generateVoiceScript } from '@/lib/gemini';
import { toast } from 'sonner';
import type { Elderly, FrequencyType, ReminderChannel, LanguageType, ScheduleType } from '@/types/database';
import { ArrowLeft, Calendar, Clock, MessageSquare, Phone, Sparkles, Loader2 } from 'lucide-react';

export default function AddSchedulePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [elderlyList, setElderlyList] = useState<Elderly[]>([]);
  // ... rest of state ...

  const [formData, setFormData] = useState({
    elderly_id: '',
    title: '',
    description: '',
    schedule_type: 'medication' as ScheduleType,
    frequency: 'daily' as FrequencyType,
    time_of_day: '09:00',
    channel: 'sms' as ReminderChannel,
    language: 'english' as LanguageType,
    is_active: true,
  });
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    loadElderly();
  }, [profile]);

  const loadElderly = async () => {
    try {
      const caregiverId = profile?.role === 'admin' ? undefined : profile?.id;
      const data = await getElderlyList(caregiverId);
      setElderlyList(data);
    } catch (error) {
      console.error('Failed to load elderly:', error);
    }
  };

  const handleGenerateScript = async () => {
    if (!formData.elderly_id || !formData.title) {
      toast.error('Please select an elderly person and enter a title first');
      return;
    }

    const selectedElderly = elderlyList.find(e => e.id === formData.elderly_id);
    if (!selectedElderly) return;

    setAiGenerating(true);
    try {
      const script = await generateVoiceScript(
        selectedElderly.full_name,
        formData.title,
        formData.description || 'Take as directed'
      );
      setFormData(prev => ({ ...prev, description: script }));
      toast.success('Voice script generated!');
    } catch (error) {
      console.error('Failed to generate script:', error);
      toast.error('Failed to generate AI script');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.elderly_id) {
      toast.error('Please select an elderly person');
      return;
    }

    setLoading(true);
    try {
      await createSchedule({
        elderly_id: formData.elderly_id,
        title: formData.title,
        description: formData.description || '',
        schedule_type: formData.schedule_type,
        frequency: formData.frequency,
        time_of_day: formData.time_of_day,
        days_of_week: formData.frequency === 'weekly' ? selectedDays : [],
        custom_dates: [],
        channel: formData.channel,
        language: formData.language,
        is_active: formData.is_active,
      });

      toast.success('Reminder schedule created successfully');
      navigate('/schedules');
    } catch (error) {
      console.error('Failed to create schedule:', error);
      toast.error('Failed to create reminder schedule');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const weekDays = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/schedules')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Reminder Schedule</h1>
            <p className="text-muted-foreground mt-1">
              Set up automated reminders for elderly care
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Schedule Details</CardTitle>
              <CardDescription>
                Configure when and how reminders should be sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Elderly Selection */}
              <div className="space-y-2">
                <Label htmlFor="elderly_id">Select Elderly Person *</Label>
                <Select
                  value={formData.elderly_id}
                  onValueChange={(value) => setFormData({ ...formData, elderly_id: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose elderly person" />
                  </SelectTrigger>
                  <SelectContent>
                    {elderlyList.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Reminder Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Take blood pressure medication"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Voice script / Description</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[10px] uppercase font-bold tracking-wider text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                    onClick={handleGenerateScript}
                    disabled={aiGenerating || loading}
                  >
                    {aiGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Magic Generate
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Additional instructions or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Schedule Type */}
              <div className="space-y-2">
                <Label htmlFor="schedule_type">Type *</Label>
                <Select
                  value={formData.schedule_type}
                  onValueChange={(value: ScheduleType) => setFormData({ ...formData, schedule_type: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time_of_day">Time *</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time_of_day"
                    type="time"
                    value={formData.time_of_day}
                    onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: FrequencyType) => {
                    setFormData({ ...formData, frequency: value });
                    if (value === 'daily') setSelectedDays([]);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Days of Week (for weekly) */}
              {formData.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label>Select Days *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {weekDays.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={selectedDays.includes(day.value)}
                          onCheckedChange={() => toggleDay(day.value)}
                          disabled={loading}
                        />
                        <Label
                          htmlFor={`day-${day.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Channel */}
              <div className="space-y-2">
                <Label htmlFor="channel">Notification Channel *</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value: ReminderChannel) => setFormData({ ...formData, channel: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SMS Only
                      </div>
                    </SelectItem>
                    <SelectItem value="voice">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Voice Call Only
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Both SMS & Voice
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value: LanguageType) => setFormData({ ...formData, language: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="kiswahili">Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                  disabled={loading}
                />
                <Label htmlFor="is_active" className="text-sm font-normal cursor-pointer">
                  Activate this schedule immediately
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Schedule'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/schedules')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
