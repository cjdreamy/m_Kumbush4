import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getElderlyList } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Elderly } from '@/types/database';
import { Plus, User, Phone, Calendar, AlertCircle, Send, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

export default function ElderlyListPage() {
  const { profile } = useAuth();
  const [elderly, setElderly] = useState<Elderly[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingSms, setSendingSms] = useState<string | null>(null);
  const [smsMessage, setSmsMessage] = useState('');

  const handleSendInstantSms = async (person: Elderly) => {
    if (!smsMessage) return;
    if (!person.primary_contact) {
      toast.error('No primary contact for this person');
      return;
    }

    setSendingSms(person.id);
    try {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: person.primary_contact,
          message: smsMessage,
          elderlyId: person.id,
          caregiverId: profile?.id,
        },
      });

      if (error) throw error;

      toast.success('Instant SMS sent successfully!');
      setSmsMessage('');
    } catch (error) {
      console.error('Failed to send instant SMS:', error);
      toast.error('Failed to send SMS. Check your configuration.');
    } finally {
      setSendingSms(null);
    }
  };

  useEffect(() => {
    loadElderly();
  }, [profile]);

  const loadElderly = async () => {
    try {
      setLoading(true);
      const caregiverId = profile?.role === 'admin' ? undefined : profile?.id;
      const data = await getElderlyList(caregiverId);
      setElderly(data);
    } catch (error) {
      console.error('Failed to load elderly:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Elderly Care</h1>
            <p className="text-muted-foreground mt-1">
              Manage elderly people under your care
            </p>
          </div>
          <Button asChild>
            <Link to="/elderly/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Elderly Person
            </Link>
          </Button>
        </div>

        {/* Elderly List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-24 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : elderly.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No elderly people yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
                Start by adding an elderly person to manage their healthcare reminders and schedules.
              </p>
              <Button asChild>
                <Link to="/elderly/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Elderly Person
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {elderly.map((person) => (
              <Card key={person.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{person.full_name}</CardTitle>
                        {person.age && (
                          <CardDescription>{person.age} years old</CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {person.primary_contact && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{person.primary_contact}</span>
                    </div>
                  )}

                  {person.medical_conditions && person.medical_conditions.length > 0 && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {person.medical_conditions.slice(0, 3).map((condition: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                        {person.medical_conditions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{person.medical_conditions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Send className="mr-2 h-3 w-3" />
                          Send Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Instant SMS</DialogTitle>
                          <DialogDescription>
                            Send a quick message to {person.full_name}. This will use the alphanumeric sender ID "M_kumbusha".
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                              id="message"
                              placeholder="Type your message here..."
                              value={smsMessage}
                              onChange={(e) => setSmsMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => handleSendInstantSms(person)}
                            disabled={!smsMessage || sendingSms === person.id}
                          >
                            {sendingSms === person.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send SMS
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/schedules?elderly=${person.id}`}>
                        <Calendar className="mr-2 h-3 w-3" />
                        Schedules
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
