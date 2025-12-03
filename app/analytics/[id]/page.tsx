'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chatbot not found</h2>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{chatbot.name}</h1>
              <p className="text-gray-600 mt-1">Analytics Dashboard</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeConversations} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
              <p className="text-xs text-muted-foreground">
                Per conversation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalConversations > 0
                  ? `${(stats.totalMessages / stats.totalConversations).toFixed(1)} avg per conversation`
                  : 'No conversations yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalConversations > 0
                  ? `${Math.round((sessions.filter(s => (s.message_count || 0) > 2).length / stats.totalConversations) * 100)}%`
                  : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
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
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No data yet</h3>
                      <p className="text-gray-600">
                        Share your chatbot to start tracking conversations and getting insights
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-1">Engagement</h4>
                        <p className="text-sm text-blue-800">
                          {sessions.filter(s => (s.message_count || 0) > 2).length} conversations ({Math.round((sessions.filter(s => (s.message_count || 0) > 2).length / stats.totalConversations) * 100)}%) had more than 2 messages, indicating good engagement.
                        </p>
                      </div>

                      {stats.avgDuration < 30 && stats.totalConversations > 5 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-semibold text-yellow-900 mb-1">Quick Sessions</h4>
                          <p className="text-sm text-yellow-800">
                            Average session duration is quite short ({formatDuration(stats.avgDuration)}). Consider reviewing your responses to ensure they're helpful and encourage further interaction.
                          </p>
                        </div>
                      )}

                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-1">Activity</h4>
                        <p className="text-sm text-green-800">
                          You've received {stats.totalMessages} messages across {stats.totalConversations} conversations. Keep providing value to your users!
                        </p>
                      </div>

                      {sessions.filter(s => !s.ended_at).length > 0 && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-1">Active Now</h4>
                          <p className="text-sm text-purple-800">
                            You have {sessions.filter(s => !s.ended_at).length} active conversation(s) happening right now.
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
