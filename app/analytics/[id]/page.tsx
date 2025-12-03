'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/ui/loader';
import { ArrowLeft, BarChart3, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { Chatbot, ChatSession } from '@/lib/types';
import SessionsList from '@/components/analytics/SessionsList';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import { toast } from 'sonner';

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConversations: 0,
    avgDuration: 0,
    totalMessages: 0,
    activeConversations: 0,
  });

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load chatbot data
      const chatbotRes = await fetch(`/api/chatbot/${resolvedParams.id}`);
      if (!chatbotRes.ok) throw new Error('Failed to load chatbot');
      const chatbotData = await chatbotRes.json();
      setChatbot(chatbotData.chatbot);

      // Load sessions
      const sessionsRes = await fetch(`/api/chatbots/${resolvedParams.id}/sessions`);
      if (!sessionsRes.ok) throw new Error('Failed to load sessions');
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions || []);

      // Calculate stats
      const allSessions = sessionsData.sessions || [];
      const totalConversations = allSessions.length;
      const totalMessages = allSessions.reduce((sum: number, s: ChatSession) => sum + (s.message_count || 0), 0);
      const sessionsWithDuration = allSessions.filter((s: ChatSession) => s.duration_seconds);
      const avgDuration = sessionsWithDuration.length > 0
        ? sessionsWithDuration.reduce((sum: number, s: ChatSession) => sum + (s.duration_seconds || 0), 0) / sessionsWithDuration.length
        : 0;
      const activeConversations = allSessions.filter((s: ChatSession) => !s.ended_at).length;

      setStats({
        totalConversations,
        avgDuration: Math.round(avgDuration),
        totalMessages,
        activeConversations,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Loader size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chatbot not found</h2>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-6 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{chatbot.name}</h1>
              <p className="text-muted-foreground text-lg">Analytics Dashboard</p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl border-2 border-primary/20">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Conversations</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">{stats.totalConversations}</div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-accent">{stats.activeConversations}</span> active
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Avg Duration</CardTitle>
              <div className="p-2 bg-accent/20 rounded-lg">
                <Clock className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">{formatDuration(stats.avgDuration)}</div>
              <p className="text-sm text-muted-foreground">
                Per conversation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Messages</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">{stats.totalMessages}</div>
              <p className="text-sm text-muted-foreground">
                {stats.totalConversations > 0
                  ? `${(stats.totalMessages / stats.totalConversations).toFixed(1)} avg per conversation`
                  : 'No conversations yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Response Rate</CardTitle>
              <div className="p-2 bg-accent/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                {stats.totalConversations > 0
                  ? `${Math.round((sessions.filter(s => (s.message_count || 0) > 2).length / stats.totalConversations) * 100)}%`
                  : '0%'}
              </div>
              <p className="text-sm text-muted-foreground">
                Engaged conversations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AnalyticsCharts chatbotId={resolvedParams.id} />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <SessionsList sessions={sessions} chatbotId={resolvedParams.id} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.totalConversations === 0 ? (
                    <div className="text-center py-16">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No data yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Share your chatbot to start tracking conversations
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-5 border border-border rounded-lg bg-card/50">
                        <h4 className="font-semibold text-foreground text-sm mb-2">
                          Engagement
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {sessions.filter(s => (s.message_count || 0) > 2).length} conversations ({Math.round((sessions.filter(s => (s.message_count || 0) > 2).length / stats.totalConversations) * 100)}%) had more than 2 messages
                        </p>
                      </div>

                      {stats.avgDuration < 30 && stats.totalConversations > 5 && (
                        <div className="p-5 border border-border rounded-lg bg-card/50">
                          <h4 className="font-semibold text-foreground text-sm mb-2">
                            Quick Sessions
                          </h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Average session duration is {formatDuration(stats.avgDuration)}. Consider reviewing responses for better engagement.
                          </p>
                        </div>
                      )}

                      <div className="p-5 border border-border rounded-lg bg-card/50">
                        <h4 className="font-semibold text-foreground text-sm mb-2">
                          Activity
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {stats.totalMessages} messages across {stats.totalConversations} conversations
                        </p>
                      </div>

                      {sessions.filter(s => !s.ended_at).length > 0 && (
                        <div className="p-5 border border-border rounded-lg bg-card/50">
                          <h4 className="font-semibold text-foreground text-sm mb-2">
                            Active Now
                          </h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {sessions.filter(s => !s.ended_at).length} active conversation(s)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
