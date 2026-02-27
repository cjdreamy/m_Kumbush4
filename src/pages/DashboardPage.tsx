import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageMeta from '@/components/common/PageMeta';
import { generateCareInsights } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';
import { getDashboardStats, getAdherenceStats } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardStats } from '@/types/database';
import {
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  TrendingUp,
  Sparkles,
  Loader2,
  BarChart3
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adherenceData, setAdherenceData] = useState<{ date: string; confirmed: number; missed: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [profile]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const caregiverId = profile?.role === 'admin' ? undefined : profile?.id;
      const [statsData, chartData] = await Promise.all([
        getDashboardStats(caregiverId),
        getAdherenceStats(caregiverId)
      ]);
      setStats(statsData);
      setAdherenceData(chartData);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAiInsight = async () => {
    if (!stats) return;
    try {
      setAiLoading(true);
      const adherenceHistory = adherenceData.map(d => `${d.date}: ${d.confirmed} confirmed, ${d.missed} missed`).join('\n');

      const context = `Current Stats:
- Total Elderly: ${stats.total_elderly}
- Active Schedules: ${stats.active_schedules}
- Pending Reminders: ${stats.pending_reminders}
- Missed Today: ${stats.missed_reminders_today}
- Confirmed Today: ${stats.confirmed_reminders_today}
- Sent Today: ${stats.reminders_sent_today}

Last 7 Days Adherence History:
${adherenceHistory} `;

      const insight = await generateCareInsights(context);
      setAiInsight(insight);
    } catch (error) {
      console.error('Failed to generate AI insight:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Elderly',
      value: stats?.total_elderly || 0,
      icon: Users,
      description: 'People under care',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Schedules',
      value: stats?.active_schedules || 0,
      icon: Calendar,
      description: 'Reminder schedules',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Pending Reminders',
      value: stats?.pending_reminders || 0,
      icon: Clock,
      description: 'Awaiting delivery',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      title: 'Confirmed Today',
      value: stats?.confirmed_reminders_today || 0,
      icon: CheckCircle2,
      description: 'Successfully confirmed',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      title: 'Sent Today',
      value: stats?.reminders_sent_today || 0,
      icon: TrendingUp,
      description: 'Reminders delivered',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Missed Today',
      value: stats?.missed_reminders_today || 0,
      icon: XCircle,
      description: 'Requires attention',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <DashboardLayout>
      <PageMeta title="M-Kumbusha | Dashboard" description="Elderly care reminder dashboard" />
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {String(profile?.full_name || 'User')}! Here's your healthcare reminder overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/elderly/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Elderly
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24 bg-muted" />
                  <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1 bg-muted" />
                  <Skeleton className="h-3 w-32 bg-muted" />
                </CardContent>
              </Card>
            ))
          ) : (
            statCards.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`h - 8 w - 8 rounded - full ${stat.bgColor} flex items - center justify - center`}>
                    <stat.icon className={`h - 4 w - 4 ${stat.color} `} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Adherence Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Care Adherence Trends
              </CardTitle>
              <CardDescription>
                Overview of reminder confirmations vs missed events over the last 7 days
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loading ? (
                <Skeleton className="h-full w-full bg-muted" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar
                      name="Confirmed"
                      dataKey="confirmed"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                    <Bar
                      name="Missed"
                      dataKey="missed"
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Insight Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Smart Care Insights
              </CardTitle>
              <CardDescription>
                AI-generated suggestions based on your data trends
              </CardDescription>
            </div>
            <Button
              onClick={getAiInsight}
              disabled={aiLoading || !stats}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {aiInsight ? 'Refresh Insights' : 'Generate Insights'}
            </Button>
          </CardHeader>
          <CardContent>
            {aiInsight ? (
              <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{aiInsight}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center gap-2 py-4">
                <AlertCircle className="h-4 w-4" />
                Click the button above to analyze your current statistics and get caregiver advice.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage elderly care
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/elderly/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Elderly Person
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/schedules">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Schedules
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/logs">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  View Reminder Logs
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                About M-Kumbusha platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Multi-Channel Support</p>
                  <p className="text-xs text-muted-foreground">
                    SMS and voice call reminders for elderly care
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Flexible Scheduling</p>
                  <p className="text-xs text-muted-foreground">
                    Daily, weekly, or custom reminder schedules
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm font-medium">Escalation Logic</p>
                  <p className="text-xs text-muted-foreground">
                    Automatic caregiver notifications for missed reminders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout >
  );
}
